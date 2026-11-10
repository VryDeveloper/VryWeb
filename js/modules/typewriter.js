// The hero's profile.ts types itself once, then one entry of the stack array keeps
// rotating. The full code is in the HTML; this only hides and re-reveals its text.
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function initTypewriter() {
    const code = document.getElementById('hero-code-text');
    if (!code || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // lock the height first so the card does not grow line by line
    const pre = code.parentElement;
    pre.style.minHeight = `${pre.offsetHeight}px`;

    const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const texts = nodes.map(n => n.data);
    nodes.forEach(n => { n.data = ''; });

    await sleep(500); // let the card's entrance finish
    for (let i = 0; i < nodes.length; i++) {
        for (const char of texts[i]) {
            nodes[i].data += char;
            // indentation and line breaks appear instantly, like an editor
            if (char.trim()) await sleep(11);
        }
    }

    const slot = code.querySelector('[data-rotate]');
    if (!slot) return;
    const words = slot.dataset.rotate.split(',');
    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(pre);

    for (let i = 1; ; i = (i + 1) % words.length) {
        await sleep(2600);
        if (!visible || document.hidden) continue;
        while (slot.textContent.length > 2) {   // keep the two quotes
            slot.textContent = `"${slot.textContent.slice(1, -2)}"`;
            await sleep(45);
        }
        for (let n = 1; n <= words[i].length; n++) {
            slot.textContent = `"${words[i].slice(0, n)}"`;
            await sleep(70);
        }
    }
}
