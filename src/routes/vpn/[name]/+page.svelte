<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import { api } from '$lib/api';
	import { onVisibilityChange } from '$lib/utils/visibility';
	import { connect, disconnect, submitOTP } from '$lib/services/connection';
	import { useToast } from '$lib/stores/toast.svelte';
	import type { VPNProfile, ConnectionStatus } from '$lib/types';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import HealthIndicator from '$lib/components/HealthIndicator.svelte';
	import ConnectButton from '$lib/components/ConnectButton.svelte';
	import OTPModal from '$lib/components/OTPModal.svelte';
	import RouteList from '$lib/components/RouteList.svelte';
	import DNSList from '$lib/components/DNSList.svelte';
	import AliasList from '$lib/components/AliasList.svelte';
	import HealthPanel from '$lib/components/HealthPanel.svelte';
	import FailoverPanel from '$lib/components/FailoverPanel.svelte';
	import {
		ArrowLeft,
		Settings,
		RefreshCw,
		Network,
		Route,
		Globe,
		Link,
		Clock,
		Hash
	} from 'lucide-svelte';

	const vpnName = $derived($page.params.name ?? '');
	const toast = useToast();

	let profile = $state<VPNProfile | null>(null);
	let status = $state<ConnectionStatus | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let pollInterval: ReturnType<typeof setInterval> | null = null;
	let cleanupVisibility: (() => void) | null = null;
	let showOTP = $state(false);
	let connecting = $state(false);

	async function fetchData() {
		try {
			const [p, s] = await Promise.all([
				api.get<VPNProfile>(`/vpns/${vpnName}`),
				api.get<ConnectionStatus>(`/vpns/${vpnName}/status`)
			]);
			profile = p;
			status = s;
			error = null;
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			error = apiError.message ?? 'Failed to load VPN details';
		} finally {
			loading = false;
		}
	}

	function startPolling() {
		stopPolling();
		fetchData();
		pollInterval = setInterval(fetchData, 2000);
	}

	function stopPolling() {
		if (pollInterval) {
			clearInterval(pollInterval);
			pollInterval = null;
		}
	}

	onMount(() => {
		startPolling();
		cleanupVisibility = onVisibilityChange(
			() => startPolling(),
			() => stopPolling()
		);
	});

	onDestroy(() => {
		stopPolling();
		cleanupVisibility?.();
	});

	async function handleConnect() {
		// If OTP is required, show OTP modal first instead of calling connect
		if (status?.otp_required || profile?.otp_required) {
			showOTP = true;
			return;
		}

		connecting = true;
		try {
			const result = await connect(vpnName);
			if (result.otpRequired) {
				showOTP = true;
			} else if (result.status.status === 'connected') {
				toast.success(`Connected to ${vpnName}`);
			}
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Connection failed');
		} finally {
			connecting = false;
			fetchData();
		}
	}

	async function handleDisconnect() {
		try {
			await disconnect(vpnName);
			toast.success(`Disconnected from ${vpnName}`);
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Disconnect failed');
		}
		fetchData();
	}

	async function handleOTPSubmit(token: string) {
		const result = await submitOTP(vpnName, token);
		showOTP = false;
		if (result.status === 'connected') {
			toast.success(`Connected to ${vpnName}`);
		} else if (result.status === 'failed') {
			toast.error(result.error_message ?? 'Connection failed');
		}
		fetchData();
	}

	function handleOTPCancel() {
		showOTP = false;
		if (status?.status === 'waiting_for_otp') {
			disconnect(vpnName).catch(() => {});
		}
	}

	const isConnected = $derived(status?.status === 'connected');
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<a
				href="/"
				class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
				title="Back to dashboard"
			>
				<ArrowLeft class="h-5 w-5" />
			</a>
			<div>
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
					{vpnName}
				</h1>
				{#if profile}
					<p class="text-sm text-gray-500 dark:text-gray-400">{profile.provider}</p>
				{/if}
			</div>
		</div>
		<div class="flex items-center gap-4">
			{#if status}
				<StatusBadge status={status.status} size="lg" />
				<HealthIndicator health={status.health} />
			{/if}
			<ConnectButton
				status={status ?? undefined}
				onConnect={handleConnect}
				onDisconnect={handleDisconnect}
				disabled={connecting || !profile?.enabled}
			/>
			<button
				onclick={() => fetchData()}
				class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
				title="Refresh"
			>
				<RefreshCw class="h-5 w-5" />
			</button>
			<a
				href="/vpn/{vpnName}/edit"
				class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
				title="Settings"
			>
				<Settings class="h-5 w-5" />
			</a>
		</div>
	</div>

	{#if error}
		<div class="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="animate-pulse space-y-4">
			<div class="h-32 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
			<div class="h-64 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
		</div>
	{:else if profile}
		<!-- Connection Info -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
				<Network class="h-5 w-5 text-gray-500" />
				Connection
			</h2>
			<dl class="grid grid-cols-2 gap-4 md:grid-cols-4">
				<div>
					<dt class="text-sm text-gray-500 dark:text-gray-400">Status</dt>
					<dd class="font-medium capitalize">{status?.status ?? 'unknown'}</dd>
				</div>
				{#if status?.interface}
					<div>
						<dt class="text-sm text-gray-500 dark:text-gray-400">Interface</dt>
						<dd class="font-mono">{status.interface}</dd>
					</div>
				{/if}
				{#if status?.started_at && isConnected}
					<div>
						<dt class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
							<Clock class="h-3 w-3" />
							Connected Since
						</dt>
						<dd>{new Date(status.started_at).toLocaleString()}</dd>
					</div>
				{/if}
				{#if status?.pid}
					<div>
						<dt class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
							<Hash class="h-3 w-3" />
							Process ID
						</dt>
						<dd class="font-mono">{status.pid}</dd>
					</div>
				{/if}
				{#if status?.reconnect_count && status.reconnect_count > 0}
					<div>
						<dt class="text-sm text-gray-500 dark:text-gray-400">Reconnect Count</dt>
						<dd class="text-yellow-600">{status.reconnect_count}</dd>
					</div>
				{/if}
				{#if status?.failover_active}
					<div>
						<dt class="text-sm text-gray-500 dark:text-gray-400">Failover Profile</dt>
						<dd class="text-yellow-600">{status.failover_profile}</dd>
					</div>
				{/if}
			</dl>

			{#if status?.error_message}
				<div
					class="mt-4 rounded bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400"
				>
					{status.error_message}
				</div>
			{/if}
		</div>

		<!-- Health Panel -->
		{#if status?.status === 'connected' || profile.health_check}
			<HealthPanel health={status?.health} config={profile.health_check} />
		{/if}

		<!-- Failover Panel -->
		{#if profile.failover}
			<FailoverPanel profileName={profile.name} config={profile.failover} status={status ?? undefined} />
		{/if}

		<!-- Routes -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
				<Route class="h-5 w-5 text-gray-500" />
				Routes
				<span class="text-sm font-normal text-gray-500">({profile.routes?.length ?? 0})</span>
			</h2>
			<RouteList routes={profile.routes ?? []} vpnInterface={status?.interface} />
		</div>

		<!-- DNS Entries -->
		{#if profile.dns && profile.dns.length > 0}
			<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
				<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
					<Globe class="h-5 w-5 text-gray-500" />
					DNS Entries
					<span class="text-sm font-normal text-gray-500">({profile.dns.length})</span>
				</h2>
				<DNSList entries={profile.dns} />
			</div>
		{/if}

		<!-- Aliases -->
		{#if profile.aliases && profile.aliases.length > 0}
			<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
				<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
					<Link class="h-5 w-5 text-gray-500" />
					Endpoint Aliases
					<span class="text-sm font-normal text-gray-500">({profile.aliases.length})</span>
				</h2>
				<AliasList aliases={profile.aliases} profileName={profile.name} />
			</div>
		{/if}

		<!-- Proxy Domains -->
		{#if profile.proxy && profile.proxy.length > 0}
			<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
				<h2 class="mb-4 text-lg font-semibold">
					Proxy Domains
					<span class="text-sm font-normal text-gray-500">({profile.proxy.length})</span>
				</h2>
				<div class="space-y-1">
					{#each profile.proxy as p}
						<div
							class="flex items-center justify-between rounded bg-gray-50 px-3 py-2 dark:bg-gray-700/50"
						>
							<span class="font-mono text-sm">{p.domain}</span>
							<span class="text-xs text-gray-500">:{p.port}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>

<OTPModal
	{vpnName}
	open={showOTP}
	onSubmit={handleOTPSubmit}
	onCancel={handleOTPCancel}
/>
