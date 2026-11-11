// One site-wide channel for things worth counting (achievements listen; senders do not know who).
export const emit = (type, detail = {}) => document.dispatchEvent(new CustomEvent('vw:event', { detail: { type, ...detail } }));
