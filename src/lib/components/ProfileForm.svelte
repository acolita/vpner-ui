<script lang="ts">
	import { Save, Trash2 } from 'lucide-svelte';
	import type { VPNProfile, Route, DNSEntry } from '$lib/types';
	import RouteEditor from './RouteEditor.svelte';
	import DNSEditor from './DNSEditor.svelte';
	import OpenFortiFields from './OpenFortiFields.svelte';
	import OpenVPNFields from './OpenVPNFields.svelte';

	interface Props {
		profile?: VPNProfile;
		onSave: (profile: Partial<VPNProfile>) => Promise<void>;
		onDelete?: () => void;
		saving?: boolean;
	}

	let { profile, onSave, onDelete, saving = false }: Props = $props();

	// Form state
	let name = $state(profile?.name ?? '');
	let provider = $state<'openfortivpn' | 'openvpn'>(profile?.provider ?? 'openfortivpn');
	let enabled = $state(profile?.enabled ?? true);
	let autoConnect = $state(profile?.auto_connect ?? false);
	let routes = $state<Route[]>(profile?.routes ?? []);
	let dns = $state<DNSEntry[]>(profile?.dns ?? []);

	// Provider-specific state
	let fortiConfig = $state({
		host: profile?.host ?? '',
		port: profile?.port ?? 443,
		username: profile?.username ?? '',
		password: profile?.password ?? '',
		trusted_cert: profile?.trusted_cert ?? '',
		config_path: profile?.config_path ?? ''
	});

	let openvpnConfig = $state({
		remote: profile?.openvpn?.remote ?? '',
		port: profile?.openvpn?.port ?? 1194,
		proto: profile?.openvpn?.proto ?? 'udp',
		dev: profile?.openvpn?.dev ?? 'tun',
		cipher: profile?.openvpn?.cipher ?? 'AES-256-GCM',
		auth: profile?.openvpn?.auth ?? 'SHA256',
		ca: profile?.openvpn?.ca ?? '',
		cert: profile?.openvpn?.cert ?? '',
		key: profile?.openvpn?.key ?? '',
		config_path: profile?.config_path ?? ''
	});

	// Validation
	let errors = $state<Record<string, string>>({});

	function validate(): boolean {
		errors = {};

		if (!name.trim()) {
			errors.name = 'Name is required';
		} else if (!/^[a-z0-9-]+$/.test(name)) {
			errors.name = 'Name must be lowercase alphanumeric with dashes';
		}

		if (provider === 'openfortivpn') {
			if (!fortiConfig.host && !fortiConfig.config_path) {
				errors.host = 'Host or config file is required';
			}
		} else {
			if (!openvpnConfig.remote && !openvpnConfig.config_path) {
				errors.remote = 'Remote or config file is required';
			}
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!validate()) return;

		const data: Partial<VPNProfile> = {
			name,
			provider,
			enabled,
			auto_connect: autoConnect,
			routes,
			dns
		};

		if (provider === 'openfortivpn') {
			Object.assign(data, {
				host: fortiConfig.host || undefined,
				port: fortiConfig.port,
				username: fortiConfig.username || undefined,
				password: fortiConfig.password || undefined,
				trusted_cert: fortiConfig.trusted_cert || undefined,
				config_path: fortiConfig.config_path || undefined
			});
		} else {
			data.openvpn = {
				remote: openvpnConfig.remote,
				port: openvpnConfig.port,
				proto: openvpnConfig.proto as 'udp' | 'tcp',
				dev: openvpnConfig.dev as 'tun' | 'tap',
				cipher: openvpnConfig.cipher,
				auth: openvpnConfig.auth,
				ca: openvpnConfig.ca || undefined,
				cert: openvpnConfig.cert || undefined,
				key: openvpnConfig.key || undefined
			};
			if (openvpnConfig.config_path) {
				data.config_path = openvpnConfig.config_path;
			}
		}

		await onSave(data);
	}

	const isEdit = $derived(!!profile);
</script>

<form onsubmit={handleSubmit} class="space-y-6">
	<!-- Basic Info -->
	<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<h2 class="mb-4 text-lg font-semibold">Basic Information</h2>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label for="name" class="mb-1 block text-sm font-medium">Name *</label>
				<input
					id="name"
					bind:value={name}
					type="text"
					disabled={isEdit}
					placeholder="my-vpn"
					class="w-full rounded-lg border p-2 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:disabled:bg-gray-600"
					class:border-red-500={errors.name}
				/>
				{#if errors.name}
					<p class="mt-1 text-sm text-red-500">{errors.name}</p>
				{/if}
			</div>

			<div>
				<label for="provider" class="mb-1 block text-sm font-medium">Provider *</label>
				<select
					id="provider"
					bind:value={provider}
					disabled={isEdit}
					class="w-full rounded-lg border p-2 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:disabled:bg-gray-600"
				>
					<option value="openfortivpn">openfortivpn (FortiGate)</option>
					<option value="openvpn">OpenVPN</option>
				</select>
			</div>

			<div class="flex items-center gap-6">
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={enabled} class="rounded" />
					<span class="text-sm">Enabled</span>
				</label>

				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={autoConnect} class="rounded" />
					<span class="text-sm">Auto-connect on startup</span>
				</label>
			</div>
		</div>
	</div>

	<!-- Provider-Specific Fields -->
	{#if provider === 'openfortivpn'}
		<OpenFortiFields bind:config={fortiConfig} {errors} />
	{:else}
		<OpenVPNFields bind:config={openvpnConfig} {errors} />
	{/if}

	<!-- Routes -->
	<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<h2 class="mb-4 text-lg font-semibold">Routes</h2>
		<RouteEditor bind:routes />
	</div>

	<!-- DNS -->
	<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<h2 class="mb-4 text-lg font-semibold">DNS Entries</h2>
		<DNSEditor bind:entries={dns} />
	</div>

	<!-- Actions -->
	<div class="flex justify-between">
		{#if onDelete && isEdit}
			<button
				type="button"
				onclick={onDelete}
				class="flex items-center gap-2 rounded-lg px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
			>
				<Trash2 class="h-4 w-4" />
				Delete Profile
			</button>
		{:else}
			<div></div>
		{/if}

		<button
			type="submit"
			disabled={saving}
			class="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
		>
			<Save class="h-4 w-4" />
			{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Profile'}
		</button>
	</div>
</form>
