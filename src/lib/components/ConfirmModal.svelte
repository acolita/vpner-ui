<script lang="ts">
	import { AlertTriangle } from 'lucide-svelte';

	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmText?: string;
		confirmClass?: string;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		open,
		title,
		message,
		confirmText = 'Confirm',
		confirmClass = 'bg-blue-600 hover:bg-blue-700',
		onConfirm,
		onCancel
	}: Props = $props();
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
					class="rounded-lg border px-4 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
				>
					Cancel
				</button>
				<button onclick={onConfirm} class="rounded-lg px-4 py-2 text-white {confirmClass}">
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}
