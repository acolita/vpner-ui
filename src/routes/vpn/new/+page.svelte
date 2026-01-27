<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import { useToast } from '$lib/stores/toast.svelte';
	import ProfileForm from '$lib/components/ProfileForm.svelte';
	import type { VPNProfile } from '$lib/types';
	import { ArrowLeft, FileText } from 'lucide-svelte';

	const toast = useToast();
	let saving = $state(false);

	// Parse import data from query params if present
	const importData = $derived.by(() => {
		const importParam = $page.url.searchParams.get('import');
		if (!importParam) return null;
		try {
			return JSON.parse(importParam);
		} catch {
			return null;
		}
	});

	// Convert import data to initial profile
	const initialProfile = $derived.by(() => {
		if (!importData) return undefined;

		const profile: Partial<VPNProfile> = {
			name: importData.name || '',
			provider: importData.provider || 'openfortivpn',
			enabled: true,
			auto_connect: false,
			otp_required: importData.otp_required || false,
			routes: [],
			dns: [],
			proxy: [],
			aliases: []
		};

		if (importData.openfortivpn) {
			profile.host = importData.openfortivpn.host;
			profile.port = importData.openfortivpn.port;
			profile.username = importData.openfortivpn.username;
			profile.trusted_cert = importData.openfortivpn.trusted_cert;
		}

		if (importData.openvpn) {
			profile.openvpn = {
				remote: importData.openvpn.remote || '',
				port: importData.openvpn.port || 1194,
				proto: importData.openvpn.proto || 'udp',
				dev: importData.openvpn.dev || 'tun',
				cipher: importData.openvpn.cipher || '',
				auth: importData.openvpn.auth || '',
				ca: importData.openvpn.ca || '',
				cert: importData.openvpn.cert || '',
				key: importData.openvpn.key || '',
				tls_auth: importData.openvpn.tls_auth || '',
				tls_auth_direction: importData.openvpn.tls_auth_direction || 0
			};
		}

		return profile as VPNProfile;
	});

	async function handleSave(profile: Partial<VPNProfile>) {
		saving = true;
		try {
			await api.post('/vpns', profile);
			toast.success(`Created profile: ${profile.name}`);
			goto(`/vpn/${profile.name}`);
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Failed to create profile');
		} finally {
			saving = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/" class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700" title="Back">
			<ArrowLeft class="h-5 w-5" />
		</a>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create VPN Profile</h1>
	</div>

	{#if importData}
		<div class="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
			<FileText class="h-5 w-5" />
			<span>Imported from {importData.provider} config. Review and complete the settings below.</span>
		</div>
	{/if}

	<ProfileForm profile={initialProfile} onSave={handleSave} {saving} />
</div>
