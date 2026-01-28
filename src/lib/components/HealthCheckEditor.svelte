<script lang="ts">
	import { Activity } from 'lucide-svelte';
	import type { HealthCheckConfig } from '$lib/types';

	interface Props {
		config: HealthCheckConfig | null;
	}

	let { config = $bindable() }: Props = $props();

	let enabled = $state(!!config);
	let target = $state(config?.target ?? '');
	let interval = $state(config?.interval ?? 30);
	let timeout = $state(config?.timeout ?? 5);
	let retries = $state(config?.retries ?? 3);

	// Sync state back to config when enabled changes
	$effect(() => {
		if (enabled && target) {
			config = { target, interval, timeout, retries };
		} else if (!enabled) {
			config = null;
		}
	});

	// Update config when fields change
	$effect(() => {
		if (enabled && target) {
			config = { target, interval, timeout, retries };
		}
	});
</script>

<div class="space-y-4">
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={enabled} class="rounded" />
		<span class="flex items-center gap-2 text-sm font-medium">
			<Activity class="h-4 w-4" />
			Enable Health Checks
		</span>
	</label>

	{#if enabled}
		<div class="grid grid-cols-1 gap-4 border-l-2 border-blue-200 pl-4 dark:border-blue-800 md:grid-cols-2">
			<div>
				<label for="health-target" class="mb-1 block text-sm font-medium">Target (host:port) *</label>
				<input
					id="health-target"
					bind:value={target}
					type="text"
					placeholder="10.0.0.1:443"
					class="w-full rounded-lg border p-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
				/>
				<p class="mt-1 text-xs text-gray-500">TCP endpoint to check connectivity</p>
			</div>

			<div>
				<label for="health-interval" class="mb-1 block text-sm font-medium">Check Interval (seconds)</label>
				<input
					id="health-interval"
					bind:value={interval}
					type="number"
					min="5"
					max="300"
					class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
				/>
			</div>

			<div>
				<label for="health-timeout" class="mb-1 block text-sm font-medium">Timeout (seconds)</label>
				<input
					id="health-timeout"
					bind:value={timeout}
					type="number"
					min="1"
					max="60"
					class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
				/>
			</div>

			<div>
				<label for="health-retries" class="mb-1 block text-sm font-medium">Failure Threshold</label>
				<input
					id="health-retries"
					bind:value={retries}
					type="number"
					min="1"
					max="10"
					class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
				/>
				<p class="mt-1 text-xs text-gray-500">Consecutive failures before marking unhealthy</p>
			</div>
		</div>
	{/if}
</div>
