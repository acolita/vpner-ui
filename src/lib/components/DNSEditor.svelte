<script lang="ts">
	import { Plus, Trash2 } from 'lucide-svelte';
	import type { DNSEntry } from '$lib/types';

	interface Props {
		entries: DNSEntry[];
	}

	let { entries = $bindable() }: Props = $props();

	function addEntry() {
		entries = [...entries, { domain: '', address: '' }];
	}

	function removeEntry(index: number) {
		entries = entries.filter((_, i) => i !== index);
	}

	function getEntryType(entry: DNSEntry): 'static' | 'forward' {
		// Check for server field - treat empty string as not set
		return entry.server != null && entry.server !== '' ? 'forward' : 'static';
	}

	function setEntryType(index: number, type: 'static' | 'forward') {
		const entry = entries[index];
		if (type === 'static') {
			// Moving to static: copy server to address, clear server
			entry.address = entry.server ?? entry.address ?? '';
			entry.server = undefined;
		} else {
			// Moving to forward: copy address to server, clear address
			entry.server = entry.address ?? entry.server ?? '';
			entry.address = undefined;
		}
		// Force reactivity by reassigning the array
		entries = [...entries];
	}

	function isForwardType(entry: DNSEntry): boolean {
		return entry.server != null && entry.server !== '';
	}
</script>

<div class="space-y-2">
	{#each entries as entry, i (i)}
		<div class="flex items-center gap-2">
			<input
				bind:value={entry.domain}
				type="text"
				placeholder="*.internal.example.com"
				class="flex-1 rounded-lg border p-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
			/>
			<select
				value={getEntryType(entry)}
				onchange={(e) => {
					const target = e.target as HTMLSelectElement;
					setEntryType(i, target.value as 'static' | 'forward');
				}}
				class="rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
			>
				<option value="static">Static IP</option>
				<option value="forward">Forward</option>
			</select>
			{#if isForwardType(entry)}
				<input
					bind:value={entry.server}
					type="text"
					placeholder="10.0.0.53"
					class="w-40 rounded-lg border p-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
				/>
			{:else}
				<input
					bind:value={entry.address}
					type="text"
					placeholder="10.0.0.1"
					class="w-40 rounded-lg border p-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
				/>
			{/if}
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
		<p class="py-4 text-center text-sm text-gray-500">No DNS entries defined</p>
	{/if}

	<button
		type="button"
		onclick={addEntry}
		class="flex items-center gap-2 rounded-lg px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
	>
		<Plus class="h-4 w-4" />
		Add DNS Entry
	</button>
</div>
