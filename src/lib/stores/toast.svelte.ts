type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
	id: string;
	type: ToastType;
	message: string;
}

let toasts = $state<Toast[]>([]);

export function useToast() {
	function show(type: ToastType, message: string, duration = 5000) {
		const id = Math.random().toString(36).slice(2);
		toasts = [...toasts, { id, type, message }];

		if (duration > 0) {
			setTimeout(() => dismiss(id), duration);
		}

		return id;
	}

	function dismiss(id: string) {
		toasts = toasts.filter((t) => t.id !== id);
	}

	function dismissAll() {
		toasts = [];
	}

	return {
		get toasts() {
			return toasts;
		},
		success: (msg: string, duration?: number) => show('success', msg, duration),
		error: (msg: string, duration?: number) => show('error', msg, duration ?? 8000),
		warning: (msg: string, duration?: number) => show('warning', msg, duration),
		info: (msg: string, duration?: number) => show('info', msg, duration),
		dismiss,
		dismissAll
	};
}
