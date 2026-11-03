'use strict';

/* ==============================================================
   AEON SOFTWARE SERVICES — EXPERIENCE LAYER
   Capabilities pillars, live cybersecurity console, spotlight
   cards, scroll progress and other micro-interactions.
   Runs alongside main.js (GSAP 3.15 + SplitText / ScrambleText /
   DrawSVG plugins loaded from /vendor).
   ============================================================== */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined') return;

    const plugins = [ScrollTrigger];
    if (typeof ScrambleTextPlugin !== 'undefined') plugins.push(ScrambleTextPlugin);
    if (typeof DrawSVGPlugin !== 'undefined') plugins.push(DrawSVGPlugin);
    gsap.registerPlugin(...plugins);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasScramble = typeof ScrambleTextPlugin !== 'undefined' && !reduceMotion;

    // ============================================
    // 1. SCROLL PROGRESS + BACK TO TOP
    // ============================================
    const progressFill = document.querySelector('.scroll-progress-fill');
    const backToTop = document.getElementById('backToTop');
    const bttRing = document.querySelector('.btt-ring-fill');
    const RING_LENGTH = 2 * Math.PI * 22;
    if (bttRing) {
        bttRing.style.strokeDasharray = RING_LENGTH;
        bttRing.style.strokeDashoffset = RING_LENGTH;
    }

    function onScrollProgress() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        if (progressFill) progressFill.style.transform = `scaleX(${p})`;
        if (bttRing) bttRing.style.strokeDashoffset = RING_LENGTH * (1 - p);
        if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
    }
    window.addEventListener('scroll', onScrollProgress, { passive: true });
    onScrollProgress();

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            if (typeof ScrollToPlugin !== 'undefined') {
                gsap.to(window, { scrollTo: 0, duration: 1.4, ease: 'expo.inOut' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // ============================================
    // 2. HERO — SCROLL PARALLAX DEPTH
    // ============================================
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && !reduceMotion) {
        gsap.to(heroContent, {
            yPercent: 18,
            opacity: 0.15,
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
    }

    // ============================================
    // 3. CORE CAPABILITIES — EXPANDING PILLARS
    // ============================================
    const pillars = Array.from(document.querySelectorAll('.pillar'));
    const desktopPillars = window.matchMedia('(min-width: 1024px)');

    function activatePillar(target, animate = true) {
        if (!target || target.classList.contains('is-active')) return;
        pillars.forEach(p => {
            const on = p === target;
            p.classList.toggle('is-active', on);
            p.setAttribute('aria-expanded', on ? 'true' : 'false');
        });
        if (animate && desktopPillars.matches && !reduceMotion) {
            const items = target.querySelectorAll('.pillar-lead, .pillar-list li, .pillar-foot, .pillar-visual');
            gsap.fromTo(items,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.035, ease: 'power3.out', delay: 0.15, overwrite: true }
            );
        }
    }

    pillars.forEach(p => {
        p.addEventListener('mouseenter', () => { if (desktopPillars.matches) activatePillar(p); });
        p.addEventListener('focusin', () => activatePillar(p));
        p.addEventListener('click', () => activatePillar(p));
        p.addEventListener('keydown', (e) => {
            const i = pillars.indexOf(p);
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                pillars[(i + 1) % pillars.length].focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                pillars[(i - 1 + pillars.length) % pillars.length].focus();
            }
        });
    });

    // Hero pillar chips jump to the matching capability
    document.querySelectorAll('[data-pillar-link]').forEach(link => {
        link.addEventListener('click', () => {
            const target = document.querySelector(`.pillar[data-pillar="${link.dataset.pillarLink}"]`);
            activatePillar(target, false);
        });
    });

    // Entrance: pillars rise in sequence
    if (pillars.length && !reduceMotion) {
        gsap.from(pillars, {
            y: 80,
            opacity: 0,
            duration: 1.1,
            stagger: 0.12,
            ease: 'expo.out',
            scrollTrigger: { trigger: '.pillars', start: 'top 85%' }
        });
    }

    // ============================================
    // 4. PRE-SELECT SERVICE IN CONTACT FORM
    // ============================================
    const serviceSelect = document.getElementById('service');

    function preselectService(value) {
        if (!serviceSelect || !value) return false;
        const option = Array.from(serviceSelect.options).find(o => o.value === value);
        if (!option) return false;
        serviceSelect.value = value;
        serviceSelect.classList.add('is-preselected');
        setTimeout(() => serviceSelect.classList.remove('is-preselected'), 2200);
        return true;
    }

    // Arriving on /contact?service=… from a CTA on another page
    preselectService(new URLSearchParams(window.location.search).get('service'));

    // CTA on the same page as the form: fill it in and scroll there instead of reloading
    document.querySelectorAll('[data-service]').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!serviceSelect) return;
            if (preselectService(link.dataset.service)) {
                e.preventDefault();
                const form = serviceSelect.closest('form');
                if (form) form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            }
        });
    });

    // ============================================
    // 5. CYBERSECURITY — LIVE SOC CONSOLE
    // ============================================
    const consoleEl = document.querySelector('.cyber-console');
    const feedList = document.getElementById('threatFeed');
    const threatCount = document.getElementById('threatCount');

    const FEED_EVENTS = [
        ['block', 'BLOCKED', 'Credential-stuffing burst · 3,412 requests'],
        ['detect', 'DETECTED', 'Lookalike phishing domain · takedown filed'],
        ['contain', 'CONTAINED', 'Lateral movement attempt · VLAN segmented'],
        ['patch', 'PATCHED', 'Kubernetes RBAC drift · auto-remediated'],
        ['block', 'BLOCKED', 'Layer-7 DDoS flood · mitigated at edge'],
        ['detect', 'DETECTED', 'Privilege escalation · admin session revoked'],
        ['patch', 'SCANNED', 'Cloud posture check · 0 critical findings'],
        ['contain', 'CONTAINED', 'Malicious macro · mailbox quarantined'],
        ['block', 'BLOCKED', 'Brute-force SSH · 212 IPs blacklisted'],
        ['detect', 'DETECTED', 'Data exfiltration pattern · DLP enforced'],
    ];
    let feedIndex = 0;
    let feedTimer = null;
    let countTimer = null;
    let threats = 48213;

    function pushFeedEvent() {
        if (!feedList) return;
        const [kind, label, msg] = FEED_EVENTS[feedIndex % FEED_EVENTS.length];
        feedIndex++;
        const li = document.createElement('li');
        li.innerHTML = `<span class="tag tag-${kind}">${label}</span><span class="msg"></span>`;
        const msgEl = li.querySelector('.msg');
        feedList.prepend(li);
        gsap.fromTo(li, { opacity: 0, x: -14, height: 0 }, { opacity: 1, x: 0, height: 'auto', duration: 0.45, ease: 'power3.out' });
        if (hasScramble) {
            gsap.to(msgEl, { duration: 1.1, scrambleText: { text: msg, chars: '01<>/#$%&*', speed: 0.6 }, ease: 'none' });
        } else {
            msgEl.textContent = msg;
        }
        feedList.querySelectorAll('li').forEach((row, i) => {
            if (i >= 7) {
                row.remove();
            } else if (i >= 5 && !row.dataset.leaving) {
                row.dataset.leaving = '1';
                gsap.to(row, { opacity: 0, height: 0, duration: 0.3, onComplete: () => row.remove() });
            }
        });
    }

    function tickThreats() {
        threats += Math.floor(Math.random() * 7) + 1;
        if (threatCount) threatCount.textContent = threats.toLocaleString('en-IN');
    }

    function startConsole() {
        if (reduceMotion || feedTimer) return;
        feedTimer = setInterval(pushFeedEvent, 2600);
        countTimer = setInterval(tickThreats, 900);
    }

    function stopConsole() {
        clearInterval(feedTimer);
        clearInterval(countTimer);
        feedTimer = null;
        countTimer = null;
    }

    if (consoleEl) {
        ScrollTrigger.create({
            trigger: consoleEl,
            start: 'top 85%',
            end: 'bottom 10%',
            onToggle: (self) => {
                consoleEl.classList.toggle('is-live', self.isActive);
                if (self.isActive) startConsole(); else stopConsole();
            }
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopConsole();
            else if (consoleEl.classList.contains('is-live')) startConsole();
        });

        // Shield draws itself, then the check mark
        const shieldPath = consoleEl.querySelector('.shield-path');
        const shieldCheck = consoleEl.querySelector('.shield-check');
        if (shieldPath && typeof DrawSVGPlugin !== 'undefined' && !reduceMotion) {
            gsap.timeline({ scrollTrigger: { trigger: consoleEl, start: 'top 80%' } })
                .from(shieldPath, { drawSVG: '0%', duration: 1.6, ease: 'power2.inOut' })
                .from(shieldCheck, { drawSVG: '0%', duration: 0.6, ease: 'power3.out' }, '-=0.3');
        }
    }

    // Lifecycle track fills as you scroll past it
    const clFill = document.querySelector('.cl-track-fill');
    if (clFill) {
        // Horizontal track on desktop/tablet, vertical on phones
        gsap.matchMedia().add({ vertical: '(max-width: 768px)', horizontal: '(min-width: 769px)' }, (ctx) => {
            const axis = ctx.conditions.vertical ? 'scaleY' : 'scaleX';
            gsap.fromTo(clFill, { scaleX: 1, scaleY: 1, [axis]: 0 }, {
                [axis]: 1,
                ease: 'none',
                scrollTrigger: { trigger: '.cyber-lifecycle', start: 'top 80%', end: 'bottom 55%', scrub: 0.6 }
            });
        });
        document.querySelectorAll('.cl-step').forEach(step => {
            ScrollTrigger.create({
                trigger: step,
                start: 'top 70%',
                onEnter: () => step.classList.add('is-on'),
                onLeaveBack: () => step.classList.remove('is-on')
            });
        });
    }

    // ============================================
    // 6. SPOTLIGHT GLOW THAT FOLLOWS THE POINTER
    // ============================================
    if (finePointer) {
        document.querySelectorAll('.cyber-card, .pillar, .service-card, .insight-card, .industry-card, .cyber-console').forEach(card => {
            card.classList.add('has-spotlight');
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                card.style.setProperty('--my', `${e.clientY - r.top}px`);
            });
        });
    }

    // ============================================
    // 7. SECTION LABELS DECODE ON ENTRY
    // ============================================
    if (hasScramble) {
        document.querySelectorAll('.section-label .label-text').forEach(label => {
            const text = label.textContent;
            ScrollTrigger.create({
                trigger: label,
                start: 'top 92%',
                once: true,
                onEnter: () => gsap.to(label, {
                    duration: 1,
                    scrambleText: { text, chars: 'upperCase', revealDelay: 0.2, speed: 0.5 }
                })
            });
        });
    }

    // ============================================
    // 8. IMAGE CURTAIN REVEALS
    // ============================================
    if (!reduceMotion) {
        document.querySelectorAll('.work-card .wc-img, .industry-card .ic-img, .about-img-wrap .about-img, .who-collage .wc-photo, .culture-item, .office-card:not(.office-card--text)').forEach(wrap => {
            gsap.fromTo(wrap,
                { clipPath: 'inset(18% 8% 18% 8% round 18px)' },
                {
                    clipPath: 'inset(0% 0% 0% 0% round 0px)',
                    duration: 1.4,
                    ease: 'expo.out',
                    scrollTrigger: { trigger: wrap, start: 'top 88%' },
                    clearProps: 'clipPath'
                }
            );
        });
    }

    // ============================================
    // 9. FOOTER WORDMARK RISE
    // ============================================
    const wordmarkLetters = document.querySelectorAll('.footer-wordmark span');
    if (wordmarkLetters.length && !reduceMotion) {
        gsap.from(wordmarkLetters, {
            yPercent: 100,
            opacity: 0,
            duration: 1.2,
            stagger: 0.08,
            ease: 'expo.out',
            scrollTrigger: { trigger: '.footer-wordmark', start: 'top 95%' }
        });
    }

    // ============================================
    // 10. PAGE TRANSITIONS (multi-page navigation)
    // ============================================
    const curtain = document.querySelector('.page-transition');
    const normalizePath = (p) => (p.replace(/\.html$/, '').replace(/\/index$/, '/') || '/');

    function internalPageUrl(link, e) {
        if (!link || link.target === '_blank' || link.hasAttribute('download')) return null;
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) return null;
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin) return null;
        // Same page (e.g. /cybersecurity#cyber-services while on /cybersecurity): let the browser scroll
        if (normalizePath(url.pathname) === normalizePath(window.location.pathname)) return null;
        return url;
    }

    if (curtain && !reduceMotion) {
        document.addEventListener('click', (e) => {
            const url = internalPageUrl(e.target.closest('a'), e);
            if (!url) return;
            e.preventDefault();
            curtain.classList.add('is-leaving');
            setTimeout(() => { window.location.href = url.href; }, 650);
        });
    }

    // Returning via back/forward cache: make sure the curtain is open again
    window.addEventListener('pageshow', (e) => {
        if (e.persisted && curtain) curtain.classList.remove('is-leaving');
    });

    // ============================================
    // 11. INNER PAGE HERO INTRO
    // ============================================
    const pageHero = document.querySelector('[data-page-hero]');
    if (pageHero) {
        const heroImg = pageHero.querySelector('.page-hero-img');
        const heroTitle = pageHero.querySelector('.page-hero-title');
        let titleParts = [heroTitle];
        if (heroTitle && typeof SplitText !== 'undefined') {
            titleParts = SplitText.create(heroTitle, { type: 'words,lines', mask: 'lines', linesClass: 'split-line' }).words;
        }
        const introTL = gsap.timeline({ delay: 0.45, defaults: { ease: 'expo.out' } });
        if (heroImg) introTL.fromTo(heroImg, { scale: 1.25 }, { scale: 1, duration: 2.4 }, 0);
        introTL
            .from(pageHero.querySelectorAll('.breadcrumb, .page-hero-eyebrow'), { y: 20, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.15)
            .from(titleParts, { yPercent: 115, rotate: 3, opacity: 0, duration: 1.2, stagger: 0.06 }, 0.25)
            .from(pageHero.querySelectorAll('.page-hero-desc, .page-hero-meta'), { y: 24, opacity: 0, duration: 1, stagger: 0.12 }, 0.7);
        if (reduceMotion) introTL.progress(1);

        if (!reduceMotion) {
            const heroScroll = { trigger: pageHero, start: 'top top', end: 'bottom top', scrub: true };
            if (heroImg) gsap.to(pageHero.querySelector('.page-hero-media'), { yPercent: 20, ease: 'none', scrollTrigger: heroScroll });
            gsap.to(pageHero.querySelector('.page-hero-content'), { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { ...heroScroll } });
        }
    }

    // ============================================
    // 12. WHO WE ARE — TEXT & COLLAGE ANIMATION
    // ============================================
    // Rotating "We are …" text tag
    const wrList = document.querySelector('.wr-list');
    if (wrList && !reduceMotion) {
        const words = wrList.querySelectorAll('.wr-word');
        if (words.length > 1) {
            wrList.appendChild(words[0].cloneNode(true)); // seamless loop
            const step = 100 / (words.length + 1);
            const rotTL = gsap.timeline({ repeat: -1 });
            for (let i = 1; i <= words.length; i++) {
                rotTL.to(wrList, { yPercent: -step * i, duration: 0.8, ease: 'expo.inOut' }, '+=1.4');
            }
            rotTL.set(wrList, { yPercent: 0 });
            ScrollTrigger.create({
                trigger: wrList,
                start: 'top bottom',
                end: 'bottom top',
                onToggle: (self) => (self.isActive ? rotTL.play() : rotTL.pause())
            });
        }
    }

    // Paragraph that lights up word-by-word as you scroll
    if (typeof SplitText !== 'undefined' && !reduceMotion) {
        document.querySelectorAll('.scrub-text').forEach(p => {
            const split = SplitText.create(p, { type: 'words' });
            gsap.fromTo(split.words, { opacity: 0.16 }, {
                opacity: 1,
                stagger: 0.1,
                ease: 'none',
                scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 50%', scrub: true }
            });
        });
    }

    // Capability tags pop in
    const whoTags = document.querySelectorAll('.who-tags li');
    if (whoTags.length && !reduceMotion) {
        gsap.from(whoTags, {
            y: 18,
            opacity: 0,
            scale: 0.85,
            duration: 0.6,
            stagger: 0.06,
            ease: 'back.out(1.8)',
            scrollTrigger: { trigger: '.who-tags', start: 'top 90%' }
        });
    }

    // Collage photos drift at different speeds
    if (!reduceMotion) {
        document.querySelectorAll('[data-float]').forEach(el => {
            gsap.fromTo(el, { y: 0 }, {
                y: parseFloat(el.dataset.float) || 40,
                ease: 'none',
                scrollTrigger: { trigger: el.closest('.who-collage') || el, start: 'top bottom', end: 'bottom top', scrub: true }
            });
        });
        const floatCard = document.querySelector('.who-float-card');
        if (floatCard) {
            gsap.from(floatCard, { x: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: floatCard, start: 'top 90%' } });
        }
    }

    // ============================================
    // 13. ABOUT — VALUES, JOURNEY, CULTURE
    // ============================================
    if (!reduceMotion) {
        const staggerIn = (selector, trigger) => {
            const items = document.querySelectorAll(selector);
            if (!items.length) return;
            ScrollTrigger.batch(items, {
                start: 'top 88%',
                once: true,
                onEnter: (batch) => gsap.fromTo(batch, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'expo.out', overwrite: true })
            });
            gsap.set(items, { opacity: 0 });
        };
        staggerIn('.value-card');
        staggerIn('.services-grid .service-card');
        staggerIn('.office-card--text');
    }

    const journey = document.querySelector('.journey-list');
    if (journey) {
        const fill = journey.querySelector('.journey-line-fill');
        const yearEl = document.querySelector('.jy-value');
        if (fill) {
            gsap.fromTo(fill, { scaleY: 0 }, {
                scaleY: 1,
                ease: 'none',
                scrollTrigger: { trigger: journey, start: 'top 60%', end: 'bottom 60%', scrub: 0.5 }
            });
        }
        const setYear = (year) => {
            if (!yearEl || yearEl.dataset.year === year) return;
            yearEl.dataset.year = year;
            if (hasScramble) gsap.to(yearEl, { duration: 0.7, scrambleText: { text: year, chars: '0123456789', speed: 0.7 } });
            else yearEl.textContent = year;
        };
        journey.querySelectorAll('.journey-item').forEach(item => {
            if (!reduceMotion) {
                gsap.from(item.querySelectorAll('.ji-year, .ji-body'), {
                    x: -30,
                    opacity: 0,
                    duration: 0.9,
                    stagger: 0.1,
                    ease: 'expo.out',
                    scrollTrigger: { trigger: item, start: 'top 85%' }
                });
            }
            ScrollTrigger.create({
                trigger: item,
                start: 'top 60%',
                end: 'bottom 60%',
                onToggle: (self) => {
                    item.classList.toggle('is-active', self.isActive);
                    if (self.isActive) setYear(item.dataset.year);
                },
                onEnter: () => item.classList.add('is-past'),
                onLeaveBack: () => item.classList.remove('is-past')
            });
        });
    }

    // ============================================
    // 14. NEWSLETTER (front-end validation only)
    // ============================================
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input[type="email"]');
            const status = newsletterForm.querySelector('.nl-status');
            const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
            newsletterForm.classList.toggle('is-error', !ok);
            if (status) status.textContent = ok ? 'Thanks — you’re on the list.' : 'Please enter a valid email address.';
            if (ok) newsletterForm.reset();
        });
    }

    // Recalculate trigger positions once fonts / images settle
    window.addEventListener('load', () => ScrollTrigger.refresh());
});
