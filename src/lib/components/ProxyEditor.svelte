<script lang="ts">
	import { Plus, Trash2 } from 'lucide-svelte';
	import type { ProxyEntry } from '$lib/types';

	interface Props {
		entries: ProxyEntry[];
	}

	let { entries = $bindable() }: Props = $props();

	function addEntry() {
		entries = [...entries, { domain: '', port: 443 }];
	}

	function removeEntry(index: number) {
		entries = entries.filter((_, i) => i !== index);
	}

	function isExclusion(entry: ProxyEntry): boolean {
		return entry.domain.startsWith('!');
	}

	function toggleExclusion(index: number) {
		const entry = entries[index];
		if (entry.domain.startsWith('!')) {
			entry.domain = entry.domain.slice(1);
		} else {
			entry.domain = '!' + entry.domain;
		}
		entries = [...entries];
	}
</script>

<div class="space-y-2">
	{#each entries as entry, i (i)}
		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => toggleExclusion(i)}
				class="rounded px-2 py-1 text-xs font-medium {isExclusion(entry)
					? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
					: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}"
				title={isExclusion(entry) ? 'Excluded from proxy' : 'Proxied domain'}
			>
				{isExclusion(entry) ? 'Exclude' : 'Proxy'}
			</button>
			<input
				bind:value={entry.domain}
				type="text"
				placeholder="*.example.com"
				class="flex-1 rounded-lg border p-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
			/>
			<select
				bind:value={entry.port}
				class="w-24 rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
			>
				<option value={443}>443</option>
				<option value={80}>80</option>
				<option value={8443}>8443</option>
				<option value={8080}>8080</option>
			</select>
			<button
				type="button"
				onclick={() => removeEntry(i)}
				class="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
			>
				<Trash2 class="h-4 w-4" />
			</button>
		</div>
	{/each}

	{#if entries.length === 0}
		<p class="py-4 text-center text-sm text-gray-500">No proxy domains defined</p>
	{/if}

	<button
		type="button"
		onclick={addEntry}
		class="flex items-center gap-2 rounded-lg px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
	>
		<Plus class="h-4 w-4" />
		Add Proxy Domain
	</button>
</div>
