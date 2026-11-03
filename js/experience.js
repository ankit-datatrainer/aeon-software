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
    document.querySelectorAll('[data-service]').forEach(link => {
        link.addEventListener('click', () => {
            if (!serviceSelect) return;
            const value = link.dataset.service;
            if (serviceSelect.querySelector(`option[value="${value}"]`)) {
                serviceSelect.value = value;
                serviceSelect.classList.add('is-preselected');
                setTimeout(() => serviceSelect.classList.remove('is-preselected'), 2200);
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
        document.querySelectorAll('.work-card .wc-img, .industry-card .ic-img, .about-img-wrap .about-img').forEach(wrap => {
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

    // Recalculate trigger positions once fonts / images settle
    window.addEventListener('load', () => ScrollTrigger.refresh());
});
