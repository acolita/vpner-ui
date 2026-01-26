<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { useAuth } from '$lib/auth.svelte';
	import { onMount } from 'svelte';
	import { Home, Settings, Shield, LogOut, Route, Globe, Moon, Sun } from 'lucide-svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { children } = $props();

	const auth = useAuth();

	let darkMode = $state(false);

	onMount(() => {
		auth.checkAuth();
		darkMode = document.documentElement.classList.contains('dark');
	});

	// Redirect to login if not authenticated (after loading completes)
	$effect(() => {
		if (!auth.loading && !auth.authenticated && $page.url.pathname !== '/login') {
			goto('/login');
		}
	});

	function toggleDarkMode() {
		darkMode = !darkMode;
		document.documentElement.classList.toggle('dark', darkMode);
		localStorage.setItem('theme', darkMode ? 'dark' : 'light');
	}

	const isLoginPage = $derived($page.url.pathname === '/login');
</script>

<Toast />

{#if isLoginPage}
	{@render children()}
{:else}
	<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
		<nav class="bg-white shadow dark:bg-gray-800">
			<div class="mx-auto max-w-7xl px-4">
				<div class="flex h-16 justify-between">
					<div class="flex items-center">
						<a href="/" class="flex items-center">
							<Shield class="h-8 w-8 text-blue-600" />
							<span class="ml-2 text-xl font-semibold text-gray-900 dark:text-white">vpner</span>
						</a>
					</div>

					<div class="flex items-center space-x-4">
						<a
							href="/"
							class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
							class:bg-gray-100={$page.url.pathname === '/'}
							class:dark:bg-gray-700={$page.url.pathname === '/'}
							title="Dashboard"
						>
							<Home class="h-5 w-5" />
						</a>
						<a
							href="/routes"
							class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
							class:bg-gray-100={$page.url.pathname === '/routes'}
							class:dark:bg-gray-700={$page.url.pathname === '/routes'}
							title="Routes"
						>
							<Route class="h-5 w-5" />
						</a>
						<a
							href="/dns"
							class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
							class:bg-gray-100={$page.url.pathname === '/dns'}
							class:dark:bg-gray-700={$page.url.pathname === '/dns'}
							title="DNS"
						>
							<Globe class="h-5 w-5" />
						</a>
						<a
							href="/settings"
							class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
							class:bg-gray-100={$page.url.pathname === '/settings'}
							class:dark:bg-gray-700={$page.url.pathname === '/settings'}
							title="Settings"
						>
							<Settings class="h-5 w-5" />
						</a>

						<div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

						<button
							onclick={toggleDarkMode}
							class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
							title="Toggle dark mode"
						>
							{#if darkMode}
								<Sun class="h-5 w-5" />
							{:else}
								<Moon class="h-5 w-5" />
							{/if}
						</button>

						{#if auth.authenticated}
							<button
								onclick={() => auth.logout()}
								class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
								title="Logout"
							>
								<LogOut class="h-5 w-5" />
							</button>
						{/if}
					</div>
				</div>
			</div>
		</nav>

		<main class="mx-auto max-w-7xl px-4 py-6">
			{#if auth.loading}
				<div class="flex items-center justify-center py-12">
					<div
						class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
					></div>
				</div>
			{:else if auth.authenticated}
				{@render children()}
			{:else}
				<!-- Will redirect to login via effect -->
				<div class="flex items-center justify-center py-12">
					<div
						class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
					></div>
				</div>
			{/if}
		</main>
	</div>
{/if}
