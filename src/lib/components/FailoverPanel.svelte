<script lang="ts">
	import { GitBranch, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-svelte';
	import type { ConnectionStatus, FailoverConfig } from '$lib/types';

	interface Props {
		profileName: string;
		config?: FailoverConfig;
		status?: ConnectionStatus;
	}

	let { profileName, config, status }: Props = $props();

	const activeFallback = $derived(status?.failover_active ? status?.failover_profile : null);
</script>

{#if config?.secondary_profile}
	<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<GitBranch class="h-5 w-5 text-gray-500" />
			Failover Configuration
		</h2>

		{#if activeFallback}
			<div
				class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20"
			>
				<div class="flex items-center gap-2">
					<AlertTriangle class="h-5 w-5 text-yellow-600" />
					<span class="font-medium text-yellow-700 dark:text-yellow-400">
						Using Fallback Connection
					</span>
				</div>
				<p class="mt-1 text-sm text-yellow-600 dark:text-yellow-500">
					Primary connection failed. Connected via <strong>{activeFallback}</strong>.
				</p>
			</div>
		{/if}

		<div class="space-y-2">
			<div class="flex items-center gap-3 rounded bg-gray-50 p-2 dark:bg-gray-700/50">
				{#if !activeFallback && status?.status === 'connected'}
					<CheckCircle class="h-4 w-4 text-green-500" />
				{:else if activeFallback}
					<AlertTriangle class="h-4 w-4 text-red-500" />
				{:else}
					<div class="h-4 w-4 rounded-full border-2 border-gray-300"></div>
				{/if}
				<span class="font-medium">{profileName}</span>
				<span class="text-xs text-gray-500">(Primary)</span>
			</div>

			<div class="ml-4 flex items-center gap-3 rounded bg-gray-50 p-2 dark:bg-gray-700/50">
				<ArrowRight class="h-4 w-4 text-gray-400" />
				{#if config.secondary_profile === activeFallback}
					<CheckCircle class="h-4 w-4 text-green-500" />
				{:else}
					<div class="h-4 w-4 rounded-full border-2 border-gray-300"></div>
				{/if}
				<span class={config.secondary_profile === activeFallback ? 'font-medium text-green-600' : ''}>
					{config.secondary_profile}
				</span>
				<span class="text-xs text-gray-500">(Fallback)</span>
			</div>
		</div>

		<dl class="mt-4 grid grid-cols-2 gap-4 text-sm">
			<div>
				<dt class="text-gray-500 dark:text-gray-400">Trigger After</dt>
				<dd>{config.trigger_on_failures} failures</dd>
			</div>
			<div>
				<dt class="text-gray-500 dark:text-gray-400">Auto Restore</dt>
				<dd>{config.auto_restore ? 'Yes' : 'No'}</dd>
			</div>
		</dl>
	</div>
{/if}
