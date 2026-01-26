<script lang="ts">
	import { Terminal, XCircle, AlertTriangle, CheckCircle } from 'lucide-svelte';
	import type { SystemRouteComparison } from '$lib/types';

	interface Props {
		comparison: SystemRouteComparison | null;
		loading: boolean;
	}

	let { comparison, loading }: Props = $props();

	const missingRoutes = $derived(
		comparison?.discrepancies?.filter((d) => d.type === 'missing_in_system') ?? []
	);
	const unexpectedRoutes = $derived(
		comparison?.discrepancies?.filter((d) => d.type === 'unexpected_route') ?? []
	);
</script>

{#if loading}
	<div class="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
{:else if comparison}
	<div class="space-y-4">
		<!-- Summary -->
		<div class="grid grid-cols-3 gap-4">
			<div class="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
				<p class="text-sm text-green-600 dark:text-green-400">vpner Routes</p>
				<p class="text-2xl font-bold text-green-700 dark:text-green-300">
					{comparison.vpner_routes?.length ?? 0}
				</p>
			</div>
			<div class="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
				<p class="text-sm text-yellow-600 dark:text-yellow-400">Missing from System</p>
				<p class="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
					{missingRoutes.length}
				</p>
			</div>
			<div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
				<p class="text-sm text-blue-600 dark:text-blue-400">System Routes</p>
				<p class="text-2xl font-bold text-blue-700 dark:text-blue-300">
					{comparison.system_routes?.length ?? 0}
				</p>
			</div>
		</div>

		<!-- vpner Routes -->
		{#if comparison.vpner_routes && comparison.vpner_routes.length > 0}
			<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
				<h3 class="mb-3 flex items-center gap-2 font-semibold">
					<CheckCircle class="h-5 w-5 text-green-500" />
					vpner Managed Routes
				</h3>
				<div class="space-y-1 max-h-64 overflow-y-auto">
					{#each comparison.vpner_routes as route}
						<div class="flex items-center gap-2 rounded bg-green-50 p-2 dark:bg-green-900/20">
							<span class="font-mono text-sm">{route.cidr}</span>
							<span class="text-xs text-gray-500">via {route.interface}</span>
							<span class="text-xs text-gray-400">({route.profile})</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Missing Routes -->
		{#if missingRoutes.length > 0}
			<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
				<h3 class="mb-3 flex items-center gap-2 font-semibold">
					<AlertTriangle class="h-5 w-5 text-yellow-500" />
					Routes Missing from System
				</h3>
				<p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
					These routes are configured in vpner but not present in the system routing table.
				</p>
				<div class="space-y-1">
					{#each missingRoutes as route}
						<div class="flex items-center gap-2 rounded bg-yellow-50 p-2 dark:bg-yellow-900/20">
							<XCircle class="h-4 w-4 text-yellow-500" />
							<span class="font-mono text-sm">{route.cidr}</span>
							<span class="text-xs text-gray-500">{route.reason}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Unexpected Routes -->
		{#if unexpectedRoutes.length > 0}
			<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
				<h3 class="mb-3 flex items-center gap-2 font-semibold">
					<Terminal class="h-5 w-5 text-blue-500" />
					Unmanaged System Routes
				</h3>
				<p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
					These routes exist in the system but are not managed by vpner.
				</p>
				<div class="space-y-1 max-h-64 overflow-y-auto">
					{#each unexpectedRoutes as route}
						<div class="flex items-center gap-2 rounded bg-blue-50 p-2 dark:bg-blue-900/20">
							<span class="font-mono text-sm">{route.cidr}</span>
							<span class="text-xs text-gray-500">via {route.actual_interface}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if (!comparison.vpner_routes || comparison.vpner_routes.length === 0) && missingRoutes.length === 0 && unexpectedRoutes.length === 0}
			<div class="py-8 text-center text-gray-500">No routes to compare.</div>
		{/if}
	</div>
{:else}
	<div class="py-8 text-center text-gray-500">Unable to load system routes comparison.</div>
{/if}
