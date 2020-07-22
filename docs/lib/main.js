'use strict';

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.navbar-burger').forEach(function (el) {
        el.addEventListener('click', function () {
            var menu = document.getElementById(el.dataset.target);
            el.classList.toggle('is-active');
            menu.classList.toggle('is-active');
        });
    });
});