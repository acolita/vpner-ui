<script lang="ts">
	import { Link, ExternalLink } from 'lucide-svelte';
	import type { AliasEntry } from '$lib/types';

	interface Props {
		aliases: AliasEntry[];
		profileName: string;
		baseDomain?: string;
	}

	let { aliases, profileName, baseDomain = 'vpner.local' }: Props = $props();

	function getFullDomain(alias: AliasEntry): string {
		return `${alias.name}.${profileName}.${baseDomain}`;
	}
</script>

{#if aliases.length === 0}
	<p class="text-gray-500 dark:text-gray-400">No aliases configured.</p>
{:else}
	<div class="space-y-2">
		{#each aliases as alias (alias.name)}
			<div
				class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
			>
				<div class="flex items-center gap-3">
					<Link class="h-4 w-4 text-gray-400" />
					<div>
						<p class="font-mono text-sm text-gray-900 dark:text-white">{getFullDomain(alias)}</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							<span class="text-gray-400">&rarr;</span>
							{alias.target}
							{#if alias.host}
								<span class="ml-2 rounded bg-gray-200 px-1 dark:bg-gray-600">
									Host: {alias.host}
								</span>
							{/if}
						</p>
					</div>
				</div>
				<a
					href="http://{getFullDomain(alias)}"
					target="_blank"
					rel="noopener noreferrer"
					class="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
					title="Open in new tab"
				>
					<ExternalLink class="h-4 w-4 text-gray-500" />
				</a>
			</div>
		{/each}
	</div>
{/if}
