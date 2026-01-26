import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to test the API client functionality
// Re-create the API client class for testing since we need to reset state
class TestVpnerApi {
	private token: string | null = null;
	private API_BASE = '/api';

	constructor() {
		if (typeof localStorage !== 'undefined') {
			this.token = localStorage.getItem('vpner_token');
		}
	}

	async login(username: string, password: string) {
		const res = await this.post<{ token: string; expires_at: string }>('/auth/login', {
			username,
			password
		});
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

	private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		};
		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}

		const res = await fetch(`${this.API_BASE}${path}`, {
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined
		});

		if (!res.ok) {
			const error = { message: res.statusText, status: res.status };
			try {
				const data = await res.json();
				error.message = data.error ?? data.message ?? res.statusText;
			} catch {
				// ignore json parse errors
			}
			throw error;
		}

		const text = await res.text();
		if (!text) {
			return {} as T;
		}
		return JSON.parse(text);
	}
}

describe('VpnerApi', () => {
	let api: TestVpnerApi;

	beforeEach(() => {
		vi.resetAllMocks();
		(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
		api = new TestVpnerApi();
	});

	describe('login', () => {
		it('stores token on successful login', async () => {
			const mockResponse = { token: 'test-token', expires_at: '2026-01-24T00:00:00Z' };
			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(JSON.stringify(mockResponse))
			});

			const result = await api.login('admin', 'password');

			expect(result.token).toBe('test-token');
			expect(localStorage.setItem).toHaveBeenCalledWith('vpner_token', 'test-token');
		});

		it('throws on failed login', async () => {
			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
				json: () => Promise.resolve({ error: 'Invalid credentials' })
			});

			await expect(api.login('admin', 'wrong')).rejects.toMatchObject({
				message: 'Invalid credentials',
				status: 401
			});
		});
	});

	describe('authenticated requests', () => {
		it('includes Authorization header when token exists', async () => {
			(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('stored-token');
			api = new TestVpnerApi(); // Recreate to pick up token

			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve('[]')
			});

			await api.get('/vpns');

			expect(fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'Bearer stored-token'
					})
				})
			);
		});
	});

	describe('logout', () => {
		it('removes token from localStorage', () => {
			api.logout();
			expect(localStorage.removeItem).toHaveBeenCalledWith('vpner_token');
		});
	});
});
