<script lang="ts">
	import { Clock } from 'lucide-svelte';
	import type { ScheduleConfig } from '$lib/types';

	interface Props {
		config: ScheduleConfig | null;
	}

	let { config = $bindable() }: Props = $props();

	const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	// Initialize state from config (API returns connect_at, disconnect_at, days format)
	let enabled = $state(config?.enabled ?? false);
	let connectAt = $state(config?.connect_at ?? '08:00');
	let disconnectAt = $state(config?.disconnect_at ?? '18:00');
	let days = $state<string[]>(config?.days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
	let timezone = $state(config?.timezone ?? '');

	function toggleDay(day: string) {
		if (days.includes(day)) {
			days = days.filter((d) => d !== day);
		} else {
			days = [...days, day];
		}
	}

	// Sync state back to config
	$effect(() => {
		if (enabled && days.length > 0) {
			config = {
				enabled: true,
				connect_at: connectAt,
				disconnect_at: disconnectAt,
				days: days,
				timezone: timezone || undefined
			};
		} else {
			config = null;
		}
	});
</script>

<div class="space-y-4">
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={enabled} class="rounded" />
		<span class="flex items-center gap-2 text-sm font-medium">
			<Clock class="h-4 w-4" />
			Enable Schedule
		</span>
	</label>

	{#if enabled}
		<div class="space-y-4 border-l-2 border-blue-200 pl-4 dark:border-blue-800">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label for="schedule-connect" class="mb-1 block text-sm font-medium">Connect At</label>
					<input
						id="schedule-connect"
						bind:value={connectAt}
						type="time"
						class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
					/>
				</div>

				<div>
					<label for="schedule-disconnect" class="mb-1 block text-sm font-medium">Disconnect At</label>
					<input
						id="schedule-disconnect"
						bind:value={disconnectAt}
						type="time"
						class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
					/>
				</div>
			</div>

			<div>
				<label class="mb-2 block text-sm font-medium">Active Days</label>
				<div class="flex flex-wrap gap-2">
					{#each DAYS as day}
						<button
							type="button"
							onclick={() => toggleDay(day)}
							class="rounded-lg px-3 py-1 text-sm font-medium transition-colors {days.includes(day)
								? 'bg-blue-600 text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
						>
							{day}
						</button>
					{/each}
				</div>
			</div>

			<div>
				<label for="schedule-timezone" class="mb-1 block text-sm font-medium">Timezone (optional)</label>
				<input
					id="schedule-timezone"
					bind:value={timezone}
					type="text"
					placeholder="e.g., America/Sao_Paulo"
					class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
				/>
			</div>

			<p class="text-xs text-gray-500">
				VPN will connect at {connectAt} and disconnect at {disconnectAt} on selected days.
			</p>
		</div>
	{/if}
</div>
