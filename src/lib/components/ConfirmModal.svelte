<script lang="ts">
	import { AlertTriangle, Loader2 } from 'lucide-svelte';

	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmText?: string;
		loadingText?: string;
		confirmClass?: string;
		loading?: boolean;
		onConfirm: () => void | Promise<void>;
		onCancel: () => void;
	}

	let {
		open,
		title,
		message,
		confirmText = 'Confirm',
		loadingText = 'Processing...',
		confirmClass = 'bg-blue-600 hover:bg-blue-700',
		loading = false,
		onConfirm,
		onCancel
	}: Props = $props();

	// Local state to track request in flight (guards against double-click)
	let requestInFlight = $state(false);

	const isLoading = $derived(loading || requestInFlight);

	async function handleConfirm() {
		if (requestInFlight) return;
		requestInFlight = true;
		try {
			await onConfirm();
		} finally {
			requestInFlight = false;
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={onCancel}
		onkeydown={(e) => e.key === 'Escape' && onCancel()}
		role="dialog"
		aria-modal="true"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="mx-4 w-96 max-w-full rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			<div class="mb-4 flex items-start gap-3">
				<AlertTriangle class="mt-0.5 h-6 w-6 flex-shrink-0 text-yellow-500" />
				<div>
					<h2 class="text-lg font-semibold">{title}</h2>
					<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{message}</p>
				</div>
			</div>

			<div class="flex justify-end gap-2">
				<button
					onclick={onCancel}
					disabled={isLoading}
					class="rounded-lg border px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
				>
					Cancel
				</button>
				<button
					onclick={handleConfirm}
					disabled={isLoading}
					class="flex items-center gap-2 rounded-lg px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50 {confirmClass}"
				>
					{#if isLoading}
						<Loader2 class="h-4 w-4 animate-spin" />
						{loadingText}
					{:else}
						{confirmText}
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
