<script lang="ts">
	import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-svelte';
	import type { RouteHealthReport } from '$lib/types';

	interface Props {
		report: RouteHealthReport | null;
		loading: boolean;
	}

	let { report, loading }: Props = $props();
</script>

{#if loading && !report}
	<div class="animate-pulse space-y-4">
		<div class="h-24 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
		<div class="h-48 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
	</div>
{:else if report}
	<!-- Summary Cards -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<p class="text-sm text-gray-500 dark:text-gray-400">Total Routes</p>
			<p class="text-2xl font-bold">{report.total_routes}</p>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<p class="text-sm text-gray-500 dark:text-gray-400">Active</p>
			<p class="text-2xl font-bold text-green-600">{report.active_routes}</p>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<p class="text-sm text-gray-500 dark:text-gray-400">Overlapping</p>
			<p class="text-2xl font-bold text-yellow-600">{report.overlaps?.length ?? 0}</p>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<p class="text-sm text-gray-500 dark:text-gray-400">Conflicting</p>
			<p class="text-2xl font-bold text-red-600">{report.conflicts?.length ?? 0}</p>
		</div>
	</div>

	<!-- Overlaps Section -->
	{#if report.overlaps && report.overlaps.length > 0}
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
				<AlertTriangle class="h-5 w-5 text-yellow-500" />
				Route Overlaps
			</h2>
			<div class="space-y-3">
				{#each report.overlaps as overlap}
					<div class="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
						<div class="flex items-center gap-2">
							<span class="font-mono text-sm">{overlap.parent_cidr}</span>
							<span class="text-gray-400">&</span>
							<span class="font-mono text-sm">{overlap.child_cidr}</span>
						</div>
						<p class="mt-1 text-xs text-gray-500">
							{overlap.parent_profile} overlaps with {overlap.child_profile}
						</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Conflicts Section -->
	{#if report.conflicts && report.conflicts.length > 0}
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
				<AlertCircle class="h-5 w-5 text-red-500" />
				Route Conflicts
			</h2>
			<div class="space-y-3">
				{#each report.conflicts as conflict}
					<div class="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
						<span class="font-mono text-sm">{conflict.cidr}</span>
						<p class="mt-1 text-xs text-gray-500">
							Profiles: {conflict.profiles.join(', ')} | Severity: {conflict.severity}
						</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- All Clear -->
	{#if (!report.overlaps || report.overlaps.length === 0) && (!report.conflicts || report.conflicts.length === 0)}
		<div class="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
			<CheckCircle class="mx-auto mb-2 h-12 w-12 text-green-500" />
			<p class="font-medium text-green-700 dark:text-green-400">All routes are healthy</p>
			<p class="text-sm text-green-600 dark:text-green-500">No overlaps or conflicts detected</p>
		</div>
	{/if}
{:else}
	<div class="py-8 text-center text-gray-500">Unable to load route health report.</div>
{/if}
