// Provider-independent seam. Intentionally no storage, network or analytics provider.
let eventHandler = null;
export function setHomepageEventHandler(handler) { eventHandler = typeof handler === 'function' ? handler : null; }
export function recordHomepageEvent(name, fields = {}) { eventHandler?.(name, fields); }
