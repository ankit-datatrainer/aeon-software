'use strict';

/* ==============================================================
   AEON SOFTWARE SERVICES — MASTER JAVASCRIPT
   Award-Winning Interactive Animations & Kinetic Experiences
   100% Native, Fluid, Non-Blocking Architecture
   ============================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Register GSAP plugins
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);
    }

    // ============================================
    // 1. PRELOADER ANIMATION & FAILSAFE
    // ============================================
    let heroTL = null;
    const preloader = document.getElementById('preloader');
    const plLetters = document.querySelectorAll('.pl-letter');
    const counterNum = document.querySelector('.counter-num');
    const barFill = document.querySelector('.preloader-bar-fill');

    function dismissPreloader() {
        if (!preloader) return;
        preloader.classList.add('loaded', 'is-done');
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        preloader.style.pointerEvents = 'none';
        document.body.style.overflow = '';
        document.body.classList.remove('no-scroll');
        setTimeout(() => {
            if (preloader) preloader.style.display = 'none';
        }, 500);
    }

    function runPreloader() {
        if (!preloader) {
            triggerHeroAnimations();
            return;
        }

        const preloaderTL = gsap.timeline({
            onComplete: () => {
                gsap.to(preloader, {
                    yPercent: -100,
                    duration: 0.8,
                    ease: 'power4.inOut',
                    onComplete: () => {
                        dismissPreloader();
                        triggerHeroAnimations();
                        if (typeof ScrollTrigger !== 'undefined') {
                            ScrollTrigger.refresh();
                        }
                    }
                });
            }
        });

        // Letters reveal
        if (plLetters.length) {
            preloaderTL.fromTo(plLetters, 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
            );
        }

        // Counter 0 -> 100
        const counterObj = { val: 0 };
        if (counterNum) {
            preloaderTL.to(counterObj, {
                val: 100,
                duration: 1.2,
                ease: 'power2.inOut',
                onUpdate: () => {
                    counterNum.textContent = Math.round(counterObj.val);
                }
            }, '-=0.2');
        }

        // Progress bar
        if (barFill) {
            preloaderTL.to(barFill, {
                width: '100%',
                duration: 1.2,
                ease: 'power2.inOut'
            }, '<');
        }

        // Failsafe timer: preloader MUST dismiss within 3.5 seconds no matter what
        // (the normal intro + slide-out finishes at ~2.6s)
        setTimeout(() => {
            if (preloader && preloader.style.display !== 'none') {
                dismissPreloader();
                triggerHeroAnimations();
            }
        }, 3500);
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('skip_preloader') === '1') {
        dismissPreloader();
        triggerHeroAnimations(true);
    } else {
        runPreloader();
    }

    // ============================================
    // 2. HERO SECTION ENTRANCE ANIMATIONS
    // ============================================
    function triggerHeroAnimations(jumpToEnd = false) {
        // Run the intro only once, whichever of preloader-complete / failsafe fires first
        if (heroTL) return;
        heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });

        const heroBadge = document.querySelector('.hero-badge');
        if (heroBadge) {
            heroTL.fromTo(heroBadge, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.7 });
        }

        const htLines = document.querySelectorAll('.ht-line');
        htLines.forEach(line => { line.style.overflow = 'hidden'; });

        const htWords = document.querySelectorAll('.ht-word');
        if (htWords.length) {
            heroTL.fromTo(htWords, 
                { y: '110%', opacity: 0 },
                { y: '0%', opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power4.out' },
                '-=0.3'
            );
        }

        const heroDesc = document.querySelector('.hero-desc');
        if (heroDesc) {
            heroTL.fromTo(heroDesc, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');
        }

        const heroButtons = document.querySelector('.hero-buttons');
        if (heroButtons) {
            heroTL.fromTo(heroButtons, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');
        }

        const heroPillars = document.querySelectorAll('.hero-pillars li');
        if (heroPillars.length) {
            heroTL.fromTo(heroPillars, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, '-=0.45');
        }

        const scrollIndicator = document.querySelector('.hero-scroll-indicator');
        if (scrollIndicator) {
            heroTL.fromTo(scrollIndicator, { opacity: 0 }, { opacity: 1, duration: 0.7 }, '-=0.3');
        }

        const stripItems = document.querySelectorAll('.hero-bottom-strip .strip-item, .hero-bottom-strip .strip-divider');
        if (stripItems.length) {
            heroTL.fromTo(stripItems, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, '-=0.4');
        }

        if (jumpToEnd) {
            heroTL.progress(1);
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

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.set(cursorDot, { x: mouseX, y: mouseY });
        }, { passive: true });

        gsap.ticker.add(() => {
            ringX += (mouseX - ringX) * 0.22;
            ringY += (mouseY - ringY) * 0.22;
            gsap.set(cursorRing, { x: ringX, y: ringY });
        });

        const hoverTargets = document.querySelectorAll('a, button, [data-magnetic], input, select, textarea, .service-card, .work-card, .industry-card, .tech-chip, .pillar, .cyber-card');

        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorRing.classList.add('hover');
                gsap.to(cursorRing, { scale: 1.5, duration: 0.25, ease: 'power2.out' });
            });

            el.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('hover');
                gsap.to(cursorRing, { scale: 1, duration: 0.25, ease: 'power2.out' });
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
        // The Three.js hero scene replaces this 2D network once WebGL is running
        if (document.documentElement.classList.contains('has-webgl')) return;
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            p.x = Math.max(0, Math.min(w, p.x));
            p.y = Math.max(0, Math.min(h, p.y));

            const mdx = mousePos.x - p.x;
            const mdy = mousePos.y - p.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < mousePos.radius) {
                const force = (1 - mdist / mousePos.radius) * 0.5;
                p.x -= (mdx / mdist) * force * 1.8;
                p.y -= (mdy / mdist) * force * 1.8;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${p.baseAlpha})`;
            ctx.fill();
        }

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

            const mdx = mousePos.x - particles[i].x;
            const mdy = mousePos.y - particles[i].y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < mousePos.radius) {
                const opacity = (1 - mdist / mousePos.radius) * 0.4;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mousePos.x, mousePos.y);
                ctx.strokeStyle = `rgba(147, 197, 253, ${opacity})`;
                ctx.lineWidth = 0.7;
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

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (canvas) {
                resizeCanvas();
                createParticles();
            }
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }, 200);
    }, { passive: true });

    // ============================================
    // 5. NAVIGATION & HEADER SCROLL BEHAVIOR
    // ============================================
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link[data-nav]');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const sections = document.querySelectorAll('section[id]');

    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentY = window.scrollY;

        // Scrolled background & pill elevation style
        if (currentY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = currentY;

        // Highlight active section in navigation pill
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
    }, { passive: true });

    // Smooth Anchor Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#' || !href) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const headerOffset = 70;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });

    // Mobile Menu Controls
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            if (mobileMenu.classList.contains('active')) {
                document.body.classList.add('no-scroll');
            } else {
                document.body.classList.remove('no-scroll');
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                hamburger.classList.remove('active');
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('active');
                mobileMenu.classList.remove('open');
                document.body.classList.remove('no-scroll');
                const target = link.getAttribute('href');
                if (target && target.startsWith('#')) {
                    const el = document.querySelector(target);
                    if (el) {
                        const headerOffset = 70;
                        const elementPosition = el.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // ============================================
    // 6. SCROLL REVEAL ANIMATIONS (GSAP FROMTO)
    // ============================================
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        if (el.closest('.hero')) return;

        gsap.fromTo(el, 
            { y: 35, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.85,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // ============================================
    // 7. SPLIT TEXT HEADINGS ANIMATION
    // ============================================
    const splitTextEls = document.querySelectorAll('.split-text');
    splitTextEls.forEach(el => {
        // Preferred path: GSAP SplitText with masked line + word reveal
        if (typeof SplitText !== 'undefined') {
            const split = SplitText.create(el, { type: 'words,lines', mask: 'lines', linesClass: 'split-line' });
            gsap.from(split.words, {
                yPercent: 115,
                rotate: 4,
                opacity: 0,
                duration: 0.9,
                stagger: 0.035,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            });
            return;
        }

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
                duration: 0.75,
                stagger: 0.03,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // ==============================================================
    // 8. HORIZONTAL SCROLL SERVICES — PINNED WITH FLUID CONTROLS
    // (Effortless Mouse Scroll, Prev/Next Navigation, Drag & 3D Tilt)
    // ==============================================================
    const servicesSection = document.getElementById('services');
    const servicesScrollWrap = document.getElementById('servicesScrollWrap');
    const servicesTrack = document.getElementById('servicesTrack');
    const progressFill = document.getElementById('servicesProgressFill');
    const scCurrent = document.querySelector('.services-counter .sc-current');
    const prevBtn = document.getElementById('servicesPrev');
    const nextBtn = document.getElementById('servicesNext');

    if (servicesSection && servicesTrack) {
        let horizontalTween = null;
        let servicesST = null;
        let scrollDist = 2000;

        function initHorizontalScroll() {
            // Clean up old triggers
            ScrollTrigger.getAll().forEach(st => {
                if (st.trigger === servicesSection || st.trigger === servicesScrollWrap) st.kill();
            });

            // On mobile (< 768px), allow native momentum swipe without pin
            if (window.innerWidth < 768) {
                gsap.set(servicesTrack, { clearProps: 'all' });
                ScrollTrigger.refresh();
                return;
            }

            const totalScrollWidth = servicesTrack.scrollWidth - window.innerWidth + 100;
            if (totalScrollWidth <= 0) return;

            // Calibrated scroll distance so users glide easily without fatigue
            scrollDist = Math.min(2200, Math.round(totalScrollWidth * 0.6));

            horizontalTween = gsap.to(servicesTrack, {
                x: -totalScrollWidth,
                ease: 'none',
                scrollTrigger: {
                    trigger: servicesSection,
                    pin: true,
                    scrub: 0.5,
                    start: 'top top',
                    end: () => `+=${scrollDist}`,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                    // Refresh the pin first so triggers further down account for its spacer
                    refreshPriority: 1,
                    onUpdate: (self) => {
                        servicesST = self;
                        // Update progress bar
                        if (progressFill) {
                            const pct = Math.max(8.33, self.progress * 100);
                            progressFill.style.width = `${pct}%`;
                        }
                        // Update live counter (01 to 12)
                        if (scCurrent) {
                            const cardIndex = Math.min(12, Math.max(1, Math.ceil(self.progress * 11) + 1));
                            scCurrent.textContent = cardIndex < 10 ? `0${cardIndex}` : `${cardIndex}`;
                        }
                    }
                }
            });
            ScrollTrigger.sort();
            ScrollTrigger.refresh();
        }

        window.addEventListener('load', () => {
            initHorizontalScroll();
            ScrollTrigger.refresh();
        });
        setTimeout(initHorizontalScroll, 300);

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(initHorizontalScroll, 200);
        }, { passive: true });

        // Prev & Next Buttons for 1-Click Smooth Card Navigation
        if (prevBtn && nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const step = scrollDist / 11;
                window.scrollBy({ top: step, behavior: 'smooth' });
            });

            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const step = scrollDist / 11;
                window.scrollBy({ top: -step, behavior: 'smooth' });
            });
        }

        // Drag-to-Scroll on Services Track
        if (servicesScrollWrap) {
            let isDragging = false;
            let dragStartX = 0;
            let dragStartScrollY = 0;

            servicesScrollWrap.addEventListener('mousedown', (e) => {
                // Ignore button clicks
                if (e.target.closest('button') || e.target.closest('a')) return;
                isDragging = true;
                dragStartX = e.pageX;
                dragStartScrollY = window.scrollY;
                servicesScrollWrap.style.cursor = 'grabbing';
            });

            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    if (servicesScrollWrap) servicesScrollWrap.style.cursor = 'grab';
                }
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const deltaX = e.pageX - dragStartX;
                const targetY = dragStartScrollY - (deltaX * 1.6);
                window.scrollTo({ top: targetY, behavior: 'auto' });
            });
        }

        // Interactive 3D Card Tilt with Mouse (Clean, No Clashing Text)
        const serviceCards = document.querySelectorAll('.service-card');
        if (!isTouchDevice) {
            serviceCards.forEach(card => {
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
                        duration: 0.45,
                        ease: 'power2.out'
                    });
                });
            });
        }
    }

    // ============================================
    // 9. PARALLAX IMAGE SCROLLING
    // ============================================
    const parallaxWraps = document.querySelectorAll('.parallax-wrap');
    parallaxWraps.forEach(wrap => {
        const img = wrap.querySelector('img');
        if (!img) return;
        const speed = parseFloat(wrap.getAttribute('data-speed')) || 0.08;
        gsap.to(img, {
            yPercent: -16,
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
    // 10. STATS COUNTER ANIMATION
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
                    duration: 2.0,
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
    // 11. MARQUEE VELOCITY & SKEW EFFECT
    // ============================================
    const marqueeTrack = document.querySelector('.marquee-track');
    if (marqueeTrack) {
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                const velocity = self.getVelocity();
                const skew = Math.max(-3.5, Math.min(3.5, velocity / 400));
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
    // 12. KINETIC MAGNETIC BUTTON EFFECT
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
    // 13. TESTIMONIALS SLIDER
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
    // 14. INDUSTRY CARDS — 3D PERSPECTIVE TILT
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
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;

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
                    duration: 0.45,
                    ease: 'power2.out'
                });
            });
        });
    }

    // ============================================
    // 15. WORK CARDS — IMAGE SCALE & HOVER
    // ============================================
    const workCards = document.querySelectorAll('.work-card');
    workCards.forEach(card => {
        const img = card.querySelector('.wc-img img');
        if (!img) return;

        card.addEventListener('mouseenter', () => {
            gsap.to(img, { scale: 1.05, duration: 0.5, ease: 'power2.out' });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' });
        });
    });

    // ============================================
    // 16. CONTACT FORM SUBMISSION & VALIDATION
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
    // 17. PROCESS TIMELINE PROGRESS LINE
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
    // 18. TECH CHIPS STAGGER ANIMATION
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
    // 19. SECTION LABEL LINE ANIMATION
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
    // 20. INSIGHTS CARDS HOVER
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
