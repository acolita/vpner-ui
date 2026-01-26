import '@testing-library/svelte/vitest';
import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
