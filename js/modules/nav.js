export function initNav() {
    const btnMenu = document.getElementById('btn-abrir-menu');
    const menuMobile = document.getElementById('menu-mobile');
    const main = document.querySelector('main');

    function setMenu(open) {
        menuMobile.classList.toggle('abrir-menu', open);
        btnMenu.setAttribute('aria-expanded', String(open));
        main.inert = open;
    }

    btnMenu.addEventListener('click', () => setMenu(true));
    document.getElementById('overlay-menu-mobile').addEventListener('click', () => setMenu(false));
    // close only on a link or the X button, not on any click inside the panel
    menuMobile.addEventListener('click', e => { if (e.target.closest('a, .btn-fechar')) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
}
