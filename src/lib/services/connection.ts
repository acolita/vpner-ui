import { api } from '$lib/api';
import type { ConnectionStatus } from '$lib/types';

export interface ConnectOptions {
	timeout?: number; // seconds, default 15
}

export interface ConnectResult {
	status: ConnectionStatus;
	otpRequired: boolean;
}

export async function connect(
	vpnName: string,
	options: ConnectOptions = {}
): Promise<ConnectResult> {
	const timeout = options.timeout ?? 15;
	const status = await api.post<ConnectionStatus>(`/vpns/${vpnName}/connect?timeout=${timeout}`);

	return {
		status,
		otpRequired: status.status === 'waiting_for_otp' || status.otp_required
	};
}

export async function submitOTP(
	vpnName: string,
	token: string,
	options: ConnectOptions = {}
): Promise<ConnectionStatus> {
	const timeout = options.timeout ?? 30;
	return api.post<ConnectionStatus>(`/vpns/${vpnName}/otp?timeout=${timeout}`, { token });
}

export async function disconnect(vpnName: string): Promise<ConnectionStatus> {
	return api.post<ConnectionStatus>(`/vpns/${vpnName}/disconnect`);
}

export async function getStatus(vpnName: string): Promise<ConnectionStatus> {
	return api.get<ConnectionStatus>(`/vpns/${vpnName}/status`);
}
