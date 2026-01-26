<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { RouteHealthReport, RouteEntry, SystemRouteComparison } from '$lib/types';
	import IPCheck from '$lib/components/IPCheck.svelte';
	import RouteHealthTab from '$lib/components/RouteHealthTab.svelte';
	import AllRoutesTab from '$lib/components/AllRoutesTab.svelte';
	import SystemRoutesPanel from '$lib/components/SystemRoutesPanel.svelte';
	import DefaultRoutePanel from '$lib/components/DefaultRoutePanel.svelte';
	import { Route, RefreshCw } from 'lucide-svelte';

	let report = $state<RouteHealthReport | null>(null);
	let allRoutes = $state<RouteEntry[]>([]);
	let systemComparison = $state<SystemRouteComparison | null>(null);
	let loading = $state(true);
	let activeTab = $state<'health' | 'all' | 'system' | 'default'>('health');

	const tabs = [
		{ id: 'health' as const, label: 'Health Analysis' },
		{ id: 'all' as const, label: 'All Routes' },
		{ id: 'system' as const, label: 'System Routes' },
		{ id: 'default' as const, label: 'Default Route' }
	];

	async function refresh() {
		loading = true;
		try {
			const [r, routes, sys] = await Promise.all([
				api.get<RouteHealthReport>('/routes/health'),
				api.get<RouteEntry[]>('/routes').catch(() => []),
				api.get<SystemRouteComparison>('/routes/system').catch(() => null)
			]);
			report = r;
			allRoutes = routes;
			systemComparison = sys;
		} catch (err: unknown) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	onMount(refresh);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
			<Route class="h-6 w-6" />
			Route Management
		</h1>
		<button
			onclick={refresh}
			disabled={loading}
			class="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
			title="Refresh"
		>
			<RefreshCw class="h-5 w-5 {loading ? 'animate-spin' : ''}" />
		</button>
	</div>

	<!-- Tabs -->
	<div class="border-b border-gray-200 dark:border-gray-700">
		<nav class="flex gap-4">
			{#each tabs as tab}
				<button
					onclick={() => (activeTab = tab.id)}
					class="border-b-2 px-4 py-2 {activeTab === tab.id
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
				>
					{tab.label}
				</button>
			{/each}
		</nav>
	</div>

	<div class="space-y-6">
		{#if activeTab === 'health'}
			<RouteHealthTab {report} {loading} />
		{:else if activeTab === 'all'}
			<AllRoutesTab routes={allRoutes} {loading} />
		{:else if activeTab === 'system'}
			<SystemRoutesPanel comparison={systemComparison} {loading} />
		{:else if activeTab === 'default'}
			<DefaultRoutePanel />
		{/if}
	</div>

	<IPCheck />
</div>
