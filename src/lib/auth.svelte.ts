import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { api } from './api';
import type { User } from './types';

let user = $state<User | null>(null);
let loading = $state(true);
let initialized = $state(false);

export function useAuth() {
	async function checkAuth() {
		if (!browser) return;
		if (initialized) return;

		loading = true;
		try {
			if (api.isAuthenticated()) {
				user = await api.get<User>('/auth/me');
			}
		} catch {
			user = null;
			api.logout();
		} finally {
			loading = false;
			initialized = true;
		}
	}

	async function login(username: string, password: string) {
		await api.login(username, password);
		user = await api.get<User>('/auth/me');
		goto('/');
	}

	function logout() {
		api.logout();
		user = null;
		goto('/login');
	}

	return {
		get user() {
			return user;
		},
		get loading() {
			return loading;
		},
		get authenticated() {
			return !!user;
		},
		checkAuth,
		login,
		logout
	};
}
