<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { Shield, Loader2, AlertCircle, Check } from 'lucide-svelte';

	let username = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(true);
	let submitting = $state(false);
	let setupRequired = $state(false);

	onMount(async () => {
		try {
			const status = await api.getSetupStatus();
			if (!status.setup_required) {
				goto('/login');
				return;
			}
			setupRequired = true;
		} catch {
			error = 'Failed to check setup status';
		} finally {
			loading = false;
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}

		submitting = true;
		try {
			await api.completeSetup({ username, password });
			goto('/login');
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			error = apiError.message ?? 'Setup failed';
		} finally {
			submitting = false;
		}
	}

	const isValid = $derived(
		username.length >= 3 && password.length >= 8 && password === confirmPassword
	);
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
	{#if loading}
		<div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
			<Loader2 class="h-6 w-6 animate-spin" />
			<span>Loading...</span>
		</div>
	{:else if setupRequired}
		<form
			onsubmit={handleSubmit}
			class="w-96 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800"
		>
			<div class="mb-6 flex items-center justify-center gap-2">
				<Shield class="h-10 w-10 text-blue-600" />
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">vpner Setup</h1>
			</div>

			<p class="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
				Create the first admin account to get started.
			</p>

			{#if error}
				<div
					class="mb-4 flex items-center gap-2 rounded-lg bg-red-100 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400"
				>
					<AlertCircle class="h-5 w-5 flex-shrink-0" />
					<span>{error}</span>
				</div>
			{/if}

			<div class="space-y-4">
				<div>
					<label
						for="username"
						class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Username
					</label>
					<input
						id="username"
						type="text"
						placeholder="admin"
						autocomplete="username"
						bind:value={username}
						disabled={submitting}
						class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
					{#if username && username.length < 3}
						<p class="mt-1 text-xs text-red-500">Username must be at least 3 characters</p>
					{/if}
				</div>
				<div>
					<label
						for="password"
						class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Password
					</label>
					<input
						id="password"
						type="password"
						placeholder="Min 8 characters"
						autocomplete="new-password"
						bind:value={password}
						disabled={submitting}
						class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
					{#if password && password.length < 8}
						<p class="mt-1 text-xs text-red-500">Password must be at least 8 characters</p>
					{/if}
				</div>
				<div>
					<label
						for="confirmPassword"
						class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Confirm Password
					</label>
					<input
						id="confirmPassword"
						type="password"
						placeholder="Confirm password"
						autocomplete="new-password"
						bind:value={confirmPassword}
						disabled={submitting}
						class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
					{#if confirmPassword && password !== confirmPassword}
						<p class="mt-1 text-xs text-red-500">Passwords do not match</p>
					{:else if confirmPassword && password === confirmPassword}
						<p class="mt-1 flex items-center gap-1 text-xs text-green-500">
							<Check class="h-3 w-3" /> Passwords match
						</p>
					{/if}
				</div>
			</div>

			<button
				type="submit"
				disabled={submitting || !isValid}
				class="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if submitting}
					<Loader2 class="h-5 w-5 animate-spin" />
					Creating account...
				{:else}
					Create Admin Account
				{/if}
			</button>
		</form>
	{/if}
</div>
