/**
 * Watch for tab visibility changes and call appropriate callbacks.
 * Returns a cleanup function to remove the listener.
 */
export function onVisibilityChange(
	onVisible: () => void,
	onHidden: () => void
): () => void {
	function handler() {
		if (document.hidden) {
			onHidden();
		} else {
			onVisible();
		}
	}

	document.addEventListener('visibilitychange', handler);

	return () => {
		document.removeEventListener('visibilitychange', handler);
	};
}
