// The region is a manual popover so toasts render in the top layer, above open dialogs.
const region = document.getElementById('toasts');

export function toast(message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    region.append(el);

    // re-showing moves the popover above a dialog opened after the last toast
    if (region.showPopover) {
        if (region.matches(':popover-open')) region.hidePopover();
        region.showPopover();
    }

    setTimeout(() => {
        el.remove();
        if (!region.children.length && region.matches?.(':popover-open')) region.hidePopover();
    }, 2800);
}
