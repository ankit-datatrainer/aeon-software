'use strict';

/* ==============================================================
   AEON SOFTWARE SERVICES — MASTER JAVASCRIPT
   Award-Winning Interactive Animations & Kinetic Experiences
   Inspired by Awwwards (Stellar Management) & Infosys Excellence
   ============================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Register GSAP plugins
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    }

    // ============================================
    // 1. PRELOADER ANIMATION
    // ============================================
    const preloader = document.getElementById('preloader');
    const plLetters = document.querySelectorAll('.pl-letter');
    const counterNum = document.querySelector('.counter-num');
    const barFill = document.querySelector('.preloader-bar-fill');

    function runPreloader() {
        if (!preloader) {
            triggerHeroAnimations();
            return;
        }

        const preloaderTL = gsap.timeline({
            onComplete: () => {
                gsap.to(preloader, {
                    yPercent: -100,
                    duration: 1,
                    ease: 'power4.inOut',
                    delay: 0.2,
                    onComplete: () => {
                        preloader.style.display = 'none';
                        preloader.style.pointerEvents = 'none';
                        document.body.style.overflow = '';
                        triggerHeroAnimations();
                        ScrollTrigger.refresh();
                    }
                });
            }
        });

        // Animate letters A, E, O, N
        if (plLetters.length) {
            preloaderTL.fromTo(plLetters, 
                { opacity: 0, y: 35 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
            );
        }

        // Animate counter from 0 to 100
        const counterObj = { val: 0 };
        if (counterNum) {
            preloaderTL.to(counterObj, {
                val: 100,
                duration: 1.6,
                ease: 'power2.inOut',
                onUpdate: () => {
                    counterNum.textContent = Math.round(counterObj.val);
                }
            }, '-=0.2');
        }

        // Animate progress bar
        if (barFill) {
            preloaderTL.to(barFill, {
                width: '100%',
                duration: 1.6,
                ease: 'power2.inOut'
            }, '<');
        }
    }

    // ============================================
    // 5. HERO SECTION ENTRANCE ANIMATIONS
    // ============================================
    let heroTL = null;
    function triggerHeroAnimations(jumpToEnd = false) {
        heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Hero badge
        const heroBadge = document.querySelector('.hero-badge');
        if (heroBadge) {
            heroTL.fromTo(heroBadge, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
        }

        // Hero title words — masked reveal
        const htLines = document.querySelectorAll('.ht-line');
        htLines.forEach(line => { line.style.overflow = 'hidden'; });

        const htWords = document.querySelectorAll('.ht-word');
        if (htWords.length) {
            heroTL.fromTo(htWords, 
                { y: '110%', opacity: 0 },
                { y: '0%', opacity: 1, duration: 1, stagger: 0.08, ease: 'power4.out' },
                '-=0.4'
            );
        }

        // Hero description
        const heroDesc = document.querySelector('.hero-desc');
        if (heroDesc) {
            heroTL.fromTo(heroDesc, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');
        }

        // Hero buttons
        const heroButtons = document.querySelector('.hero-buttons');
        if (heroButtons) {
            heroTL.fromTo(heroButtons, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');
        }

        // Scroll indicator
        const scrollIndicator = document.querySelector('.hero-scroll-indicator');
        if (scrollIndicator) {
            heroTL.fromTo(scrollIndicator, { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.3');
        }

        // Bottom strip items
        const stripItems = document.querySelectorAll('.hero-bottom-strip .strip-item, .hero-bottom-strip .strip-divider');
        if (stripItems.length) {
            heroTL.fromTo(stripItems, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, '-=0.5');
        }

        if (jumpToEnd) {
            heroTL.progress(1);
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('skip_preloader') === '1') {
        if (preloader) {
            preloader.style.display = 'none';
            preloader.style.pointerEvents = 'none';
        }
        document.body.style.overflow = '';
        triggerHeroAnimations(true);

    } else {
        runPreloader();
    }
    let lenis = null;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 1.8
        });

        // Connect Lenis to GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);

        const scrollToTarget = urlParams.get('scroll_to');
        if (scrollToTarget) {
            const el = document.getElementById(scrollToTarget);
            if (el) {
                lenis.scrollTo(el, { immediate: true });
                ScrollTrigger.refresh();
            }
        }
    }

    // ============================================
    // 3. CUSTOM CURSOR (AWWWARDS STYLE)
    // ============================================
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice || !cursorDot || !cursorRing) {
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorRing) cursorRing.style.display = 'none';
    } else {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let cursorTextSpan = null;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.set(cursorDot, { x: mouseX, y: mouseY });
        }, { passive: true });

        // Smooth trailing for the ring
        gsap.ticker.add(() => {
            ringX += (mouseX - ringX) * 0.2;
            ringY += (mouseY - ringY) * 0.2;
            gsap.set(cursorRing, { x: ringX, y: ringY });
        });

        // Hover targets
        const hoverTargets = document.querySelectorAll('a, button, [data-magnetic], [data-cursor-text], input, select, textarea, .service-card, .work-card, .industry-card');

        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorRing.classList.add('hovered');
                const cursorText = el.getAttribute('data-cursor-text');
                if (cursorText) {
                    if (!cursorTextSpan) {
                        cursorTextSpan = document.createElement('span');
                        cursorTextSpan.className = 'cursor-text';
                        cursorTextSpan.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:10px;font-weight:700;white-space:nowrap;pointer-events:none;color:#fff;text-transform:uppercase;letter-spacing:0.08em;';
                        cursorRing.appendChild(cursorTextSpan);
                    }
                    cursorTextSpan.innerHTML = cursorText;
                    cursorTextSpan.style.display = 'block';
                    gsap.to(cursorRing, { scale: 3.2, duration: 0.3, ease: 'power2.out' });
                } else {
                    gsap.to(cursorRing, { scale: 1.6, duration: 0.3, ease: 'power2.out' });
                }
            });

            el.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('hovered');
                gsap.to(cursorRing, { scale: 1, duration: 0.3, ease: 'power2.out' });
                if (cursorTextSpan) {
                    cursorTextSpan.style.display = 'none';
                }
            });
        });
    }

    // ============================================
    // 4. HERO CANVAS — INTERACTIVE PARTICLE NETWORK
    // ============================================
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    let mousePos = { x: -1000, y: -1000, radius: 180 };
    const PARTICLE_COUNT = 85;
    const CONNECTION_DISTANCE = 140;

    function resizeCanvas() {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        if (ctx) ctx.scale(dpr, dpr);
    }

    function createParticles() {
        if (!canvas) return;
        particles = [];
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.7,
                vy: (Math.random() - 0.5) * 0.7,
                radius: Math.random() * 1.8 + 0.8,
                baseAlpha: Math.random() * 0.5 + 0.3
            });
        }
    }

    if (canvas) {
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mousePos.x = e.clientX - rect.left;
            mousePos.y = e.clientY - rect.top;
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            mousePos.x = -1000;
            mousePos.y = -1000;
        });
    }

    function drawParticles() {
        if (!ctx || !canvas) return;
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        ctx.clearRect(0, 0, w, h);

        // Update & draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            p.x = Math.max(0, Math.min(w, p.x));
            p.y = Math.max(0, Math.min(h, p.y));

            // Mouse interaction (gentle attraction/repulsion)
            const mdx = mousePos.x - p.x;
            const mdy = mousePos.y - p.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < mousePos.radius) {
                const force = (1 - mdist / mousePos.radius) * 0.6;
                p.x -= (mdx / mdist) * force * 2;
                p.y -= (mdy / mdist) * force * 2;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${p.baseAlpha})`;
            ctx.fill();
        }

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DISTANCE) {
                    const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }

            // Connection to mouse
            const mdx = mousePos.x - particles[i].x;
            const mdy = mousePos.y - particles[i].y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < mousePos.radius) {
                const opacity = (1 - mdist / mousePos.radius) * 0.45;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mousePos.x, mousePos.y);
                ctx.strokeStyle = `rgba(147, 197, 253, ${opacity})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        requestAnimationFrame(drawParticles);
    }

    if (canvas) {
        resizeCanvas();
        createParticles();
        drawParticles();
    }

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (canvas) {
                resizeCanvas();
                createParticles();
            }
            ScrollTrigger.refresh();
        }, 200);
    }, { passive: true });

    // ============================================
    // 6. NAVIGATION & HEADER CONTROLS
    // ============================================
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link[data-nav]');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const sections = document.querySelectorAll('section[id]');

    let lastScrollY = 0;
    let headerHidden = false;

    function handleScrollHeader(currentY) {
        if (!header) return;

        // Scrolled glassmorphism styling
        if (currentY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Auto hide on scroll down, show on scroll up
        if (currentY > lastScrollY && currentY > 250) {
            if (!headerHidden) {
                gsap.to(header, { yPercent: -100, duration: 0.4, ease: 'power3.out' });
                headerHidden = true;
            }
        } else {
            if (headerHidden) {
                gsap.to(header, { yPercent: 0, duration: 0.4, ease: 'power3.out' });
                headerHidden = false;
            }
        }

        // Keep visible at top
        if (currentY <= 15) {
            gsap.set(header, { yPercent: 0 });
            headerHidden = false;
        }

        lastScrollY = currentY;
    }

    if (lenis) {
        lenis.on('scroll', (e) => {
            const currentY = e.animatedScroll || e.scroll || window.scrollY;
            handleScrollHeader(currentY);
        });
    } else {
        window.addEventListener('scroll', () => {
            handleScrollHeader(window.scrollY);
        }, { passive: true });
    }

    // Active navigation link highlighting based on scroll
    function updateActiveNav() {
        let currentSection = '';
        sections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            if (rect.top <= 250 && rect.bottom > 250) {
                currentSection = sec.id;
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // Mobile menu toggle
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('active');
            if (mobileMenu.classList.contains('active')) {
                if (lenis) lenis.stop();
                document.body.classList.add('no-scroll');
            } else {
                if (lenis) lenis.start();
                document.body.classList.remove('no-scroll');
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
                if (lenis) lenis.start();
                const target = link.getAttribute('href');
                if (target && target.startsWith('#')) {
                    const el = document.querySelector(target);
                    if (el) {
                        if (lenis) lenis.scrollTo(el, { offset: -70 });
                        else el.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }

    // ============================================
    // 7. SCROLL REVEAL ANIMATIONS (FROMTO)
    // ============================================
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        // Skip elements inside hero which are handled by heroTL
        if (el.closest('.hero')) return;

        gsap.fromTo(el, 
            { y: 40, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // ============================================
    // 8. SPLIT TEXT HEADINGS ANIMATION
    // ============================================
    const splitTextEls = document.querySelectorAll('.split-text');
    splitTextEls.forEach(el => {
        const text = el.textContent.trim();
        const words = text.split(/\s+/);
        el.innerHTML = '';
        words.forEach(word => {
            const wrapper = document.createElement('span');
            wrapper.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:6px;';
            const inner = document.createElement('span');
            inner.style.cssText = 'display:inline-block;';
            inner.textContent = word;
            wrapper.appendChild(inner);
            el.appendChild(wrapper);
            el.appendChild(document.createTextNode(' '));
        });

        const innerSpans = el.querySelectorAll('span > span');
        gsap.fromTo(innerSpans, 
            { y: '110%', opacity: 0 },
            {
                y: '0%',
                opacity: 1,
                duration: 0.8,
                stagger: 0.03,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // ==============================================================
    // 9. HORIZONTAL SCROLL SERVICES — PINNED CARDS WITH MOUSE SCROLL
    // (Requested: "when I scroll my card scrolls with the mouse")
    // ==============================================================
    const servicesScrollWrap = document.querySelector('.services-scroll-wrap');
    const servicesTrack = document.getElementById('servicesTrack');

    if (servicesScrollWrap && servicesTrack) {
        let horizontalTween = null;

        function initHorizontalScroll() {
            // Kill existing triggers for this section
            ScrollTrigger.getAll().forEach(st => {
                if (st.trigger === servicesScrollWrap || (st.vars && st.vars.containerAnimation === horizontalTween)) {
                    st.kill();
                }
            });

            // On mobile viewports (< 768px), allow natural touch/horizontal scroll without aggressive pinning
            if (window.innerWidth < 768) {
                gsap.set(servicesTrack, { clearProps: 'all' });
                return;
            }

            // Calculate total distance required to reveal all 12 cards
            const totalScrollWidth = servicesTrack.scrollWidth - window.innerWidth + 140;
            if (totalScrollWidth <= 0) return;

            // Pin and horizontally scroll the track with vertical mouse wheel
            horizontalTween = gsap.to(servicesTrack, {
                x: -totalScrollWidth,
                ease: 'none',
                scrollTrigger: {
                    trigger: servicesScrollWrap,
                    pin: true,
                    scrub: 1,
                    start: 'top top',
                    end: () => `+=${totalScrollWidth}`,
                    invalidateOnRefresh: true,
                    anticipatePin: 1
                }
            });

            // Synchronize each individual service card with the horizontal scroll
            const serviceCards = document.querySelectorAll('.service-card');
            serviceCards.forEach((card) => {
                gsap.fromTo(card,
                    { y: 35, opacity: 0.7, scale: 0.95 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: card,
                            containerAnimation: horizontalTween,
                            start: 'left 95%',
                            end: 'left 60%',
                            scrub: 1
                        }
                    }
                );
            });
        }

        setTimeout(initHorizontalScroll, 150);

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(initHorizontalScroll, 250);
        }, { passive: true });

        // Interactive 3D Card Tilt with Mouse
        const serviceCards = document.querySelectorAll('.service-card');
        if (!isTouchDevice) {
            serviceCards.forEach(card => {
                card.setAttribute('data-cursor-text', 'Explore');

                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -8;
                    const rotateY = ((x - centerX) / centerX) * 8;

                    gsap.to(card, {
                        rotateX: rotateX,
                        rotateY: rotateY,
                        y: -8,
                        transformPerspective: 1000,
                        duration: 0.35,
                        ease: 'power2.out'
                    });
                });

                card.addEventListener('mouseleave', () => {
                    gsap.to(card, {
                        rotateX: 0,
                        rotateY: 0,
                        y: 0,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                });
            });

            // Mouse Drag-to-Scroll on Services Track
            let isDown = false;
            let startX = 0;
            let scrollLeftInitial = 0;

            servicesScrollWrap.addEventListener('mousedown', (e) => {
                isDown = true;
                startX = e.pageX;
                servicesScrollWrap.style.cursor = 'grabbing';
            });

            window.addEventListener('mouseup', () => {
                if (isDown) {
                    isDown = false;
                    servicesScrollWrap.style.cursor = '';
                }
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDown || !lenis) return;
                const x = e.pageX;
                const walk = (x - startX) * 2;
                lenis.scrollTo(window.scrollY - walk, { immediate: true });
                startX = x;
            });
        }
    }

    // ============================================
    // 10. PARALLAX IMAGE SCROLLING
    // ============================================
    const parallaxWraps = document.querySelectorAll('.parallax-wrap');
    parallaxWraps.forEach(wrap => {
        const img = wrap.querySelector('img');
        if (!img) return;
        const speed = parseFloat(wrap.getAttribute('data-speed')) || 0.08;
        gsap.to(img, {
            yPercent: -18,
            ease: 'none',
            scrollTrigger: {
                trigger: wrap,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });

    // ============================================
    // 11. STATS COUNTER ANIMATION
    // ============================================
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
        const counterObj = { val: 0 };

        ScrollTrigger.create({
            trigger: counter,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(counterObj, {
                    val: target,
                    duration: 2.2,
                    ease: 'power2.out',
                    snap: { val: 1 },
                    onUpdate: () => {
                        counter.textContent = Math.round(counterObj.val);
                    }
                });
            }
        });
    });

    // ============================================
    // 12. MARQUEE VELOCITY & SKEW EFFECT
    // ============================================
    const marqueeTrack = document.querySelector('.marquee-track');
    if (marqueeTrack) {
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                const velocity = self.getVelocity();
                const skew = Math.max(-4, Math.min(4, velocity / 350));
                gsap.to(marqueeTrack, {
                    skewX: skew,
                    duration: 0.3,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            }
        });
    }

    // ============================================
    // 13. KINETIC MAGNETIC BUTTON EFFECT
    // ============================================
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    if (!isTouchDevice) {
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = e.clientX - centerX;
                const deltaY = e.clientY - centerY;

                gsap.to(el, {
                    x: deltaX * 0.35,
                    y: deltaY * 0.35,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: 'elastic.out(1, 0.4)'
                });
            });
        });
    }

    // ============================================
    // 14. TESTIMONIALS SLIDER
    // ============================================
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const tnDots = document.querySelectorAll('.tn-dot');
    const tnPrev = document.querySelector('.tn-prev');
    const tnNext = document.querySelector('.tn-next');
    let currentSlide = 0;
    let autoPlayTimer = null;
    const totalSlides = testimonialCards.length;

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;

        testimonialCards.forEach((card, i) => {
            card.classList.remove('active');
            if (i === index) {
                gsap.fromTo(card,
                    { opacity: 0, x: i > currentSlide ? 40 : -40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.6,
                        ease: 'power3.out',
                        onStart: () => { card.classList.add('active'); }
                    }
                );
            } else {
                gsap.to(card, {
                    opacity: 0,
                    x: i < index ? -40 : 40,
                    duration: 0.5,
                    ease: 'power3.out'
                });
            }
        });

        tnDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentSlide = index;
    }

    if (totalSlides > 0) {
        testimonialCards.forEach((card, i) => {
            if (i !== 0) {
                gsap.set(card, { opacity: 0, x: 40 });
            }
        });

        if (tnNext) {
            tnNext.addEventListener('click', () => {
                goToSlide(currentSlide + 1);
                resetAutoPlay();
            });
        }

        if (tnPrev) {
            tnPrev.addEventListener('click', () => {
                goToSlide(currentSlide - 1);
                resetAutoPlay();
            });
        }

        tnDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.getAttribute('data-slide'), 10);
                goToSlide(slideIndex);
                resetAutoPlay();
            });
        });

        function startAutoPlay() {
            autoPlayTimer = setInterval(() => {
                goToSlide(currentSlide + 1);
            }, 5500);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayTimer);
            startAutoPlay();
        }

        startAutoPlay();

        const sliderContainer = document.querySelector('.testimonials-slider');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
            sliderContainer.addEventListener('mouseleave', () => startAutoPlay());
        }
    }

    // ============================================
    // 15. INDUSTRY CARDS — 3D PERSPECTIVE TILT
    // ============================================
    const industryCards = document.querySelectorAll('.industry-card');
    if (!isTouchDevice) {
        industryCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -6;
                const rotateY = ((x - centerX) / centerX) * 6;

                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    y: -6,
                    transformPerspective: 1000,
                    duration: 0.35,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });
        });
    }

    // ============================================
    // 16. WORK CARDS — IMAGE SCALE & HOVER
    // ============================================
    const workCards = document.querySelectorAll('.work-card');
    workCards.forEach(card => {
        const img = card.querySelector('.wc-img img');
        if (!img) return;

        card.addEventListener('mouseenter', () => {
            gsap.to(img, { scale: 1.06, duration: 0.6, ease: 'power2.out' });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(img, { scale: 1, duration: 0.6, ease: 'power2.out' });
        });
    });

    // ============================================
    // 17. CONTACT FORM SUBMISSION & VALIDATION
    // ============================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = contactForm.querySelector('#name');
            const email = contactForm.querySelector('#email');
            const service = contactForm.querySelector('#service');
            const message = contactForm.querySelector('#message');

            if (!name.value.trim() || !email.value.trim() || !service.value || !message.value.trim()) {
                alert('Please fill in all required fields.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) {
                alert('Please enter a valid business email address.');
                return;
            }

            const submitBtn = contactForm.querySelector('.btn-submit');
            const btnText = submitBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            btnText.textContent = 'Message Received! Thank You.';
            submitBtn.style.background = 'linear-gradient(135deg, #16a34a, #059669)';

            gsap.fromTo(submitBtn, { scale: 0.95 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });

            setTimeout(() => {
                btnText.textContent = originalText;
                submitBtn.style.background = '';
                contactForm.reset();
            }, 3500);
        });
    }

    // ============================================
    // 18. SMOOTH SCROLL TO ANCHORS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#' || !href) return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                if (lenis) {
                    lenis.scrollTo(target, { offset: -70, duration: 1.2 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // ============================================
    // 19. PROCESS TIMELINE PROGRESS LINE
    // ============================================
    const processTimeline = document.querySelector('.process-timeline');
    const processLine = document.querySelector('.process-line');
    if (processTimeline && processLine) {
        gsap.fromTo(processLine, 
            { height: '0%' },
            {
                height: '100%',
                ease: 'none',
                scrollTrigger: {
                    trigger: processTimeline,
                    start: 'top 70%',
                    end: 'bottom 80%',
                    scrub: 1
                }
            }
        );
    }

    // ============================================
    // 20. TECH CHIPS STAGGER ANIMATION
    // ============================================
    const techCategories = document.querySelectorAll('.tech-category');
    techCategories.forEach(cat => {
        const chips = cat.querySelectorAll('.tech-chip');
        if (chips.length) {
            gsap.fromTo(chips,
                { opacity: 0, y: 15, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.04,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: cat,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
    });

    // ============================================
    // 21. SECTION LABEL LINE ANIMATION
    // ============================================
    const labelLines = document.querySelectorAll('.label-line');
    labelLines.forEach(line => {
        gsap.fromTo(line,
            { scaleX: 0 },
            {
                scaleX: 1,
                transformOrigin: 'left center',
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: line,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // ============================================
    // 22. INSIGHTS CARDS HOVER
    // ============================================
    const insightCards = document.querySelectorAll('.insight-card');
    insightCards.forEach(card => {
        const img = card.querySelector('.icard-img img');
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -8, duration: 0.35, ease: 'power2.out' });
            if (img) gsap.to(img, { scale: 1.06, duration: 0.5, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, duration: 0.35, ease: 'power2.out' });
            if (img) gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' });
        });
    });

}); // End DOMContentLoaded
