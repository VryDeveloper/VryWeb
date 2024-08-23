const $html = document.querySelector('html')
const $checkbox = document.querySelector('#chk')

$checkbox.addEventListener('change', function() {
    $html.classList.toggle('dark-mode')
})