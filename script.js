/* ============================================================
   Portfolio – Main Script
   Vanilla JS · No dependencies
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------------------------
     0. CACHED SELECTORS
  ---------------------------------------------------------- */
  const header        = document.querySelector('.header');
  const hamburger     = document.querySelector('.hamburger');
  const mobileMenu    = document.querySelector('.mobile-menu');
  const navLinks      = document.querySelectorAll('.nav-links a, .mobile-menu a');
  const sections      = document.querySelectorAll('section[id]');
  const filterTabs    = document.querySelectorAll('.filter-tab');
  const projectCards  = document.querySelectorAll('.project-card');
  const modalOverlay  = document.querySelector('.modal-overlay');
  const modalClose    = document.querySelector('.modal-close');
  const modalBody     = document.getElementById('modalContent');
  const contactForm   = document.getElementById('contactForm');
  const statNumbers   = document.querySelectorAll('.stat-number');
  const statsSection  = document.querySelector('.stats');

  const HEADER_OFFSET = 80;

  /* ----------------------------------------------------------
     1. SMOOTH SCROLLING
  ---------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        e.preventDefault();

        const targetPosition = targetEl.getBoundingClientRect().top
                             + window.pageYOffset
                             - HEADER_OFFSET;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile menu after clicking a nav link
        closeMobileMenu();
      });
    });
  }

  /* ----------------------------------------------------------
     2. STICKY HEADER WITH SCROLL DETECTION
  ---------------------------------------------------------- */
  function initStickyHeader() {
    if (!header) return;

    const SCROLL_THRESHOLD = 50;

    function onScroll() {
      if (window.scrollY > SCROLL_THRESHOLD) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set correct state on load
  }

  /* ----------------------------------------------------------
     3. MOBILE HAMBURGER MENU
  ---------------------------------------------------------- */
  function closeMobileMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.add('open');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function toggleMobileMenu() {
    if (!mobileMenu) return;
    if (mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function initMobileMenu() {
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (
        mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    // Close menu when clicking a nav link inside it
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  /* ----------------------------------------------------------
     4. ACTIVE NAV LINK HIGHLIGHTING
  ---------------------------------------------------------- */
  function initActiveNavHighlight() {
    const sectionIds = ['hero', 'about', 'skills', 'projects', 'contact'];
    const observedSections = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observedSections.push(el);
    });

    if (observedSections.length === 0) return;

    function setActiveLink(id) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${id}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    const observerOptions = {
      root: null,
      rootMargin: `-${HEADER_OFFSET}px 0px -40% 0px`,
      threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    }, observerOptions);

    observedSections.forEach(section => observer.observe(section));
  }

  /* ----------------------------------------------------------
     5. PROJECT FILTER TABS
  ---------------------------------------------------------- */
  function initProjectFilters() {
    if (filterTabs.length === 0 || projectCards.length === 0) return;

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.getAttribute('data-filter') ||
                         tab.getAttribute('data-category') ||
                         tab.textContent.trim().toLowerCase();

        // Update active tab
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        filterProjects(category);
      });
    });

    function filterProjects(category) {
      // Phase 1: fade out all cards
      projectCards.forEach(card => {
        card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
      });

      // Phase 2: after fade-out, show matching cards
      setTimeout(() => {
        projectCards.forEach(card => {
          const cardCategories = (card.getAttribute('data-category') || '').toLowerCase();
          const normalizedFilter = category.toLowerCase();

          const isMatch =
            normalizedFilter === 'all' ||
            cardCategories.includes(normalizedFilter);

          if (isMatch) {
            card.style.display = '';
            // Force reflow so the transition fires
            void card.offsetHeight;
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          } else {
            card.style.display = 'none';
          }
        });
      }, 200);
    }
  }

  /* ----------------------------------------------------------
     6. PROJECT MODAL
  ---------------------------------------------------------- */
  function initProjectModal() {
    if (!modalOverlay) return;

    // Open modal from card click or arrow button
    projectCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const projectId = card.getAttribute('data-project');
        if (projectId) {
          openModal(projectId);
        }
      });
    });

    // Also handle dedicated arrow / button triggers inside cards
    document.querySelectorAll('[data-open-project]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent double-fire from card click
        const projectId = btn.getAttribute('data-open-project');
        if (projectId) {
          openModal(projectId);
        }
      });
    });

    // Close handlers
    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });

    // Skill arrow → open project modal
    document.querySelectorAll('[data-skill-project]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = btn.getAttribute('data-skill-project');
        // Smooth scroll to projects first, then open modal
        const projectSection = document.querySelector('#projects');
        if (projectSection) {
          const top = projectSection.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        setTimeout(() => openModal(projectId), 400);
      });
    });
  }

  function openModal(projectId) {
    if (!modalOverlay || !modalBody) return;

    const detailSource = document.querySelector(
      `.project-detail[data-project="${projectId}"]`
    );

    if (detailSource) {
      modalBody.innerHTML = detailSource.innerHTML;
    } else {
      modalBody.innerHTML = '<p>Project details coming soon.</p>';
    }

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ----------------------------------------------------------
     7. SCROLL-TRIGGERED ANIMATIONS (Intersection Observer)
  ---------------------------------------------------------- */
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
      '.fade-in, .slide-in-left, .slide-in-right'
    );

    if (animatedElements.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;

          // Stagger children if flagged
          if (el.classList.contains('stagger-children')) {
            Array.from(el.children).forEach((child, index) => {
              child.style.transitionDelay = `${index * 100}ms`;
            });
          }

          el.classList.add('visible');
          obs.unobserve(el); // animate only once
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
  }

  /* ----------------------------------------------------------
     8. STATS COUNTER ANIMATION
  ---------------------------------------------------------- */
  function initStatsCounter() {
    if (!statsSection || statNumbers.length === 0) return;

    let hasAnimated = false;

    // Set initial display to show "0" with proper formatting
    statNumbers.forEach(el => {
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      el.textContent = `${prefix}0${suffix}`;
    });

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          animateAllCounters();
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    observer.observe(statsSection);
  }

  function animateAllCounters() {
    statNumbers.forEach((el, index) => {
      const target = parseFloat(el.getAttribute('data-target')) || 0;
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const isDecimal = el.getAttribute('data-decimal') === 'true';
      // Stagger each counter by 150ms
      setTimeout(() => {
        animateCounter(el, target, prefix, suffix, isDecimal);
      }, index * 150);
    });
  }

  function animateCounter(el, target, prefix, suffix, isDecimal) {
    const duration = 2200;
    const scrambleDuration = 400; // initial scramble phase
    let startTime = null;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function formatNumber(num) {
      let formatted;
      if (isDecimal) {
        formatted = num.toFixed(2);
      } else {
        formatted = Math.round(num).toLocaleString();
      }
      return `${prefix}${formatted}${suffix}`;
    }

    // Add a subtle scale-up effect
    el.style.transition = 'transform 0.3s ease-out';
    el.style.transform = 'scale(1.08)';

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed < scrambleDuration) {
        // Scramble phase: show rapid random numbers
        const randomFactor = Math.random() * target * 0.5;
        el.textContent = formatNumber(randomFactor);
        requestAnimationFrame(step);
      } else {
        // Count-up phase
        const countElapsed = elapsed - scrambleDuration;
        const countDuration = duration - scrambleDuration;
        const progress = Math.min(countElapsed / countDuration, 1);
        const easedProgress = easeOutExpo(progress);
        const currentValue = easedProgress * target;

        el.textContent = formatNumber(currentValue);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = formatNumber(target);
          // Settle scale back to normal
          el.style.transform = 'scale(1)';
        }
      }
    }

    requestAnimationFrame(step);
  }

  /* ----------------------------------------------------------
     9. CONTACT FORM HANDLING
  ---------------------------------------------------------- */
  function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput  = contactForm.querySelector('[name="name"], #name');
      const emailInput = contactForm.querySelector('[name="email"], #email');
      const messageInput = contactForm.querySelector('[name="message"], #message');

      const name  = nameInput  ? nameInput.value.trim()  : '';
      const email = emailInput ? emailInput.value.trim() : '';

      // Validation
      if (!name) {
        showFormError(nameInput, 'Please enter your name.');
        return;
      }

      if (!email) {
        showFormError(emailInput, 'Please enter your email.');
        return;
      }

      if (!isValidEmail(email)) {
        showFormError(emailInput, 'Please enter a valid email address.');
        return;
      }

      // Submit to Formspree
      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          showFormSuccess();
        } else {
          const data = await response.json();
          const errorMsg = data.errors
            ? data.errors.map(err => err.message).join(', ')
            : 'Something went wrong. Please try again.';
          showFormError(emailInput, errorMsg);
        }
      } catch (err) {
        showFormError(emailInput, 'Network error. Please check your connection and try again.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      }
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFormError(input, message) {
    // Remove any previous error
    clearFormErrors();

    if (input) {
      input.classList.add('input-error');
      const errorEl = document.createElement('span');
      errorEl.className = 'form-error-message';
      errorEl.textContent = message;
      input.parentNode.insertBefore(errorEl, input.nextSibling);
      input.focus();

      // Clear error on input
      input.addEventListener('input', function handler() {
        input.classList.remove('input-error');
        if (errorEl.parentNode) errorEl.parentNode.removeChild(errorEl);
        input.removeEventListener('input', handler);
      });
    }
  }

  function clearFormErrors() {
    if (!contactForm) return;
    contactForm.querySelectorAll('.form-error-message').forEach(el => el.remove());
    contactForm.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  }

  function showFormSuccess() {
    if (!contactForm) return;

    const formParent = contactForm.parentNode;
    const originalForm = contactForm.cloneNode(true);

    const successMessage = document.createElement('div');
    successMessage.className = 'form-success-message';
    successMessage.innerHTML = `
      <div class="success-icon">✓</div>
      <h3>Message Sent!</h3>
      <p>Thank you for reaching out. I'll get back to you soon.</p>
    `;

    contactForm.style.opacity = '0';
    contactForm.style.transform = 'scale(0.95)';
    contactForm.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    setTimeout(() => {
      formParent.replaceChild(successMessage, contactForm);
      successMessage.style.opacity = '0';
      successMessage.style.transform = 'scale(0.95)';
      successMessage.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

      // Force reflow
      void successMessage.offsetHeight;
      successMessage.style.opacity = '1';
      successMessage.style.transform = 'scale(1)';

      // After 4 seconds, restore the form
      setTimeout(() => {
        successMessage.style.opacity = '0';
        successMessage.style.transform = 'scale(0.95)';

        setTimeout(() => {
          formParent.replaceChild(originalForm, successMessage);
          originalForm.style.opacity = '0';
          originalForm.style.transform = 'scale(0.95)';
          originalForm.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

          void originalForm.offsetHeight;
          originalForm.style.opacity = '1';
          originalForm.style.transform = 'scale(1)';

          // Re-initialise form handler on the restored form
          initContactFormOnElement(originalForm);
        }, 400);
      }, 4000);
    }, 300);
  }

  /** Re-attach submit handler after the form DOM node has been replaced. */
  function initContactFormOnElement(form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput  = form.querySelector('[name="name"], #name');
      const emailInput = form.querySelector('[name="email"], #email');

      const name  = nameInput  ? nameInput.value.trim()  : '';
      const email = emailInput ? emailInput.value.trim() : '';

      if (!name) {
        showFormErrorOnElement(form, nameInput, 'Please enter your name.');
        return;
      }
      if (!email) {
        showFormErrorOnElement(form, emailInput, 'Please enter your email.');
        return;
      }
      if (!isValidEmail(email)) {
        showFormErrorOnElement(form, emailInput, 'Please enter a valid email address.');
        return;
      }

      showFormSuccessOnElement(form);
    });
  }

  function showFormErrorOnElement(form, input, message) {
    form.querySelectorAll('.form-error-message').forEach(el => el.remove());
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    if (input) {
      input.classList.add('input-error');
      const errorEl = document.createElement('span');
      errorEl.className = 'form-error-message';
      errorEl.textContent = message;
      input.parentNode.insertBefore(errorEl, input.nextSibling);
      input.focus();

      input.addEventListener('input', function handler() {
        input.classList.remove('input-error');
        if (errorEl.parentNode) errorEl.parentNode.removeChild(errorEl);
        input.removeEventListener('input', handler);
      });
    }
  }

  function showFormSuccessOnElement(form) {
    const formParent = form.parentNode;
    const originalForm = form.cloneNode(true);

    const successMessage = document.createElement('div');
    successMessage.className = 'form-success-message';
    successMessage.innerHTML = `
      <div class="success-icon">✓</div>
      <h3>Message Sent!</h3>
      <p>Thank you for reaching out. I'll get back to you soon.</p>
    `;

    form.style.opacity = '0';
    form.style.transform = 'scale(0.95)';
    form.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    setTimeout(() => {
      formParent.replaceChild(successMessage, form);
      successMessage.style.opacity = '0';
      successMessage.style.transform = 'scale(0.95)';
      successMessage.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

      void successMessage.offsetHeight;
      successMessage.style.opacity = '1';
      successMessage.style.transform = 'scale(1)';

      setTimeout(() => {
        successMessage.style.opacity = '0';
        successMessage.style.transform = 'scale(0.95)';

        setTimeout(() => {
          formParent.replaceChild(originalForm, successMessage);
          originalForm.style.opacity = '0';
          originalForm.style.transform = 'scale(0.95)';
          originalForm.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

          void originalForm.offsetHeight;
          originalForm.style.opacity = '1';
          originalForm.style.transform = 'scale(1)';

          initContactFormOnElement(originalForm);
        }, 400);
      }, 4000);
    }, 300);
  }


  /* ----------------------------------------------------------
     11. DARK / LIGHT THEME TOGGLE
  ---------------------------------------------------------- */
  function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Check saved preference or system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  /* ----------------------------------------------------------
     12. INITIALIZE EVERYTHING
  ---------------------------------------------------------- */
  initSmoothScroll();
  initStickyHeader();
  initMobileMenu();
  initActiveNavHighlight();
  initProjectFilters();
  initProjectModal();
  initScrollAnimations();
  initStatsCounter();
  initContactForm();

  initThemeToggle();
});
