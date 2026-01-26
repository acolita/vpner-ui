import { test, expect } from '@playwright/test';

test.describe('Connection Flow', () => {
	test.beforeEach(async ({ page }) => {
		// Mock VPN profile
		await page.route('**/api/vpns/test-vpn', async (route) => {
			await route.fulfill({
				json: {
					name: 'test-vpn',
					provider: 'openfortivpn',
					enabled: true,
					auto_connect: false,
					routes: [{ cidr: '10.0.0.0/8', priority: 100 }],
					dns: [],
					proxy: [],
					aliases: []
				}
			});
		});
	});

	test('connects non-OTP VPN', async ({ page }) => {
		// Mock initial status as disconnected
		await page.route('**/api/vpns/test-vpn/status', async (route) => {
			await route.fulfill({
				json: {
					profile_name: 'test-vpn',
					status: 'disconnected',
					otp_required: false
				}
			});
		});

		// Mock connect endpoint
		await page.route('**/api/vpns/test-vpn/connect*', async (route) => {
			await route.fulfill({
				json: {
					profile_name: 'test-vpn',
					status: 'connected',
					interface: 'ppp0',
					otp_required: false
				}
			});
		});

		await page.goto('/vpn/test-vpn');
		await page.getByRole('button', { name: /connect/i }).click();

		// Should show toast or update status
		await expect(page.getByText(/connected/i)).toBeVisible();
	});

	test('shows OTP modal for OTP-required VPN', async ({ page }) => {
		// Mock OTP-required VPN
		await page.route('**/api/vpns/otp-vpn', async (route) => {
			await route.fulfill({
				json: {
					name: 'otp-vpn',
					provider: 'openfortivpn',
					enabled: true,
					auto_connect: false,
					routes: [],
					dns: [],
					proxy: [],
					aliases: []
				}
			});
		});

		await page.route('**/api/vpns/otp-vpn/status', async (route) => {
			await route.fulfill({
				json: {
					profile_name: 'otp-vpn',
					status: 'disconnected',
					otp_required: true
				}
			});
		});

		await page.route('**/api/vpns/otp-vpn/connect*', async (route) => {
			await route.fulfill({
				json: {
					profile_name: 'otp-vpn',
					status: 'waiting_for_otp',
					otp_required: true
				}
			});
		});

		await page.goto('/vpn/otp-vpn');
		await page.getByRole('button', { name: /connect/i }).click();

		// Should show OTP modal
		await expect(page.getByText(/enter.*otp|token/i)).toBeVisible();
	});
});
