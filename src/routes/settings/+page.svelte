<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { useAuth } from '$lib/auth.svelte';
	import { useToast } from '$lib/stores/toast.svelte';
	import AdminUsersPanel from '$lib/components/AdminUsersPanel.svelte';
	import {
		Settings,
		Server,
		User,
		Shield,
		Moon,
		Sun,
		LogOut,
		RefreshCw,
		Activity,
		Clock,
		Network,
		Key,
		Globe,
		Route,
		Link,
		FileText,
		Save,
		ChevronDown,
		ChevronRight
	} from 'lucide-svelte';
	import type { SettingsByCategory } from '$lib/types';

	interface HealthStatus {
		status: string;
		uptime: string;
		vpns: {
			connected: number;
			healthy: number;
			total: number;
		};
	}

	interface UserInfo {
		username: string;
		roles?: string[];
		vpns?: string[];
		issued_at?: string;
		expires_at?: string;
	}

	const auth = useAuth();
	const toast = useToast();

	let health = $state<HealthStatus | null>(null);
	let userInfo = $state<UserInfo | null>(null);
	let settings = $state<SettingsByCategory>({});
	let loading = $state(true);
	let saving = $state(false);
	let darkMode = $state(false);

	// Section collapse state
	let expandedSections = $state<Record<string, boolean>>({
		server: true,
		network: true,
		auth: true,
		jwt: false,
		dns: false,
		defaultRoute: false,
		traefik: false,
		logging: false,
		session: true,
		appearance: true
	});

	// Editable settings state
	let editedSettings = $state<Record<string, string | number | boolean>>({});
	let hasChanges = $derived(Object.keys(editedSettings).length > 0);

	onMount(() => {
		darkMode = document.documentElement.classList.contains('dark');
		refresh();
	});

	async function refresh() {
		loading = true;
		try {
			const [h, u, s] = await Promise.all([
				api.get<HealthStatus>('/health'),
				api.get<UserInfo>('/auth/me'),
				api.getSettings()
			]);
			health = h;
			userInfo = u;
			settings = s;
			editedSettings = {};
		} catch (err) {
			console.error('Failed to load settings data:', err);
		} finally {
			loading = false;
		}
	}

	async function saveSettings() {
		if (!hasChanges) return;

		saving = true;
		try {
			await api.updateSettings(editedSettings);
			toast.success('Settings saved');
			editedSettings = {};
			await refresh();
		} catch (err: unknown) {
			const e = err as { message?: string };
			toast.error(e.message ?? 'Failed to save settings');
		} finally {
			saving = false;
		}
	}

	function getSettingValue(category: string, key: string): string {
		const fullKey = `${category}.${key}`;
		if (fullKey in editedSettings) {
			return String(editedSettings[fullKey]);
		}
		const categorySettings = settings[category] ?? [];
		const setting = categorySettings.find((s) => s.key === fullKey);
		return setting?.value ?? '';
	}

	function getSettingBool(category: string, key: string): boolean {
		const value = getSettingValue(category, key);
		return value === 'true' || value === '1';
	}

	function updateSetting(category: string, key: string, value: string | boolean) {
		const fullKey = `${category}.${key}`;
		const strValue = String(value);

		// Check if it's the same as original
		const categorySettings = settings[category] ?? [];
		const original = categorySettings.find((s) => s.key === fullKey);
		if (original?.value === strValue) {
			// Remove from edited if back to original
			const { [fullKey]: _, ...rest } = editedSettings;
			editedSettings = rest;
		} else {
			editedSettings = { ...editedSettings, [fullKey]: strValue };
		}
	}

	function toggleDarkMode() {
		darkMode = !darkMode;
		document.documentElement.classList.toggle('dark', darkMode);
		localStorage.setItem('theme', darkMode ? 'dark' : 'light');
	}

	function toggleSection(section: string) {
		expandedSections = { ...expandedSections, [section]: !expandedSections[section] };
	}

	function formatUptime(uptime: string): string {
		const match = uptime.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s)?/);
		if (!match) return uptime;

		const hours = match[1] ? parseInt(match[1]) : 0;
		const minutes = match[2] ? parseInt(match[2]) : 0;
		const seconds = match[3] ? Math.floor(parseFloat(match[3])) : 0;

		const parts = [];
		if (hours > 0) parts.push(`${hours}h`);
		if (minutes > 0) parts.push(`${minutes}m`);
		if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

		return parts.join(' ');
	}

	function formatDate(dateStr: string | undefined): string {
		if (!dateStr) return 'N/A';
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<Settings class="h-6 w-6 text-gray-500" />
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
		</div>
		<div class="flex items-center gap-2">
			{#if hasChanges}
				<button
					onclick={saveSettings}
					disabled={saving}
					class="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
				>
					<Save class="h-4 w-4" />
					{saving ? 'Saving...' : 'Save Changes'}
				</button>
			{/if}
			<button
				onclick={refresh}
				disabled={loading}
				class="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
				title="Refresh"
			>
				<RefreshCw class="h-5 w-5 {loading ? 'animate-spin' : ''}" />
			</button>
		</div>
	</div>

	{#if loading}
		<div class="space-y-4">
			<div class="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
			<div class="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
		</div>
	{:else}
		<!-- Server Status -->
		<div class="rounded-lg bg-white shadow dark:bg-gray-800">
			<button
				onclick={() => toggleSection('server')}
				class="flex w-full items-center justify-between p-4"
			>
				<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
					<Server class="h-5 w-5 text-blue-500" />
					Server Status
				</h2>
				{#if expandedSections.server}
					<ChevronDown class="h-5 w-5 text-gray-500" />
				{:else}
					<ChevronRight class="h-5 w-5 text-gray-500" />
				{/if}
			</button>

			{#if expandedSections.server && health}
				<div class="border-t px-4 pb-4 dark:border-gray-700">
					<div class="mt-4 grid gap-4 md:grid-cols-4">
						<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
							<div class="flex items-center gap-2">
								<Activity class="h-4 w-4 text-gray-500" />
								<span class="text-sm text-gray-500 dark:text-gray-400">Status</span>
							</div>
							<p class="mt-1 font-semibold {health.status === 'healthy' ? 'text-green-600' : 'text-red-600'}">
								{health.status === 'healthy' ? 'Healthy' : health.status}
							</p>
						</div>

						<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
							<div class="flex items-center gap-2">
								<Clock class="h-4 w-4 text-gray-500" />
								<span class="text-sm text-gray-500 dark:text-gray-400">Uptime</span>
							</div>
							<p class="mt-1 font-mono font-semibold text-gray-900 dark:text-white">
								{formatUptime(health.uptime)}
							</p>
						</div>

						<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
							<div class="flex items-center gap-2">
								<Network class="h-4 w-4 text-gray-500" />
								<span class="text-sm text-gray-500 dark:text-gray-400">VPNs Connected</span>
							</div>
							<p class="mt-1 font-semibold text-gray-900 dark:text-white">
								{health.vpns.connected} / {health.vpns.total}
							</p>
						</div>

						<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
							<div class="flex items-center gap-2">
								<Shield class="h-4 w-4 text-gray-500" />
								<span class="text-sm text-gray-500 dark:text-gray-400">Healthy VPNs</span>
							</div>
							<p class="mt-1 font-semibold {health.vpns.healthy === health.vpns.connected ? 'text-green-600' : 'text-yellow-600'}">
								{health.vpns.healthy}
							</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Network Settings -->
		<div class="rounded-lg bg-white shadow dark:bg-gray-800">
			<button
				onclick={() => toggleSection('network')}
				class="flex w-full items-center justify-between p-4"
			>
				<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
					<Globe class="h-5 w-5 text-cyan-500" />
					Network Settings
				</h2>
				{#if expandedSections.network}
					<ChevronDown class="h-5 w-5 text-gray-500" />
				{:else}
					<ChevronRight class="h-5 w-5 text-gray-500" />
				{/if}
			</button>

			{#if expandedSections.network}
				<div class="border-t px-4 pb-4 dark:border-gray-700">
					<div class="mt-4 grid gap-4 md:grid-cols-2">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
								Listen Address
							</label>
							<input
								type="text"
								value={getSettingValue('network', 'listen')}
								oninput={(e) => updateSetting('network', 'listen', e.currentTarget.value)}
								class="w-full rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
								placeholder="127.0.0.1:8080"
							/>
							<p class="mt-1 text-xs text-gray-500">Address and port for the API server</p>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
								LAN IP Address
							</label>
							<input
								type="text"
								value={getSettingValue('network', 'lan_ip')}
								oninput={(e) => updateSetting('network', 'lan_ip', e.currentTarget.value)}
								class="w-full rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
								placeholder="Auto-detected"
							/>
							<p class="mt-1 text-xs text-gray-500">LAN IP for proxy bindings</p>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
								LAN Interface
							</label>
							<input
								type="text"
								value={getSettingValue('network', 'lan_interface')}
								oninput={(e) => updateSetting('network', 'lan_interface', e.currentTarget.value)}
								class="w-full rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
								placeholder="Auto-detected"
							/>
							<p class="mt-1 text-xs text-gray-500">Network interface for forwarding rules</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Authentication -->
		<div class="rounded-lg bg-white shadow dark:bg-gray-800">
			<button
				onclick={() => toggleSection('auth')}
				class="flex w-full items-center justify-between p-4"
			>
				<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
					<Shield class="h-5 w-5 text-green-500" />
					Authentication
				</h2>
				{#if expandedSections.auth}
					<ChevronDown class="h-5 w-5 text-gray-500" />
				{:else}
					<ChevronRight class="h-5 w-5 text-gray-500" />
				{/if}
			</button>

			{#if expandedSections.auth}
				<div class="space-y-4 border-t px-4 pb-4 dark:border-gray-700">
					<div class="mt-4 grid gap-4 md:grid-cols-2">
						<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">Enable Authentication</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Require login for API access</p>
							</div>
							<button
								onclick={() => updateSetting('auth', 'enabled', !getSettingBool('auth', 'enabled'))}
								class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {getSettingBool('auth', 'enabled') ? 'bg-blue-600' : 'bg-gray-300'}"
								role="switch"
								aria-checked={getSettingBool('auth', 'enabled')}
							>
								<span
									class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {getSettingBool('auth', 'enabled') ? 'translate-x-6' : 'translate-x-1'}"
								></span>
							</button>
						</div>

						<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">Allow Localhost</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Bypass auth for local requests</p>
							</div>
							<button
								onclick={() => updateSetting('auth', 'allow_localhost', !getSettingBool('auth', 'allow_localhost'))}
								class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {getSettingBool('auth', 'allow_localhost') ? 'bg-blue-600' : 'bg-gray-300'}"
								role="switch"
								aria-checked={getSettingBool('auth', 'allow_localhost')}
							>
								<span
									class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {getSettingBool('auth', 'allow_localhost') ? 'translate-x-6' : 'translate-x-1'}"
								></span>
							</button>
						</div>
					</div>

					<!-- Admin Users Panel -->
					<AdminUsersPanel />
				</div>
			{/if}
		</div>

		<!-- JWT Configuration -->
		<div class="rounded-lg bg-white shadow dark:bg-gray-800">
			<button
				onclick={() => toggleSection('jwt')}
				class="flex w-full items-center justify-between p-4"
			>
				<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
					<Key class="h-5 w-5 text-yellow-500" />
					JWT Configuration
				</h2>
				{#if expandedSections.jwt}
					<ChevronDown class="h-5 w-5 text-gray-500" />
				{:else}
					<ChevronRight class="h-5 w-5 text-gray-500" />
				{/if}
			</button>

			{#if expandedSections.jwt}
				<div class="border-t px-4 pb-4 dark:border-gray-700">
					<div class="mt-4 grid gap-4 md:grid-cols-2">
						<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">Enable JWT</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Use JSON Web Tokens for auth</p>
							</div>
							<button
								onclick={() => updateSetting('jwt', 'enabled', !getSettingBool('jwt', 'enabled'))}
								class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {getSettingBool('jwt', 'enabled') ? 'bg-blue-600' : 'bg-gray-300'}"
								role="switch"
								aria-checked={getSettingBool('jwt', 'enabled')}
							>
								<span
									class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {getSettingBool('jwt', 'enabled') ? 'translate-x-6' : 'translate-x-1'}"
								></span>
							</button>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
								Algorithm
							</label>
							<select
								value={getSettingValue('jwt', 'algorithm')}
								onchange={(e) => updateSetting('jwt', 'algorithm', e.currentTarget.value)}
								class="w-full rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
							>
								<option value="HS256">HS256 (HMAC-SHA256)</option>
								<option value="HS384">HS384 (HMAC-SHA384)</option>
								<option value="HS512">HS512 (HMAC-SHA512)</option>
							</select>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
								Token Expiration
							</label>
							<input
								type="text"
								value={getSettingValue('jwt', 'expiration')}
								oninput={(e) => updateSetting('jwt', 'expiration', e.currentTarget.value)}
								class="w-full rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
								placeholder="24h"
							/>
							<p class="mt-1 text-xs text-gray-500">Duration like 1h, 24h, 7d</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- DNS & Aliases -->
		<div class="rounded-lg bg-white shadow dark:bg-gray-800">
			<button
				onclick={() => toggleSection('dns')}
				class="flex w-full items-center justify-between p-4"
			>
				<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
					<Globe class="h-5 w-5 text-purple-500" />
					DNS & Aliases
				</h2>
				{#if expandedSections.dns}
					<ChevronDown class="h-5 w-5 text-gray-500" />
				{:else}
					<ChevronRight class="h-5 w-5 text-gray-500" />
				{/if}
			</button>

			{#if expandedSections.dns}
				<div class="border-t px-4 pb-4 dark:border-gray-700">
					<div class="mt-4 grid gap-4 md:grid-cols-2">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
								Base Domain
							</label>
							<input
								type="text"
								value={getSettingValue('dns', 'base_domain')}
								oninput={(e) => updateSetting('dns', 'base_domain', e.currentTarget.value)}
								class="w-full rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
								placeholder="vpner.local"
							/>
							<p class="mt-1 text-xs text-gray-500">Base domain for VPN aliases</p>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
								Alias Port
							</label>
							<input
								type="number"
								value={getSettingValue('dns', 'alias_port')}
								oninput={(e) => updateSetting('dns', 'alias_port', e.currentTarget.value)}
								class="w-full rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
								placeholder="80"
							/>
							<p class="mt-1 text-xs text-gray-500">Port for alias HTTP proxy</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Default Route Monitoring -->
		<div class="rounded-lg bg-white shadow dark:bg-gray-800">
			<button
				onclick={() => toggleSection('defaultRoute')}
				class="flex w-full items-center justify-between p-4"
			>
				<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
					<Route class="h-5 w-5 text-orange-500" />
					Default Route Monitoring
				</h2>
				{#if expandedSections.defaultRoute}
					<ChevronDown class="h-5 w-5 text-gray-500" />
				{:else}
					<ChevronRight class="h-5 w-5 text-gray-500" />
				{/if}
			</button>

			{#if expandedSections.defaultRoute}
				<div class="border-t px-4 pb-4 dark:border-gray-700">
					<div class="mt-4 grid gap-4 md:grid-cols-2">
						<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">Enable Monitoring</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Watch for default route changes</p>
							</div>
							<button
								onclick={() => updateSetting('default_route', 'enabled', !getSettingBool('default_route', 'enabled'))}
								class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {getSettingBool('default_route', 'enabled') ? 'bg-blue-600' : 'bg-gray-300'}"
								role="switch"
								aria-checked={getSettingBool('default_route', 'enabled')}
							>
								<span
									class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {getSettingBool('default_route', 'enabled') ? 'translate-x-6' : 'translate-x-1'}"
								></span>
							</button>
						</div>

						<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">Auto-Restore</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Automatically restore lost routes</p>
							</div>
							<button
								onclick={() => updateSetting('default_route', 'auto_restore', !getSettingBool('default_route', 'auto_restore'))}
								class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {getSettingBool('default_route', 'auto_restore') ? 'bg-blue-600' : 'bg-gray-300'}"
								role="switch"
								aria-checked={getSettingBool('default_route', 'auto_restore')}
							>
								<span
									class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {getSettingBool('default_route', 'auto_restore') ? 'translate-x-6' : 'translate-x-1'}"
								></span>
							</button>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
								Check Interval
							</label>
							<input
								type="text"
								value={getSettingValue('default_route', 'check_interval')}
								oninput={(e) => updateSetting('default_route', 'check_interval', e.currentTarget.value)}
								class="w-full rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
								placeholder="10s"
							/>
							<p class="mt-1 text-xs text-gray-500">How often to check routes</p>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
								Default Gateway
							</label>
							<input
								type="text"
								value={getSettingValue('default_route', 'gateway')}
								oninput={(e) => updateSetting('default_route', 'gateway', e.currentTarget.value)}
								class="w-full rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
								placeholder="Auto-detected"
							/>
							<p class="mt-1 text-xs text-gray-500">Expected default gateway IP</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Traefik Sync -->
		<div class="rounded-lg bg-white shadow dark:bg-gray-800">
			<button
				onclick={() => toggleSection('traefik')}
				class="flex w-full items-center justify-between p-4"
			>
				<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
					<Link class="h-5 w-5 text-pink-500" />
					Traefik Sync
				</h2>
				{#if expandedSections.traefik}
					<ChevronDown class="h-5 w-5 text-gray-500" />
				{:else}
					<ChevronRight class="h-5 w-5 text-gray-500" />
				{/if}
			</button>

			{#if expandedSections.traefik}
				<div class="border-t px-4 pb-4 dark:border-gray-700">
					<div class="mt-4 grid gap-4 md:grid-cols-2">
						<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">Enable Traefik Sync</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Sync routes with Traefik</p>
							</div>
							<button
								onclick={() => updateSetting('traefik', 'enabled', !getSettingBool('traefik', 'enabled'))}
								class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {getSettingBool('traefik', 'enabled') ? 'bg-blue-600' : 'bg-gray-300'}"
								role="switch"
								aria-checked={getSettingBool('traefik', 'enabled')}
							>
								<span
									class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {getSettingBool('traefik', 'enabled') ? 'translate-x-6' : 'translate-x-1'}"
								></span>
							</button>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
								Traefik API URL
							</label>
							<input
								type="text"
								value={getSettingValue('traefik', 'api_url')}
								oninput={(e) => updateSetting('traefik', 'api_url', e.currentTarget.value)}
								class="w-full rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
								placeholder="http://localhost:8080/api"
							/>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
								Sync Interval
							</label>
							<input
								type="text"
								value={getSettingValue('traefik', 'sync_interval')}
								oninput={(e) => updateSetting('traefik', 'sync_interval', e.currentTarget.value)}
								class="w-full rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
								placeholder="30s"
							/>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Logging -->
		<div class="rounded-lg bg-white shadow dark:bg-gray-800">
			<button
				onclick={() => toggleSection('logging')}
				class="flex w-full items-center justify-between p-4"
			>
				<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
					<FileText class="h-5 w-5 text-gray-500" />
					Logging
				</h2>
				{#if expandedSections.logging}
					<ChevronDown class="h-5 w-5 text-gray-500" />
				{:else}
					<ChevronRight class="h-5 w-5 text-gray-500" />
				{/if}
			</button>

			{#if expandedSections.logging}
				<div class="border-t px-4 pb-4 dark:border-gray-700">
					<div class="mt-4">
						<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
							Log Level
						</label>
						<select
							value={getSettingValue('logging', 'log_level')}
							onchange={(e) => updateSetting('logging', 'log_level', e.currentTarget.value)}
							class="w-full max-w-xs rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
						>
							<option value="debug">Debug</option>
							<option value="info">Info</option>
							<option value="warn">Warning</option>
							<option value="error">Error</option>
						</select>
						<p class="mt-1 text-xs text-gray-500">Minimum log level to output</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- User Session -->
		<div class="rounded-lg bg-white shadow dark:bg-gray-800">
			<button
				onclick={() => toggleSection('session')}
				class="flex w-full items-center justify-between p-4"
			>
				<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
					<User class="h-5 w-5 text-green-500" />
					User Session
				</h2>
				{#if expandedSections.session}
					<ChevronDown class="h-5 w-5 text-gray-500" />
				{:else}
					<ChevronRight class="h-5 w-5 text-gray-500" />
				{/if}
			</button>

			{#if expandedSections.session && userInfo}
				<div class="border-t px-4 pb-4 dark:border-gray-700">
					<div class="mt-4 space-y-4">
						<div class="grid gap-4 md:grid-cols-2">
							<div>
								<span class="text-sm text-gray-500 dark:text-gray-400">Username</span>
								<p class="font-semibold text-gray-900 dark:text-white">{userInfo.username}</p>
							</div>

							<div>
								<span class="text-sm text-gray-500 dark:text-gray-400">Roles</span>
								<div class="mt-1 flex flex-wrap gap-1">
									{#each userInfo.roles ?? [] as role}
										<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
											{role}
										</span>
									{/each}
								</div>
							</div>

							{#if userInfo.issued_at}
								<div>
									<span class="text-sm text-gray-500 dark:text-gray-400">Session Started</span>
									<p class="font-mono text-sm text-gray-900 dark:text-white">
										{formatDate(userInfo.issued_at)}
									</p>
								</div>
							{/if}

							{#if userInfo.expires_at}
								<div>
									<span class="text-sm text-gray-500 dark:text-gray-400">Session Expires</span>
									<p class="font-mono text-sm text-gray-900 dark:text-white">
										{formatDate(userInfo.expires_at)}
									</p>
								</div>
							{/if}
						</div>

						<div class="border-t pt-4 dark:border-gray-700">
							<button
								onclick={() => auth.logout()}
								class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
							>
								<LogOut class="h-4 w-4" />
								Logout
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Appearance -->
		<div class="rounded-lg bg-white shadow dark:bg-gray-800">
			<button
				onclick={() => toggleSection('appearance')}
				class="flex w-full items-center justify-between p-4"
			>
				<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
					{#if darkMode}
						<Moon class="h-5 w-5 text-purple-500" />
					{:else}
						<Sun class="h-5 w-5 text-yellow-500" />
					{/if}
					Appearance
				</h2>
				{#if expandedSections.appearance}
					<ChevronDown class="h-5 w-5 text-gray-500" />
				{:else}
					<ChevronRight class="h-5 w-5 text-gray-500" />
				{/if}
			</button>

			{#if expandedSections.appearance}
				<div class="border-t px-4 pb-4 dark:border-gray-700">
					<div class="mt-4 flex items-center justify-between">
						<div>
							<p class="font-medium text-gray-900 dark:text-white">Dark Mode</p>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								Toggle between light and dark theme
							</p>
						</div>
						<button
							onclick={toggleDarkMode}
							class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {darkMode ? 'bg-blue-600' : 'bg-gray-300'}"
							role="switch"
							aria-checked={darkMode}
						>
							<span
								class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {darkMode ? 'translate-x-6' : 'translate-x-1'}"
							></span>
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- About -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">About vpner</h2>
			<div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
				<p>
					<span class="font-medium text-gray-900 dark:text-white">vpner</span> is a Linux daemon for managing multiple VPN connections with selective routing, DNS integration, and health monitoring.
				</p>
				<p>
					Version: 0.1.33
				</p>
			</div>
		</div>
	{/if}
</div>
