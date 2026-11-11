// Contact actions shared by the command palette and the terminal.
import { t } from './i18n.js';
import { toast } from './toast.js';

export const EMAIL = 'victor.092.augusto@gmail.com';
export const LINKEDIN = 'https://www.linkedin.com/in/victor-augusto-79a5612b6/';
export const GITHUB = 'https://github.com/VryDeveloper';
export const WHATSAPP = '5531996588742';
export const CV = 'assets/curriculo.pdf';

export const openURL = url => window.open(url, '_blank', 'noopener');

export async function copyEmail() {
    try {
        await navigator.clipboard.writeText(EMAIL);
        toast(t({ pt: 'E-mail copiado', en: 'Email copied' }));
    } catch {
        toast(EMAIL);
    }
}

export function downloadCV() {
    const a = Object.assign(document.createElement('a'), { href: CV, download: 'Victor Augusto - CV.pdf' });
    a.click();
}

export const whatsappURL = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
