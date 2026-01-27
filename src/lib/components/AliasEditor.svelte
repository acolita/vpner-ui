<script lang="ts">
	import { Plus, Trash2 } from 'lucide-svelte';
	import type { AliasEntry } from '$lib/types';

	interface Props {
		aliases: AliasEntry[];
	}

	let { aliases = $bindable() }: Props = $props();

	function addAlias() {
		aliases = [...aliases, { name: '', target: '' }];
	}

	function removeAlias(index: number) {
		aliases = aliases.filter((_, i) => i !== index);
	}
</script>

<div class="space-y-2">
	{#each aliases as alias, i (i)}
		<div class="flex items-start gap-2">
			<div class="flex flex-1 flex-col gap-2 sm:flex-row">
				<input
					bind:value={alias.name}
					type="text"
					placeholder="grafana"
					title="Alias name (e.g., grafana)"
					class="flex-1 rounded-lg border p-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
				/>
				<input
					bind:value={alias.target}
					type="text"
					placeholder="10.10.1.50:3000"
					title="Target host:port"
					class="flex-1 rounded-lg border p-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
				/>
				<input
					bind:value={alias.host}
					type="text"
					placeholder="Host header (optional)"
					title="Override Host header sent to backend"
					class="flex-1 rounded-lg border p-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
				/>
			</div>
			<button
				type="button"
				onclick={() => removeAlias(i)}
				class="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
			>
				<Trash2 class="h-4 w-4" />
			</button>
		</div>
	{/each}

	{#if aliases.length === 0}
		<p class="py-4 text-center text-sm text-gray-500">No aliases defined</p>
	{:else}
		<p class="text-xs text-gray-500 dark:text-gray-400">
			Format: name | target (host:port) | host header override (optional)
		</p>
	{/if}

	<button
		type="button"
		onclick={addAlias}
		class="flex items-center gap-2 rounded-lg px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
	>
		<Plus class="h-4 w-4" />
		Add Alias
	</button>
</div>
