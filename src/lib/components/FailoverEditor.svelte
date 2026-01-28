<script lang="ts">
	import { Shield } from 'lucide-svelte';
	import type { FailoverConfig } from '$lib/types';

	interface Props {
		config: FailoverConfig | null;
		availableProfiles: string[];
		currentProfile?: string;
	}

	let { config = $bindable(), availableProfiles, currentProfile }: Props = $props();

	// Filter out the current profile from available options
	const selectableProfiles = $derived(
		availableProfiles.filter((p) => p !== currentProfile)
	);

	let enabled = $state(!!config);
	let secondaryProfile = $state(config?.secondary_profile ?? '');
	let triggerOnFailures = $state(config?.trigger_on_failures ?? 3);
	let autoRestore = $state(config?.auto_restore ?? true);
	let restoreCheckInterval = $state(config?.restore_check_interval ?? 60);

	// Sync state back to config
	$effect(() => {
		if (enabled && secondaryProfile) {
			config = {
				secondary_profile: secondaryProfile,
				trigger_on_failures: triggerOnFailures,
				auto_restore: autoRestore,
				restore_check_interval: autoRestore ? restoreCheckInterval : undefined
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
			<Shield class="h-4 w-4" />
			Enable Failover
		</span>
	</label>

	{#if enabled}
		<div class="space-y-4 border-l-2 border-blue-200 pl-4 dark:border-blue-800">
			{#if selectableProfiles.length === 0}
				<p class="text-sm text-yellow-600 dark:text-yellow-400">
					No other profiles available. Create another VPN profile to use as failover.
				</p>
			{:else}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="failover-profile" class="mb-1 block text-sm font-medium"
							>Secondary Profile *</label
						>
						<select
							id="failover-profile"
							bind:value={secondaryProfile}
							class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
						>
							<option value="">Select a profile...</option>
							{#each selectableProfiles as profile}
								<option value={profile}>{profile}</option>
							{/each}
						</select>
						<p class="mt-1 text-xs text-gray-500">Profile to connect when primary fails</p>
					</div>

					<div>
						<label for="failover-threshold" class="mb-1 block text-sm font-medium"
							>Failure Threshold</label
						>
						<input
							id="failover-threshold"
							bind:value={triggerOnFailures}
							type="number"
							min="1"
							max="10"
							class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
						/>
						<p class="mt-1 text-xs text-gray-500">
							Consecutive health check failures before failover
						</p>
					</div>
				</div>

				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={autoRestore} class="rounded" />
					<span class="text-sm">Auto-restore to primary when it becomes healthy</span>
				</label>

				{#if autoRestore}
					<div class="max-w-xs">
						<label for="restore-interval" class="mb-1 block text-sm font-medium"
							>Restore Check Interval (seconds)</label
						>
						<input
							id="restore-interval"
							bind:value={restoreCheckInterval}
							type="number"
							min="30"
							max="600"
							class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
						/>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>
