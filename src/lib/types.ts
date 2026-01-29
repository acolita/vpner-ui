export interface VPNProfile {
	name: string;
	provider: 'openfortivpn' | 'openvpn';
	enabled: boolean;
	auto_connect: boolean;
	otp_required: boolean;
	routes: Route[];
	dns: DNSEntry[];
	proxy: ProxyEntry[];
	aliases: AliasEntry[];
	health_check?: HealthCheckConfig;
	failover?: FailoverConfig;
	schedule?: ScheduleConfig;
	// openfortivpn fields
	host?: string;
	port?: number;
	username?: string;
	password?: string;
	trusted_cert?: string;
	config_path?: string;
	// OpenVPN fields
	openvpn?: OpenVPNConfig;
}

export interface OpenVPNConfig {
	remote: string;
	port: number;
	proto: 'udp' | 'tcp';
	dev: 'tun' | 'tap';
	cipher: string;
	auth: string;
	ca?: string;
	cert?: string;
	key?: string;
	tls_auth?: string;
	tls_auth_direction?: number;
	auth_user?: string;
	auth_pass?: string;
}

export interface ConnectionStatus {
	profile_name: string;
	status:
		| 'connecting'
		| 'connected'
		| 'disconnecting'
		| 'disconnected'
		| 'failed'
		| 'waiting_for_otp'
		| 'reconnecting';
	interface?: string;
	pid?: number;
	started_at?: string;
	error_message?: string;
	otp_required: boolean;
	health?: HealthStatus;
	reconnect_count?: number;
	failover_active?: boolean;
	failover_profile?: string;
}

export interface Route {
	cidr: string;
	priority?: number;
}

export interface DNSEntry {
	domain: string;
	address?: string;
	server?: string;
}

export interface ProxyEntry {
	domain: string;
	port: number;
}

export interface AliasEntry {
	name: string;
	target: string;
	host?: string;
}

export interface HealthCheckConfig {
	target: string;
	interval: number;
	timeout: number;
	retries: number;
}

export interface HealthStatus {
	healthy: boolean;
	last_check: string;
	consecutive_failures: number;
}

export interface FailoverConfig {
	secondary_profile: string;
	trigger_on_failures: number;
	auto_restore: boolean;
	restore_check_interval?: number;
}

export interface ScheduleConfig {
	enabled: boolean;
	connect_at?: string;
	disconnect_at?: string;
	days?: string[];
}

export interface LoginResponse {
	token: string;
	expires_at: string;
}

export interface User {
	username: string;
	roles: string[];
	vpns: string[];
}

export interface ApiError {
	message: string;
	status: number;
}

export interface RouteHealthReport {
	timestamp: string;
	total_routes: number;
	active_routes: number;
	conflicts: RouteConflict[];
	overlaps: RouteOverlap[];
}

export interface RouteConflict {
	cidr: string;
	profiles: string[];
	severity: 'warning' | 'error';
}

export interface RouteOverlap {
	parent_cidr: string;
	child_cidr: string;
	parent_profile: string;
	child_profile: string;
}

export interface DefaultRouteStatus {
	status: string;
	current_route: {
		gateway: string;
		interface: string;
		captured_at: string;
	};
	saved_route?: {
		gateway: string;
		interface: string;
		captured_at: string;
	};
	monitoring: {
		enabled: boolean;
		auto_restore: boolean;
		check_interval: string;
		last_check: string;
	};
	history: {
		total_losses: number;
		total_restores: number;
		last_loss?: string;
		last_restore?: string;
	};
}

export interface RouteEntry {
	profile_name: string;
	cidr: string;
	priority: number;
	device?: string;
	active: boolean;
}

export interface SystemRouteComparison {
	vpner_routes: VpnerRoute[];
	system_routes: SystemRoute[];
	discrepancies: RouteDiscrepancy[];
}

export interface VpnerRoute {
	cidr: string;
	interface: string;
	profile: string;
}

export interface SystemRoute {
	cidr: string;
	interface: string;
	gateway?: string;
}

export interface RouteDiscrepancy {
	type: 'missing_in_system' | 'unexpected_route' | 'interface_mismatch';
	cidr: string;
	expected_interface?: string;
	actual_interface?: string;
	reason: string;
}

export interface RouteHistoryEvent {
	id: number;
	type: 'lost' | 'restored' | 'captured';
	timestamp: string;
	details: string;
	method?: string;
	vpn_context?: {
		active_vpns: string[];
	};
}

export interface DNSEntryWithProfile extends DNSEntry {
	profile_name?: string;
}

export interface LocalDNSEntry {
	id: number;
	domain: string;
	address: string;
	description?: string;
	enabled: boolean;
}

// Settings types
export interface Setting {
	key: string;
	value: string;
	value_type: 'string' | 'int' | 'bool' | 'duration';
	category: string;
	updated_at: string;
}

export interface SettingsByCategory {
	[category: string]: Setting[];
}

export interface SettingsUpdate {
	[key: string]: string | number | boolean;
}

// Admin user types
export interface AdminUser {
	id: number;
	username: string;
	roles: string[];
	vpns: string[];
	created_at: string;
	updated_at: string;
	last_login?: string;
}

export interface CreateAdminUserRequest {
	username: string;
	password: string;
	roles?: string[];
	vpns?: string[];
}

export interface UpdateAdminUserRequest {
	username?: string;
	roles?: string[];
	vpns?: string[];
}

export interface ChangePasswordRequest {
	password: string;
}

// Setup types
export interface SetupStatus {
	setup_required: boolean;
	message?: string;
}

export interface SetupCompleteRequest {
	username: string;
	password: string;
}
