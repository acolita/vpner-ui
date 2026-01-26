<script lang="ts">
	import { AlertTriangle, RefreshCw } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let error = $state<Error | null>(null);

	function handleError(e: ErrorEvent) {
		error = e.error;
		e.preventDefault();
	}

	function reset() {
		error = null;
	}

	$effect(() => {
		window.addEventListener('error', handleError);
		return () => window.removeEventListener('error', handleError);
	});
</script>

{#if error}
	<div class="flex min-h-[200px] items-center justify-center">
		<div class="p-6 text-center">
			<AlertTriangle class="mx-auto mb-4 h-12 w-12 text-red-500" />
			<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
				Something went wrong
			</h2>
			<p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
				{error.message}
			</p>
			<button
				onclick={reset}
				class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				<RefreshCw class="h-4 w-4" />
				Try Again
			</button>
		</div>
	</div>
{:else}
	{@render children()}
{/if}
