<script lang="ts">
	import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-svelte';
	import { useToast } from '$lib/stores/toast.svelte';

	const toast = useToast();

	const icons = {
		success: CheckCircle,
		error: XCircle,
		warning: AlertTriangle,
		info: Info
	};

	const colors = {
		success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
	};
</script>

<div class="fixed bottom-4 right-4 z-50 space-y-2">
	{#each toast.toasts as t (t.id)}
		<div
			class="flex items-center gap-2 rounded-lg p-4 shadow-lg {colors[t.type]}"
			role="alert"
		>
			<svelte:component this={icons[t.type]} class="h-5 w-5 flex-shrink-0" />
			<p class="flex-1 text-sm">{t.message}</p>
			<button
				onclick={() => toast.dismiss(t.id)}
				class="rounded p-1 hover:bg-black/10 dark:hover:bg-white/10"
				aria-label="Dismiss"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{/each}
</div>
