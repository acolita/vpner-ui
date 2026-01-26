<script lang="ts">
	import { Heart, HeartCrack, Clock, AlertTriangle, CheckCircle } from 'lucide-svelte';
	import type { HealthStatus, HealthCheckConfig } from '$lib/types';

	interface Props {
		health?: HealthStatus;
		config?: HealthCheckConfig;
	}

	let { health, config }: Props = $props();

	const lastCheckTime = $derived(
		health?.last_check ? new Date(health.last_check).toLocaleTimeString() : 'Never'
	);
</script>

{#if health || config}
	<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			{#if health?.healthy}
				<Heart class="h-5 w-5 fill-green-500 text-green-500" />
			{:else}
				<HeartCrack class="h-5 w-5 text-red-500" />
			{/if}
			Health Check
		</h2>

		<dl class="grid grid-cols-2 gap-4">
			<div>
				<dt class="text-sm text-gray-500 dark:text-gray-400">Status</dt>
				<dd class="flex items-center gap-2">
					{#if health?.healthy}
						<CheckCircle class="h-4 w-4 text-green-500" />
						<span class="font-medium text-green-600 dark:text-green-400">Healthy</span>
					{:else if health}
						<AlertTriangle class="h-4 w-4 text-red-500" />
						<span class="font-medium text-red-600 dark:text-red-400">Unhealthy</span>
					{:else}
						<span class="text-gray-500 dark:text-gray-400">Not monitored</span>
					{/if}
				</dd>
			</div>

			<div>
				<dt class="text-sm text-gray-500 dark:text-gray-400">Last Check</dt>
				<dd class="flex items-center gap-1">
					<Clock class="h-4 w-4 text-gray-400" />
					{lastCheckTime}
				</dd>
			</div>

			{#if health && !health.healthy}
				<div>
					<dt class="text-sm text-gray-500 dark:text-gray-400">Consecutive Failures</dt>
					<dd class="font-medium text-red-600 dark:text-red-400">{health.consecutive_failures}</dd>
				</div>
			{/if}

			{#if config}
				<div>
					<dt class="text-sm text-gray-500 dark:text-gray-400">Target</dt>
					<dd class="font-mono text-sm">{config.target}</dd>
				</div>

				<div>
					<dt class="text-sm text-gray-500 dark:text-gray-400">Interval</dt>
					<dd>{config.interval}s</dd>
				</div>

				<div>
					<dt class="text-sm text-gray-500 dark:text-gray-400">Timeout</dt>
					<dd>{config.timeout}s</dd>
				</div>

				<div>
					<dt class="text-sm text-gray-500 dark:text-gray-400">Retries</dt>
					<dd>{config.retries}</dd>
				</div>
			{/if}
		</dl>
	</div>
{/if}
