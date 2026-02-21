/* Ai Iq Menjačnica — Main JS */

(function () {
    'use strict';

    // ── Active nav link ──────────────────────────────────────────────
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav ul li a').forEach(function (link) {
        var href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // ── Hamburger / mobile nav ───────────────────────────────────────
    var hamburger = document.getElementById('hamburger');
    var nav = document.getElementById('main-nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // Close nav when a link is clicked (mobile)
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        // Close nav when clicking outside
        document.addEventListener('click', function (e) {
            if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
                nav.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ── Contact form ─────────────────────────────────────────────────
    var form = document.getElementById('contact-form');
    var formMessage = document.getElementById('form-message');

    if (form && formMessage) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var firstName = form.querySelector('#first-name');
            var email = form.querySelector('#email');
            var message = form.querySelector('#message');

            formMessage.className = 'form-message';
            formMessage.style.display = 'none';

            // Basic validation
            if (!firstName.value.trim()) {
                showFormMessage('error', 'Please enter your first name.');
                firstName.focus();
                return;
            }

            if (!email.value.trim() || !isValidEmail(email.value)) {
                showFormMessage('error', 'Please enter a valid email address.');
                email.focus();
                return;
            }

            if (!message.value.trim()) {
                showFormMessage('error', 'Please enter a message.');
                message.focus();
                return;
            }

            // Simulate submission (no backend yet)
            var submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';

            setTimeout(function () {
                form.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
                showFormMessage('success', '✅ Thank you! Your message has been sent. We\'ll get back to you within 24 hours.');
            }, 900);
        });
    }

    function isValidEmail(val) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }

    function showFormMessage(type, text) {
        formMessage.className = 'form-message ' + type;
        formMessage.textContent = text;
    }

}());
