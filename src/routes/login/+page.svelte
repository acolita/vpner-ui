<script lang="ts">
	import { useAuth } from '$lib/auth.svelte';
	import { Shield, Loader2, AlertCircle } from 'lucide-svelte';

	const auth = useAuth();
	let username = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		try {
			await auth.login(username, password);
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			error = apiError.message ?? 'Login failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
	<form
		onsubmit={handleSubmit}
		class="w-96 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800"
	>
		<div class="mb-6 flex items-center justify-center gap-2">
			<Shield class="h-10 w-10 text-blue-600" />
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">vpner</h1>
		</div>

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
				<label for="username" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
					Username
				</label>
				<input
					id="username"
					type="text"
					placeholder="admin"
					autocomplete="username"
					bind:value={username}
					disabled={loading}
					class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>
			<div>
				<label for="password" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
					Password
				</label>
				<input
					id="password"
					type="password"
					placeholder="Password"
					autocomplete="current-password"
					bind:value={password}
					disabled={loading}
					class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>
		</div>

		<button
			type="submit"
			disabled={loading || !username || !password}
			class="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if loading}
				<Loader2 class="h-5 w-5 animate-spin" />
				Logging in...
			{:else}
				Login
			{/if}
		</button>
	</form>
</div>
