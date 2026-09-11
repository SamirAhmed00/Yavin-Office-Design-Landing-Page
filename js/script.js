/* ============================================================
   YAVIN OFFICE DESIGN — Premium GSAP Motion System (FIXED)
   NOTE: animations intentionally always run regardless of the
   OS "reduce motion" setting — see project playbook.
   ============================================================ */

(function () {
  'use strict';

  // ---- GSAP Detection ----
  function gsapAvailable() {
    return typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  }

  // ============================================================
  // NAVBAR
  // ============================================================
  function initNavbar() {
    var navbar = document.querySelector('.navbar-custom');
    if (!navbar) return;

    if (gsapAvailable()) {
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top -80',
        onEnter: function () { navbar.classList.add('navbar-scrolled'); },
        onLeaveBack: function () { navbar.classList.remove('navbar-scrolled'); }
      });
    } else {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 80) {
          navbar.classList.add('navbar-scrolled');
        } else {
          navbar.classList.remove('navbar-scrolled');
        }
      }, { passive: true });
    }
  }

  // ============================================================
  // ACTIVE NAV LINK ON SCROLL
  // ============================================================
  function initActiveNavLinks() {
    var sections = document.querySelectorAll('section[id], header[id]');
    var navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.nav-link-cta)');
    if (!sections.length || !navLinks.length) return;

    function updateActiveLink() {
      var scrollPos = window.scrollY + 200;
      var activeId = '';
      sections.forEach(function (section) {
        if (section.offsetTop <= scrollPos) {
          activeId = section.id;
        }
      });
      navLinks.forEach(function (link) {
        link.classList.remove('active');
        var href = link.getAttribute('href');
        if (href && href === '#' + activeId) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  // ============================================================
  // NAVBAR — SLIDING ACTIVE/HOVER INDICATOR (desktop only)
  // A single pill glides between links instead of each link
  // handling its own independent underline.
  // ============================================================
  function initNavIndicator() {
    var navList = document.querySelector('.navbar-nav');
    var links = document.querySelectorAll('.navbar-nav .nav-link:not(.nav-link-cta)');
    if (!navList || !links.length || !gsapAvailable()) return;

    var indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    navList.appendChild(indicator);

    function moveTo(link) {
      if (!link || window.innerWidth < 992) return;
      var navRect = navList.getBoundingClientRect();
      var linkRect = link.getBoundingClientRect();
      gsap.to(indicator, {
        x: linkRect.left - navRect.left,
        width: linkRect.width,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    }

    function moveToActive() {
      var active = document.querySelector('.navbar-nav .nav-link.active');
      if (active) {
        moveTo(active);
      } else {
        gsap.to(indicator, { opacity: 0, duration: 0.25 });
      }
    }

    links.forEach(function (link) {
      link.addEventListener('mouseenter', function () { moveTo(link); });
    });
    navList.addEventListener('mouseleave', moveToActive);

    // Re-sync whenever the scroll-driven active link changes
    window.addEventListener('scroll', function () {
      if (!navList.matches(':hover')) moveToActive();
    }, { passive: true });

    window.addEventListener('resize', moveToActive);

    // Initial position (after layout settles)
    setTimeout(moveToActive, 300);
  }

  // ============================================================
  // MOBILE MENU — staggered link entrance on open
  // ============================================================
  function initMobileMenu() {
    var collapseEl = document.getElementById('navbarSupportedContent');
    if (!collapseEl || typeof bootstrap === 'undefined' || !gsapAvailable()) return;

    var items = collapseEl.querySelectorAll('.nav-item');

    collapseEl.addEventListener('show.bs.collapse', function () {
      gsap.set(items, { opacity: 0, y: -10 });
    });

    collapseEl.addEventListener('shown.bs.collapse', function () {
      gsap.to(items, {
        opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out'
      });
    });
  }

  // ============================================================
  // PAGE TRANSITIONS
  // Plays a quick cover animation before navigating to another
  // page on this site. Falls back to a normal, instant navigation
  // if GSAP isn't available — never blocks the link.
  // ============================================================
  function initPageTransitions() {
    var overlay = document.querySelector('.page-transition-overlay');
    if (!overlay || !gsapAvailable()) return;

    var links = document.querySelectorAll('a[href]');

    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      // Only intercept links to another local .html page on this site
      // (same-page #anchors are handled by initSmoothScroll instead).
      var isLocalPage = /^[a-zA-Z0-9_-]+\.html(#.*)?$/.test(href);
      if (!isLocalPage) return;
      if (link.target === '_blank') return;

      link.addEventListener('click', function (e) {
        e.preventDefault();
        var destination = href;

        gsap.set(overlay, { transformOrigin: 'bottom center' });
        gsap.to(overlay, {
          scaleY: 1,
          duration: 0.45,
          ease: 'power2.inOut',
          onComplete: function () {
            window.location.href = destination;
          }
        });
      });
    });
  }

  // ============================================================
  // SMOOTH SCROLL
  // ============================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var navbarEl = document.querySelector('.navbar-custom');
          var navbarHeight = navbarEl ? navbarEl.offsetHeight : 0;
          var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          // Close mobile menu if open
          var navCollapse = document.querySelector('.navbar-collapse.show');
          if (navCollapse && typeof bootstrap !== 'undefined') {
            var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
            if (bsCollapse) bsCollapse.hide();
          }
        }
      });
    });
  }

  // ============================================================
  // BACK TO TOP
  // ============================================================
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 600) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================================
  // TEXT WRAPPING UTILITY
  // Wraps each word in: <span class="word-reveal"><span class="word-inner">word</span></span>
  // The outer span has overflow:hidden to create the clip mask effect.
  // ============================================================
  function wrapWordsForReveal(selector) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (el) {
      if (el.dataset.wordsWrapped) return;

      // Walk all text nodes
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      var textNodes = [];
      while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
      }

      textNodes.forEach(function (node) {
        var text = node.textContent;
        if (!text.trim()) return;

        var words = text.split(/(\s+)/);
        var fragment = document.createDocumentFragment();

        words.forEach(function (word) {
          if (/^\s+$/.test(word)) {
            fragment.appendChild(document.createTextNode(word));
          } else if (word.length > 0) {
            var outer = document.createElement('span');
            outer.className = 'word-reveal';
            outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;';

            var inner = document.createElement('span');
            inner.className = 'word-inner';
            inner.style.cssText = 'display:inline-block;';
            inner.textContent = word;

            outer.appendChild(inner);
            fragment.appendChild(outer);
          }
        });

        node.parentNode.replaceChild(fragment, node);
      });

      el.dataset.wordsWrapped = 'true';
    });
  }

  // ============================================================
  // HERO INTRO TIMELINE
  // ============================================================
  function initHeroAnimation() {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. Navbar entrance
    tl.from('.navbar-custom', {
      y: -30,
      opacity: 0,
      duration: 0.8
    });

    // 2. Hero image wrapper reveals (clip-path from bottom)
    tl.to('.hero-image-wrapper', {
      opacity: 1,
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.2,
      ease: 'power2.inOut'
    }, '-=0.3');

    // 3. Image subtle scale (1.06 → 1)
    tl.from('.hero-image', {
      scale: 1.06,
      duration: 2.5,
      ease: 'power1.out'
    }, '-=1.2');

    // 4. Eyebrow
    tl.to('.hero-eyebrow', {
      opacity: 1,
      duration: 0.7
    }, '-=1.8');

    tl.from('.hero-eyebrow', {
      y: 20,
      duration: 0.7,
      ease: 'power2.out'
    }, '<');

    // 5. Title words reveal (slides up from behind overflow:hidden mask)
    var wordInners = document.querySelectorAll('.hero-title .word-inner');
    if (wordInners.length > 0) {
      tl.from(wordInners, {
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        stagger: 0.06,
        ease: 'power3.out'
      }, '-=1.0');
    }

    // 6. Description
    tl.to('.hero-description', {
      opacity: 1,
      duration: 0.7
    }, '-=0.4');

    tl.from('.hero-description', {
      y: 25,
      duration: 0.7,
      ease: 'power2.out'
    }, '<');

    // 7. CTAs
    tl.to('.hero-ctas', {
      opacity: 1,
      duration: 0.6
    }, '-=0.3');

    tl.from('.hero-ctas', {
      y: 20,
      duration: 0.6,
      ease: 'power2.out'
    }, '<');

    // 8. Scroll indicator
    tl.to('.scroll-indicator', {
      opacity: 1,
      duration: 0.8
    }, '-=0.2');

    tl.from('.scroll-indicator', {
      y: -10,
      duration: 0.8,
      ease: 'power2.out'
    }, '<');

    // Hide scroll indicator on scroll
    ScrollTrigger.create({
      trigger: '.hero-section',
      start: 'top top',
      end: 'bottom 70%',
      onLeave: function () { gsap.to('.scroll-indicator', { opacity: 0, duration: 0.4 }); },
      onEnterBack: function () { gsap.to('.scroll-indicator', { opacity: 1, duration: 0.4 }); }
    });
  }

  // ============================================================
  // HERO IMAGE PARALLAX
  // ============================================================
  function initHeroParallax() {
    gsap.to('.hero-image', {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
  }

  // ============================================================
  // STATS COUNTER
  // ============================================================
  function initStatsCounter() {
    var counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    ScrollTrigger.create({
      trigger: '.stats-section',
      start: 'top 78%',
      once: true,
      onEnter: function () {
        gsap.from('.stat-item', {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out'
        });

        counters.forEach(function (counter) {
          var target = parseInt(counter.getAttribute('data-target'), 10);
          var obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2.2,
            ease: 'power2.out',
            onUpdate: function () {
              counter.textContent = Math.round(obj.val);
            }
          });
        });
      }
    });
  }

  // ============================================================
  // DETAILS A — TEXT REVEAL
  // ============================================================
  function initDetailsA() {
    var section = document.querySelector('.details-a-section');
    if (!section) return;

    var eyebrow = section.querySelector('.section-eyebrow');
    var heading = section.querySelector('h2');
    var lead = section.querySelector('.section-lead');

    ScrollTrigger.create({
      trigger: section,
      start: 'top 78%',
      once: true,
      onEnter: function () {
        if (eyebrow) gsap.from(eyebrow, { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' });
        if (heading) gsap.from(heading, { y: 40, opacity: 0, duration: 0.8, delay: 0.15, ease: 'power2.out' });
        if (lead) gsap.from(lead, { y: 30, opacity: 0, duration: 0.7, delay: 0.3, ease: 'power2.out' });
      }
    });
  }

  // ============================================================
  // DETAILS B — IMAGE REVEAL + CHECKLIST STAGGER
  // ============================================================
  function initDetailsB() {
    var section = document.querySelector('#details-b');
    if (!section) return;

    // Image clip-path reveal
    var imageContainer = section.querySelector('.image-reveal');
    if (imageContainer) {
      gsap.to(imageContainer, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: section, start: 'top 78%', once: true }
      });

      var img = imageContainer.querySelector('img');
      if (img) {
        gsap.from(img, {
          scale: 1.12,
          duration: 1.8,
          ease: 'power1.out',
          scrollTrigger: { trigger: section, start: 'top 78%', once: true }
        });
      }
    }

    // Heading
    var heading = section.querySelector('.details-text-col h2');
    if (heading) {
      gsap.from(heading, {
        x: -30, opacity: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 78%', once: true }
      });
    }

    // Checklist items stagger
    var items = section.querySelectorAll('.checklist-item');
    if (items.length) {
      gsap.from(items, {
        x: -20, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: section.querySelector('.checklist'), start: 'top 78%', once: true }
      });
    }

    // Button
    var btn = section.querySelector('.btn-primary-custom');
    if (btn) {
      gsap.from(btn, {
        y: 15, opacity: 0, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: btn, start: 'top 78%', once: true }
      });
    }
  }

  // ============================================================
  // SERVICES — STAGGERED GRID
  // ============================================================
  function initServices() {
    var section = document.querySelector('.services-section');
    if (!section) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top 78%',
      once: true,
      onEnter: function () {
        var eyebrow = section.querySelector('.section-eyebrow');
        var heading = section.querySelector('h2');
        var body = section.querySelector('.section-body');

        if (eyebrow) gsap.from(eyebrow, { y: 20, opacity: 0, duration: 0.6 });
        if (heading) gsap.from(heading, { y: 30, opacity: 0, duration: 0.7, delay: 0.1, ease: 'power2.out' });
        if (body) gsap.from(body, { y: 20, opacity: 0, duration: 0.6, delay: 0.2 });

        var cards = section.querySelectorAll('.service-card');
        if (cards.length) {
          gsap.from(cards, {
            y: 40, opacity: 0, scale: 0.96, duration: 0.7, stagger: 0.07, ease: 'power2.out', delay: 0.25
          });
        }
      }
    });
  }

  // ============================================================
  // DETAILS 2 — OPPOSITE DIRECTION REVEAL
  // ============================================================
  function initDetails2() {
    var section = document.querySelector('.details2-section');
    if (!section) return;

    // Image reveal from RIGHT
    var imageContainer = section.querySelector('.image-reveal-right');
    if (imageContainer) {
      gsap.to(imageContainer, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: section, start: 'top 78%', once: true }
      });

      var img = imageContainer.querySelector('img');
      if (img) {
        gsap.from(img, {
          scale: 1.12, duration: 1.8, ease: 'power1.out',
          scrollTrigger: { trigger: section, start: 'top 78%', once: true }
        });
      }
    }

    // Text children stagger
    var textCol = section.querySelector('.text-container-left');
    if (textCol) {
      gsap.from(textCol.children, {
        y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: textCol, start: 'top 78%', once: true }
      });
    }
  }

  // ============================================================
  // CTA BANNER
  // ============================================================
  function initCTABanner() {
    var section = document.querySelector('.cta-banner-section');
    if (!section) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top 78%',
      once: true,
      onEnter: function () {
        var heading = section.querySelector('.cta-heading');
        var btn = section.querySelector('.btn-cta');
        if (heading) gsap.from(heading, { scale: 0.97, opacity: 0, duration: 0.9, ease: 'power3.out' });
        if (btn) gsap.from(btn, { y: 20, opacity: 0, duration: 0.6, delay: 0.3, ease: 'power2.out' });
      }
    });
  }

  // ============================================================
  // PROJECTS — ALTERNATING REVEALS
  // ============================================================
  function initProjects() {
    var section = document.querySelector('.projects-section');
    if (!section) return;

    // Header
    ScrollTrigger.create({
      trigger: section,
      start: 'top 78%',
      once: true,
      onEnter: function () {
        var eyebrow = section.querySelector('.section-eyebrow');
        var heading = section.querySelector('h2');
        if (eyebrow) gsap.from(eyebrow, { y: 20, opacity: 0, duration: 0.6 });
        if (heading) gsap.from(heading, { y: 30, opacity: 0, duration: 0.7, delay: 0.1, ease: 'power2.out' });
      }
    });

    // Cards — alternating directional reveal
    var cards = section.querySelectorAll('.project-card');
    cards.forEach(function (card, index) {
      var row = Math.floor(index / 3);
      var col = index % 3;
      var fromX;
      if (row % 2 === 0) {
        fromX = col === 0 ? -40 : col === 2 ? 40 : 0;
      } else {
        fromX = col === 0 ? 40 : col === 2 ? -40 : 0;
      }

      gsap.from(card, {
        y: 50, x: fromX, opacity: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 78%', once: true }
      });

      // Image parallax inside card
      var img = card.querySelector('.project-image');
      if (img) {
        gsap.from(img, {
          yPercent: -5, ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
        });
      }
    });
  }

  // ============================================================
  // TESTIMONIALS
  // ============================================================
  function initTestimonials() {
    var section = document.querySelector('.testimonials-section');
    if (!section) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top 78%',
      once: true,
      onEnter: function () {
        var header = section.querySelector('.section-header-centered');
        var carousel = section.querySelector('.carousel');
        if (header) gsap.from(header, { y: 30, opacity: 0, duration: 0.7, ease: 'power2.out' });
        if (carousel) gsap.from(carousel, { y: 40, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' });
      }
    });

    // Extra crossfade on the slide's own content, layered on top of
    // Bootstrap's built-in slide transition (not replacing it).
    var carouselEl = document.getElementById('testimonialCarousel');
    if (!carouselEl || typeof bootstrap === 'undefined') return;

    carouselEl.addEventListener('slide.bs.carousel', function (e) {
      var current = carouselEl.querySelector('.carousel-item.active .testimonial-slide');
      if (current) {
        gsap.to(current, { opacity: 0, y: -12, duration: 0.25, ease: 'power1.in' });
      }
    });

    carouselEl.addEventListener('slid.bs.carousel', function (e) {
      var next = e.relatedTarget ? e.relatedTarget.querySelector('.testimonial-slide') : null;
      if (next) {
        gsap.fromTo(next, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      }
      // Reset the slide that's now inactive so it's ready for its next turn
      var prev = carouselEl.querySelectorAll('.carousel-item:not(.active) .testimonial-slide');
      prev.forEach(function (el) { gsap.set(el, { opacity: 1, y: 0 }); });
    });
  }

  // ============================================================
  // CONTACT — FORM STAGGER
  // ============================================================
  function initContact() {
    var section = document.querySelector('.contact-section');
    if (!section) return;

    // Image reveal
    var imageContainer = section.querySelector('.image-reveal');
    if (imageContainer) {
      gsap.to(imageContainer, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.0,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: section, start: 'top 78%', once: true }
      });
    }

    // Form heading
    var heading = section.querySelector('h2');
    if (heading) {
      gsap.from(heading, {
        x: 30, opacity: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 78%', once: true }
      });
    }

    // Form fields stagger
    var formGroups = section.querySelectorAll('.form-group');
    if (formGroups.length) {
      gsap.from(formGroups, {
        y: 20, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out',
        scrollTrigger: { trigger: section.querySelector('.contact-form'), start: 'top 78%', once: true }
      });
    }

    // Submit button
    var submitBtn = section.querySelector('.btn-submit');
    if (submitBtn) {
      gsap.from(submitBtn, {
        y: 15, opacity: 0, duration: 0.5, delay: 0.3, ease: 'power2.out',
        scrollTrigger: { trigger: submitBtn, start: 'top 78%', once: true }
      });
    }
  }

  // ============================================================
  // FOOTER
  // ============================================================
  function initFooter() {
    var footer = document.querySelector('.footer-section');
    if (!footer) return;

    ScrollTrigger.create({
      trigger: footer,
      start: 'top 78%',
      once: true,
      onEnter: function () {
        var cols = footer.querySelectorAll('.footer-col');
        if (cols.length) {
          gsap.from(cols, { y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' });
        }

        var socials = footer.querySelectorAll('.footer-socials a');
        if (socials.length) {
          gsap.from(socials, {
            scale: 0, opacity: 0, duration: 0.4, stagger: 0.06,
            ease: 'back.out(1.4)', delay: 0.3
          });
        }
      }
    });
  }

  // ============================================================
  // IMAGE PARALLAX (DETAIL IMAGES)
  // ============================================================
  function initImageParallax() {
    document.querySelectorAll('.details-image-container img').forEach(function (img) {
      gsap.to(img, {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.details-image-container'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2
        }
      });
    });
  }

  // ============================================================
  // ARTICLE PAGE ANIMATIONS
  // ============================================================
  function initArticlePage() {
    var articleHeader = document.querySelector('.article-header');
    if (!articleHeader) return;

    var h1 = articleHeader.querySelector('h1');
    if (h1) {
      gsap.from(h1, { y: 30, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.3 });
    }

    var heroImage = document.querySelector('.article-hero-image');
    if (heroImage) {
      gsap.from(heroImage, {
        clipPath: 'inset(100% 0 0 0)', duration: 1.0, ease: 'power2.inOut',
        scrollTrigger: { trigger: heroImage, start: 'top 78%', once: true }
      });
    }

    var articleCards = document.querySelectorAll('.article-card');
    if (articleCards.length) {
      gsap.from(articleCards, {
        y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: articleCards[0], start: 'top 78%', once: true }
      });
    }

    var grayBox = document.querySelector('.gray-box-card');
    if (grayBox) {
      gsap.from(grayBox, {
        y: 20, opacity: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: grayBox, start: 'top 78%', once: true }
      });
    }
  }

  // ============================================================
  // MASTER INIT
  // ============================================================
  function init() {
    console.log('[Yavin] Initializing...');

    // Non-GSAP features (always work)
    initNavbar();
    initActiveNavLinks();
    initSmoothScroll();
    initBackToTop();

    // GSAP features
    if (!gsapAvailable()) {
      console.warn('[Yavin] GSAP not loaded. Showing content without animations.');
      // Content is already visible (CSS only hides when .gsap-ready is present)
      // Set stat numbers to final values
      var counters = document.querySelectorAll('.stat-number');
      counters.forEach(function (counter) {
        counter.textContent = counter.getAttribute('data-target');
      });
      return;
    }

    console.log('[Yavin] GSAP loaded. Starting animations.');

    // Register plugin
    gsap.registerPlugin(ScrollTrigger);

    // NOW mark body as ready — CSS will hide elements that need animation
    document.body.classList.add('gsap-ready');

    // Wrap hero title text for word-by-word reveal
    wrapWordsForReveal('.hero-title');

    // Initialize all animation sections
    initHeroAnimation();
    initHeroParallax();
    initStatsCounter();
    initDetailsA();
    initDetailsB();
    initServices();
    initDetails2();
    initCTABanner();
    initProjects();
    initTestimonials();
    initContact();
    initFooter();
    initImageParallax();
    initArticlePage();
    initNavIndicator();
    initMobileMenu();
    initPageTransitions();

    // Refresh after everything is set up
    ScrollTrigger.refresh();
    console.log('[Yavin] All animations initialized.');
  }

  // ============================================================
  // BOOTSTRAP
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();