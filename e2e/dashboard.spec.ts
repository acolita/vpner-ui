import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
	test.beforeEach(async ({ page }) => {
		// Mock API responses
		await page.route('**/api/vpns', async (route) => {
			await route.fulfill({
				json: [
					{
						name: 'test-vpn',
						provider: 'openfortivpn',
						enabled: true,
						auto_connect: false,
						routes: [{ cidr: '10.0.0.0/8', priority: 100 }],
						dns: [],
						proxy: [],
						aliases: []
					}
				]
			});
		});

		await page.route('**/api/vpns/*/status', async (route) => {
			await route.fulfill({
				json: {
					profile_name: 'test-vpn',
					status: 'disconnected',
					otp_required: false
				}
			});
		});

		await page.goto('/');
	});

	test('displays VPN cards', async ({ page }) => {
		await expect(page.getByText('test-vpn')).toBeVisible();
		await expect(page.getByText('openfortivpn')).toBeVisible();
	});

	test('navigates to VPN detail on card click', async ({ page }) => {
		await page.getByText('test-vpn').click();
		await expect(page).toHaveURL('/vpn/test-vpn');
	});

	test('shows Add VPN button', async ({ page }) => {
		await expect(page.getByRole('link', { name: /add vpn/i })).toBeVisible();
	});

	test('displays route count on card', async ({ page }) => {
		await expect(page.getByText('1 routes')).toBeVisible();
	});
});
