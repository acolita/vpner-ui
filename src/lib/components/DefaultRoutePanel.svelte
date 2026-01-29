<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { DefaultRouteStatus, RouteHistoryEvent } from '$lib/types';
	import { Shield, Save, RotateCcw, Clock, AlertTriangle, CheckCircle, Activity, Info, Loader2 } from 'lucide-svelte';
	import { useToast } from '$lib/stores/toast.svelte';

	const toast = useToast();

	let status = $state<DefaultRouteStatus | null>(null);
	let history = $state<RouteHistoryEvent[]>([]);
	let loading = $state(true);
	let actionLoading = $state<'capture' | 'restore' | null>(null);
	let notEnabled = $state(false);

	const isProtected = $derived(
		status?.saved_route &&
		status?.current_route?.gateway === status?.saved_route?.gateway
	);

	async function refresh() {
		loading = true;
		notEnabled = false;
		try {
			const [s, h] = await Promise.all([
				api.get<DefaultRouteStatus>('/routes/default'),
				api.get<RouteHistoryEvent[]>('/routes/default/history?limit=20')
			]);
			status = s;
			history = h ?? [];
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			// Check if feature is not enabled
			if (apiError.message?.includes('not enabled')) {
				notEnabled = true;
			} else {
				toast.error(apiError.message ?? 'Failed to load default route status');
			}
		} finally {
			loading = false;
		}
	}

	async function capture() {
		if (actionLoading) return;
		actionLoading = 'capture';
		try {
			await api.post('/routes/default/capture');
			toast.success('Default route captured');
			refresh();
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Failed to capture default route');
		} finally {
			actionLoading = null;
		}
	}

	async function restore() {
		if (actionLoading) return;
		actionLoading = 'restore';
		try {
			await api.post('/routes/default/restore');
			toast.success('Default route restored');
			refresh();
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Failed to restore default route');
		} finally {
			actionLoading = null;
		}
	}

	function formatDate(dateStr: string | undefined): string {
		if (!dateStr || dateStr.startsWith('0001-01-01')) return 'Never';
		return new Date(dateStr).toLocaleString();
	}

	onMount(refresh);
</script>

{#if loading}
	<div class="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
{:else if status}
	<div class="space-y-4">
		<!-- Current Status -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
				<Shield class="h-5 w-5 text-blue-500" />
				Default Route Protection
			</h2>

			<dl class="grid grid-cols-2 gap-4 md:grid-cols-4">
				<div>
					<dt class="text-sm text-gray-500 dark:text-gray-400">Current Gateway</dt>
					<dd class="font-mono text-gray-900 dark:text-white">
						{status.current_route?.gateway || 'Unknown'}
					</dd>
				</div>
				<div>
					<dt class="text-sm text-gray-500 dark:text-gray-400">Interface</dt>
					<dd class="font-mono text-gray-900 dark:text-white">
						{status.current_route?.interface || 'Unknown'}
					</dd>
				</div>
				<div>
					<dt class="text-sm text-gray-500 dark:text-gray-400">Saved Gateway</dt>
					<dd class="font-mono text-gray-900 dark:text-white">
						{status.saved_route?.gateway ?? 'Not captured'}
					</dd>
				</div>
				<div>
					<dt class="text-sm text-gray-500 dark:text-gray-400">Protection</dt>
					<dd class="flex items-center gap-1">
						{#if isProtected}
							<CheckCircle class="h-4 w-4 text-green-500" />
							<span class="text-green-600 dark:text-green-400">Protected</span>
						{:else}
							<AlertTriangle class="h-4 w-4 text-yellow-500" />
							<span class="text-yellow-600 dark:text-yellow-400">Not Protected</span>
						{/if}
					</dd>
				</div>
			</dl>

			<!-- Monitoring Status -->
			{#if status.monitoring}
				<div class="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
					<div class="flex items-center gap-4 text-sm">
						<div class="flex items-center gap-1">
							<Activity class="h-4 w-4 text-gray-500" />
							<span class="text-gray-600 dark:text-gray-400">Monitoring:</span>
							<span class={status.monitoring.enabled ? 'text-green-600' : 'text-gray-500'}>
								{status.monitoring.enabled ? 'Enabled' : 'Disabled'}
							</span>
						</div>
						<div class="text-gray-500 dark:text-gray-400">
							Auto-restore: {status.monitoring.auto_restore ? 'Yes' : 'No'}
						</div>
						<div class="text-gray-500 dark:text-gray-400">
							Interval: {status.monitoring.check_interval}
						</div>
					</div>
				</div>
			{/if}

			<!-- Stats -->
			{#if status.history}
				<div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
					<div class="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
						<p class="text-xs text-red-600 dark:text-red-400">Total Losses</p>
						<p class="text-xl font-bold text-red-700 dark:text-red-300">{status.history.total_losses}</p>
					</div>
					<div class="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
						<p class="text-xs text-green-600 dark:text-green-400">Total Restores</p>
						<p class="text-xl font-bold text-green-700 dark:text-green-300">{status.history.total_restores}</p>
					</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">
						<p>Last Loss</p>
						<p class="font-mono text-xs">{formatDate(status.history.last_loss)}</p>
					</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">
						<p>Last Restore</p>
						<p class="font-mono text-xs">{formatDate(status.history.last_restore)}</p>
					</div>
				</div>
			{/if}

			<div class="mt-4 flex gap-2">
				<button
					onclick={capture}
					disabled={!!actionLoading}
					class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if actionLoading === 'capture'}
						<Loader2 class="h-4 w-4 animate-spin" />
						Capturing...
					{:else}
						<Save class="h-4 w-4" />
						Capture Current
					{/if}
				</button>
				<button
					onclick={restore}
					disabled={!!actionLoading || !status.saved_route}
					class="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
				>
					{#if actionLoading === 'restore'}
						<Loader2 class="h-4 w-4 animate-spin" />
						Restoring...
					{:else}
						<RotateCcw class="h-4 w-4" />
						Restore Saved
					{/if}
				</button>
			</div>
		</div>

		<!-- History -->
		{#if history.length > 0}
			<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
				<h3 class="mb-4 flex items-center gap-2 font-semibold">
					<Clock class="h-5 w-5 text-gray-500" />
					Recent Events
				</h3>
				<div class="max-h-64 space-y-2 overflow-y-auto">
					{#each history as event}
						<div
							class="flex items-center gap-3 rounded bg-gray-50 p-2 text-sm dark:bg-gray-700/50"
						>
							<span class="w-40 shrink-0 text-xs text-gray-500 dark:text-gray-400">
								{new Date(event.timestamp).toLocaleString()}
							</span>
							<span
								class="shrink-0 rounded px-2 py-0.5 text-xs font-medium {event.type === 'restored'
									? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
									: event.type === 'captured'
										? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
										: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}"
							>
								{event.type}
							</span>
							<span class="truncate text-gray-700 dark:text-gray-300">{event.details}</span>
							{#if event.vpn_context?.active_vpns?.length}
								<span class="shrink-0 text-xs text-gray-400">
									VPNs: {event.vpn_context.active_vpns.join(', ')}
								</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{:else if notEnabled}
	<div class="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
		<div class="flex items-start gap-3">
			<Info class="mt-0.5 h-5 w-5 text-blue-500" />
			<div>
				<h3 class="font-medium text-blue-900 dark:text-blue-100">Default Route Monitoring Not Enabled</h3>
				<p class="mt-1 text-sm text-blue-700 dark:text-blue-300">
					This feature monitors your default network route and can automatically restore it if a VPN connection
					changes it unexpectedly.
				</p>
				<p class="mt-2 text-sm text-blue-600 dark:text-blue-400">
					To enable, add the following to your config.yaml:
				</p>
				<pre class="mt-2 rounded bg-blue-100 p-2 text-xs text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">daemon:
  default_route:
    enabled: true
    auto_restore: true
    check_interval: 10s</pre>
			</div>
		</div>
	</div>
{:else}
	<div class="py-8 text-center text-gray-500">Unable to load default route status.</div>
{/if}
