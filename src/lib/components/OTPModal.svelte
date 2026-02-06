<script lang="ts">
	import { Key, X, Loader2, AlertCircle } from 'lucide-svelte';

	interface Props {
		vpnName: string;
		open: boolean;
		onSubmit: (token: string) => Promise<void>;
		onCancel: () => void;
		title?: string;
		buttonText?: string;
		loadingText?: string;
	}

	let {
		vpnName,
		open,
		onSubmit,
		onCancel,
		title,
		buttonText = 'Connect',
		loadingText = 'Connecting...'
	}: Props = $props();

	let token = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);
	let inputRef: HTMLInputElement | undefined = $state();

	const modalTitle = $derived(title ?? `Enter OTP for ${vpnName}`);

	$effect(() => {
		if (open) {
			token = '';
			error = null;
			// Focus after modal renders
			setTimeout(() => inputRef?.focus(), 50);
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!token || token.length !== 6) {
			error = 'Please enter a 6-digit OTP code';
			return;
		}

		loading = true;
		error = null;

		try {
			await onSubmit(token);
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			error = apiError.message ?? 'Failed to submit OTP';
			token = '';
			inputRef?.focus();
		} finally {
			loading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && !loading) {
			onCancel();
		}
	}

	function handleBackdropClick() {
		if (!loading) {
			onCancel();
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="otp-title"
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="mx-4 w-96 max-w-full rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 id="otp-title" class="flex items-center gap-2 text-lg font-semibold">
					<Key class="h-5 w-5 text-blue-500" />
					{modalTitle}
				</h2>
				<button
					onclick={onCancel}
					disabled={loading}
					class="rounded p-1 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
					aria-label="Close"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<form onsubmit={handleSubmit}>
				{#if error}
					<div
						class="mb-4 flex items-center gap-2 rounded-lg bg-red-100 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400"
					>
						<AlertCircle class="h-4 w-4 flex-shrink-0" />
						<span class="text-sm">{error}</span>
					</div>
				{/if}

				<p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
					Enter the 6-digit code from your authenticator app.
				</p>
				<p class="mb-4 text-sm font-medium text-yellow-600 dark:text-yellow-400">
					Act quickly - OTP expires in ~30 seconds!
				</p>

				<input
					bind:this={inputRef}
					bind:value={token}
					type="text"
					inputmode="numeric"
					pattern="[0-9]*"
					maxlength="6"
					placeholder="000000"
					disabled={loading}
					autocomplete="one-time-code"
					class="w-full rounded-lg border border-gray-300 p-4 text-center font-mono text-2xl tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700"
				/>

				<div class="mt-4 flex gap-2">
					<button
						type="button"
						onclick={onCancel}
						disabled={loading}
						class="flex-1 rounded-lg border px-4 py-2 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={loading || token.length !== 6}
						class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if loading}
							<Loader2 class="h-4 w-4 animate-spin" />
							{loadingText}
						{:else}
							{buttonText}
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
