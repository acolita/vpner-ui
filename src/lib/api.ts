import type {
	ApiError,
	LoginResponse,
	Setting,
	SettingsByCategory,
	SettingsUpdate,
	AdminUser,
	CreateAdminUserRequest,
	UpdateAdminUserRequest,
	ChangePasswordRequest,
	SetupStatus,
	SetupCompleteRequest
} from './types';

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

	// Settings API
	async getSettings(): Promise<SettingsByCategory> {
		return this.get<SettingsByCategory>('/settings');
	}

	async getSettingsByCategory(category: string): Promise<Setting[]> {
		return this.get<Setting[]>(`/settings/${category}`);
	}

	async updateSettings(settings: SettingsUpdate): Promise<void> {
		await this.put('/settings', settings);
	}

	async exportSettings(): Promise<string> {
		const res = await fetch(`${API_BASE}/settings/export`, {
			headers: this.token ? { Authorization: `Bearer ${this.token}` } : {}
		});
		if (!res.ok) throw { message: res.statusText, status: res.status };
		return res.text();
	}

	async importSettings(yaml: string): Promise<{ imported: number }> {
		const res = await fetch(`${API_BASE}/settings/import`, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain',
				...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
			},
			body: yaml
		});
		if (!res.ok) {
			const error: ApiError = { message: res.statusText, status: res.status };
			try {
				const data = await res.json();
				error.message = data.error ?? data.message ?? res.statusText;
			} catch {
				// ignore
			}
			throw error;
		}
		return res.json();
	}

	// Admin Users API
	async listAdminUsers(): Promise<AdminUser[]> {
		return this.get<AdminUser[]>('/admin/users');
	}

	async getAdminUser(id: number): Promise<AdminUser> {
		return this.get<AdminUser>(`/admin/users/${id}`);
	}

	async createAdminUser(data: CreateAdminUserRequest): Promise<AdminUser> {
		return this.post<AdminUser>('/admin/users', data);
	}

	async updateAdminUser(id: number, data: UpdateAdminUserRequest): Promise<AdminUser> {
		return this.put<AdminUser>(`/admin/users/${id}`, data);
	}

	async deleteAdminUser(id: number): Promise<void> {
		await this.delete(`/admin/users/${id}`);
	}

	async changeAdminPassword(id: number, data: ChangePasswordRequest): Promise<void> {
		await this.post(`/admin/users/${id}/password`, data);
	}

	// Setup API
	async getSetupStatus(): Promise<SetupStatus> {
		return this.get<SetupStatus>('/setup/status');
	}

	async completeSetup(data: SetupCompleteRequest): Promise<{ message: string; username: string }> {
		return this.post('/setup/complete', data);
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
