document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.navbar-burger')
        .forEach(el => {
            el.addEventListener('click', () => {
                const menu = document.getElementById(el.dataset.target);
                el.classList.toggle('is-active');
                menu.classList.toggle('is-active');
            });
        });
});