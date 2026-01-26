import type { ApiError, LoginResponse } from './types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

class VpnerApi {
	private token: string | null = null;

	constructor() {
		if (typeof localStorage !== 'undefined') {
			this.token = localStorage.getItem('vpner_token');
		}
	}

	async login(username: string, password: string): Promise<LoginResponse> {
		const res = await this.post<LoginResponse>('/auth/login', { username, password });
		this.token = res.token;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('vpner_token', res.token);
		}
		return res;
	}

	logout(): void {
		this.token = null;
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem('vpner_token');
		}
	}

	isAuthenticated(): boolean {
		return !!this.token;
	}

	async get<T>(path: string): Promise<T> {
		return this.request<T>('GET', path);
	}

	async post<T>(path: string, body?: unknown): Promise<T> {
		return this.request<T>('POST', path, body);
	}

	async put<T>(path: string, body?: unknown): Promise<T> {
		return this.request<T>('PUT', path, body);
	}

	async delete<T>(path: string): Promise<T> {
		return this.request<T>('DELETE', path);
	}

	private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		};
		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}

		const res = await fetch(`${API_BASE}${path}`, {
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined
		});

		if (!res.ok) {
			const error: ApiError = { message: res.statusText, status: res.status };
			try {
				const data = await res.json();
				error.message = data.error ?? data.message ?? res.statusText;
			} catch {
				// ignore json parse errors
			}
			throw error;
		}

		// Handle empty responses
		const text = await res.text();
		if (!text) {
			return {} as T;
		}
		return JSON.parse(text);
	}
}

export const api = new VpnerApi();
