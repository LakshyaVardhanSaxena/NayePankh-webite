
'use strict';

//     NAVBAR SCROLL STATE
//    Adds .scrolled class when page is scrolled past 60px.


   (function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once immediately on page load
})();


//     MOBILE MENU 
//    Opens/closes the slide-in nav drawer on mobile.


   (function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const overlay   = document.getElementById('navOverlay');
  if (!hamburger || !navLinks) return;

  function openMenu() {
    navLinks.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    if (overlay) {
      overlay.classList.add('active');
      overlay.removeAttribute('aria-hidden');
    }
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  // Toggle on hamburger click
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close when any nav link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close when overlay is clicked
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
  });
})();


//    ACTIVE NAV HIGHLIGHT (Intersection Observer)
//    Watches each section and marks the corresponding nav link
//    as .active when that section is visible in the viewport.


   (function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  // Build a map:  sectionId → navLink element
  const linkMap = {};
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      linkMap[href.slice(1)] = link;
    }
  });

  let currentId = '';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === currentId) return;
          currentId = id;

          // Remove .active from all links
          links.forEach(l => {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
          });

          // Add .active to matching link
          if (linkMap[id]) {
            linkMap[id].classList.add('active');
            linkMap[id].setAttribute('aria-current', 'page');
          }
        }
      });
    },
    {
      // Trigger when a section occupies the middle 40% of the viewport
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    }
  );

  sections.forEach(sec => observer.observe(sec));
})();


//     SCROLL REVEAL ANIMATIONS (Intersection Observer)
//    Adds .visible class to elements with class .reveal
//    once they enter the viewport, triggering CSS transitions.


   (function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  // Respect user's reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;

        // Stagger siblings inside the same parent container
        const siblings = Array.from(
          el.parentElement.querySelectorAll('.reveal:not(.visible)')
        );
        const idx = siblings.indexOf(el);

        setTimeout(() => {
          el.classList.add('visible');
        }, Math.max(0, idx * 90)); // 90ms stagger between siblings

        observer.unobserve(el);
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealEls.forEach(el => observer.observe(el));
})();

//     CONTACT FORM VALIDATION + SIMULATED SUBMIT


   (function initContactForm() {
  const form       = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn  = document.getElementById('submitBtn');
  const successBox = document.getElementById('formSuccess');

  // Field definitions: { input element, error span, validator function }
  const fields = [
    {
      input: document.getElementById('fname'),
      error: document.getElementById('nameErr'),
      validate(val) {
        if (!val) return 'Full name is required.';
        if (val.length < 2) return 'Name must be at least 2 characters.';
        return null;
      },
    },
    {
      input: document.getElementById('femail'),
      error: document.getElementById('emailErr'),
      validate(val) {
        if (!val) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) return 'Please enter a valid email address.';
        return null;
      },
    },
    {
      input: document.getElementById('fsubject'),
      error: document.getElementById('subjectErr'),
      validate(val) {
        if (!val) return 'Subject is required.';
        if (val.length < 3) return 'Subject must be at least 3 characters.';
        return null;
      },
    },
    {
      input: document.getElementById('fmessage'),
      error: document.getElementById('messageErr'),
      validate(val) {
        if (!val) return 'Message is required.';
        if (val.length < 10) return 'Message must be at least 10 characters.';
        return null;
      },
    },
  ];

  // Show error for a field
  function showError(field, msg) {
    field.input.classList.add('invalid');
    field.error.textContent = msg;
    field.input.setAttribute('aria-invalid', 'true');
  }

  // Clear error for a field
  function clearError(field) {
    field.input.classList.remove('invalid');
    field.error.textContent = '';
    field.input.removeAttribute('aria-invalid');
  }

  // Validate one field, returns true if valid
  function validateField(field) {
    const val = field.input.value.trim();
    const err = field.validate(val);
    if (err) {
      showError(field, err);
      return false;
    }
    clearError(field);
    return true;
  }

  // Live validation: clear error as user types (after first blur)
  fields.forEach(field => {
    let touched = false;

    field.input.addEventListener('blur', () => {
      touched = true;
      validateField(field);
    });

    field.input.addEventListener('input', () => {
      if (touched) validateField(field);
    });
  });

  // Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Hide previous success message
    successBox.classList.remove('show');

    // Validate all fields
    const results = fields.map(f => validateField(f));
    const allValid = results.every(Boolean);

    if (!allValid) {
      // Focus the first invalid field for accessibility
      const firstInvalid = fields.find(f => f.input.classList.contains('invalid'));
      if (firstInvalid) firstInvalid.input.focus();
      return;
    }

    // ── Simulated async submit ──
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"
        style="width:18px;height:18px;animation:spin .7s linear infinite">
        <circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
      </svg>
      Sending…
    `;

    // Add spin keyframe dynamically (once)
    if (!document.getElementById('spinStyle')) {
      const style = document.createElement('style');
      style.id = 'spinStyle';
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }

    setTimeout(() => {
      // Success!
      form.reset();

      // Clear all error states
      fields.forEach(f => clearError(f));

      successBox.textContent = '🎉 Thank you! Your message has been received. We\'ll get back to you within 24 hours.';
      successBox.classList.add('show');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Restore button
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        Send Message
      `;

      // Hide success message after 7 seconds
      setTimeout(() => successBox.classList.remove('show'), 7000);

    }, 1400); // simulated network delay
  });
})();


//     SMOOTH SCROLL (with sticky-nav offset)
//    Overrides default anchor behaviour to account for the
//    fixed navbar height.


(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const navHeight = document.getElementById('navbar')?.offsetHeight || 72;
    const offsetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  });
})();


//     BACK TO TOP BUTTON
//    Shows after scrolling 500px, scrolls smoothly to top.

(function initBackToTop() {
  const btn = document.getElementById('bttBtn');
  if (!btn) return;

  // Show / hide based on scroll position
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });

  // Scroll to top on click
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();



//     FOOTER YEAR
//    Automatically inserts the current year in the footer.

(function setFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();