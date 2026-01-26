<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { useAuth } from '$lib/auth.svelte';
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
		Network
	} from 'lucide-svelte';

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

	let health = $state<HealthStatus | null>(null);
	let userInfo = $state<UserInfo | null>(null);
	let loading = $state(true);
	let darkMode = $state(false);

	onMount(() => {
		darkMode = document.documentElement.classList.contains('dark');
		refresh();
	});

	async function refresh() {
		loading = true;
		try {
			const [h, u] = await Promise.all([
				api.get<HealthStatus>('/health'),
				api.get<UserInfo>('/auth/me')
			]);
			health = h;
			userInfo = u;
		} catch (err) {
			console.error('Failed to load settings data:', err);
		} finally {
			loading = false;
		}
	}

	function toggleDarkMode() {
		darkMode = !darkMode;
		document.documentElement.classList.toggle('dark', darkMode);
		localStorage.setItem('theme', darkMode ? 'dark' : 'light');
	}

	function formatUptime(uptime: string): string {
		// Parse Go duration string like "8m11.718872971s"
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
		<button
			onclick={refresh}
			disabled={loading}
			class="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
			title="Refresh"
		>
			<RefreshCw class="h-5 w-5 {loading ? 'animate-spin' : ''}" />
		</button>
	</div>

	{#if loading}
		<div class="space-y-4">
			<div class="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
			<div class="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
		</div>
	{:else}
		<!-- Server Status -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
				<Server class="h-5 w-5 text-blue-500" />
				Server Status
			</h2>

			{#if health}
				<div class="grid gap-4 md:grid-cols-4">
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
			{:else}
				<p class="text-gray-500 dark:text-gray-400">Unable to load server status.</p>
			{/if}
		</div>

		<!-- User Info -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
				<User class="h-5 w-5 text-green-500" />
				User Session
			</h2>

			{#if userInfo}
				<div class="space-y-4">
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
			{:else}
				<p class="text-gray-500 dark:text-gray-400">Unable to load user information.</p>
			{/if}
		</div>

		<!-- Appearance -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
				{#if darkMode}
					<Moon class="h-5 w-5 text-purple-500" />
				{:else}
					<Sun class="h-5 w-5 text-yellow-500" />
				{/if}
				Appearance
			</h2>

			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium text-gray-900 dark:text-white">Dark Mode</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						Toggle between light and dark theme
					</p>
				</div>
				<button
					onclick={toggleDarkMode}
					class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {darkMode
						? 'bg-blue-600'
						: 'bg-gray-300'}"
					role="switch"
					aria-checked={darkMode}
				>
					<span
						class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {darkMode
							? 'translate-x-6'
							: 'translate-x-1'}"
					></span>
				</button>
			</div>
		</div>

		<!-- About -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">About vpner</h2>
			<div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
				<p>
					<span class="font-medium text-gray-900 dark:text-white">vpner</span> is a Linux daemon for managing multiple VPN connections with selective routing, DNS integration, and health monitoring.
				</p>
				<p class="flex items-center gap-2">
					<span>Documentation:</span>
					<a
						href="https://github.com/acolita/vpner"
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 hover:underline"
					>
						github.com/acolita/vpner
					</a>
				</p>
			</div>
		</div>
	{/if}
</div>
