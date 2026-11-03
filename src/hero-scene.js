/* ==============================================================
   AEON — HERO WEBGL SCENE (Three.js)
   A high-DPI particle globe with travelling data arcs, orbit rings
   and a deep star field. Bundled to js/hero-scene.min.js via esbuild.
   ============================================================== */
import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    Group,
    BufferGeometry,
    Float32BufferAttribute,
    ShaderMaterial,
    LineBasicMaterial,
    Points,
    Line,
    LineLoop,
    Color,
    Vector3,
    QuadraticBezierCurve3,
    AdditiveBlending,
} from 'three';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function supportsWebGL() {
    try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
        return false;
    }
}

function fibonacciSphere(count, radius) {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = golden * i;
        positions[i * 3] = Math.cos(theta) * r * radius;
        positions[i * 3 + 1] = y * radius;
        positions[i * 3 + 2] = Math.sin(theta) * r * radius;
        randoms[i] = Math.random();
    }
    return { positions, randoms };
}

function randomOnSphere(radius) {
    const u = Math.random() * 2 - 1;
    const t = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    return new Vector3(Math.cos(t) * r * radius, u * radius, Math.sin(t) * r * radius);
}

const GLOBE_VERTEX = /* glsl */ `
    uniform float uTime;
    uniform float uSize;
    uniform float uPixelRatio;
    attribute float aRandom;
    varying float vAlpha;
    varying float vMix;
    void main() {
        vec3 p = position;
        float wave = sin(p.y * 3.0 + uTime * 1.1 + aRandom * 6.2831) * 0.035;
        p += normalize(p) * wave;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPixelRatio * (0.55 + aRandom * 0.9) / -mv.z;
        vec3 n = normalize(normalMatrix * normalize(position));
        float facing = smoothstep(-0.55, 0.65, n.z);
        float twinkle = 0.6 + 0.4 * sin(uTime * 1.8 + aRandom * 40.0);
        vAlpha = (0.12 + facing * 0.88) * twinkle;
        vMix = clamp(p.y / 4.0 + 0.5, 0.0, 1.0);
    }
`;

const GLOBE_FRAGMENT = /* glsl */ `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uOpacity;
    varying float vAlpha;
    varying float vMix;
    void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float strength = pow(1.0 - d * 2.0, 1.7);
        vec3 col = mix(uColorB, uColorA, vMix);
        gl_FragColor = vec4(col, strength * vAlpha * uOpacity);
    }
`;

const ARC_VERTEX = /* glsl */ `
    attribute float aT;
    attribute float aOffset;
    attribute float aSpeed;
    varying float vT;
    varying float vOffset;
    varying float vSpeed;
    void main() {
        vT = aT;
        vOffset = aOffset;
        vSpeed = aSpeed;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const ARC_FRAGMENT = /* glsl */ `
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uColor;
    uniform vec3 uHead;
    varying float vT;
    varying float vOffset;
    varying float vSpeed;
    void main() {
        float head = fract(uTime * vSpeed + vOffset) * 1.4 - 0.2;
        float d = head - vT;
        float tail = 0.28;
        float trail = (d > 0.0 && d < tail) ? pow(1.0 - d / tail, 2.0) : 0.0;
        float base = 0.07;
        vec3 col = mix(uColor, uHead, trail);
        gl_FragColor = vec4(col, (base + trail * 0.95) * uOpacity);
    }
`;

const NODE_VERTEX = /* glsl */ `
    uniform float uTime;
    uniform float uPixelRatio;
    attribute float aRandom;
    varying float vPulse;
    void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        vPulse = 0.5 + 0.5 * sin(uTime * 2.4 + aRandom * 12.0);
        gl_PointSize = (70.0 + vPulse * 50.0) * uPixelRatio / -mv.z;
    }
`;

const NODE_FRAGMENT = /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vPulse;
    void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float core = smoothstep(0.18, 0.0, d);
        float ring = smoothstep(0.05, 0.0, abs(d - (0.22 + vPulse * 0.22))) * (1.0 - vPulse);
        float glow = pow(1.0 - d * 2.0, 3.0) * 0.5;
        gl_FragColor = vec4(uColor, (core + ring * 0.8 + glow) * uOpacity);
    }
`;

const STAR_VERTEX = /* glsl */ `
    uniform float uTime;
    uniform float uPixelRatio;
    attribute float aRandom;
    varying float vAlpha;
    void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.0 + aRandom * 2.2) * uPixelRatio;
        vAlpha = 0.25 + 0.55 * (0.5 + 0.5 * sin(uTime * 0.8 + aRandom * 50.0));
    }
`;

const STAR_FRAGMENT = /* glsl */ `
    uniform float uOpacity;
    varying float vAlpha;
    void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(0.78, 0.84, 1.0, (1.0 - d * 2.0) * vAlpha * uOpacity);
    }
`;

function initHeroScene() {
    const canvas = document.getElementById('heroGL');
    const hero = document.getElementById('hero');
    if (!canvas || !hero || !supportsWebGL()) return;

    let renderer;
    try {
        renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
        return;
    }

    const isSmall = () => window.innerWidth < 768;
    const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);

    renderer.setPixelRatio(pixelRatio());
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const world = new Group();
    const globe = new Group();
    world.add(globe);
    scene.add(world);

    const RADIUS = 2.1;
    const uniforms = {
        uTime: { value: 0 },
        uPixelRatio: { value: pixelRatio() },
        uOpacity: { value: 0 },
    };

    // --- Point globe ---
    const { positions, randoms } = fibonacciSphere(isSmall() ? 3800 : 7200, RADIUS);
    const globeGeo = new BufferGeometry();
    globeGeo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    globeGeo.setAttribute('aRandom', new Float32BufferAttribute(randoms, 1));
    const globeMat = new ShaderMaterial({
        vertexShader: GLOBE_VERTEX,
        fragmentShader: GLOBE_FRAGMENT,
        uniforms: {
            uTime: uniforms.uTime,
            uPixelRatio: uniforms.uPixelRatio,
            uOpacity: uniforms.uOpacity,
            uSize: { value: 30 },
            uColorA: { value: new Color('#93c5fd') },
            uColorB: { value: new Color('#7c3aed') },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
    });
    globe.add(new Points(globeGeo, globeMat));

    // --- Latitude / longitude wireframe ---
    const wireMat = new LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending });
    const wireTargetOpacity = 0.12;
    for (let i = 1; i < 6; i++) {
        const lat = -Math.PI / 2 + (i / 6) * Math.PI;
        const pts = [];
        for (let j = 0; j <= 96; j++) {
            const a = (j / 96) * Math.PI * 2;
            pts.push(Math.cos(a) * Math.cos(lat) * RADIUS, Math.sin(lat) * RADIUS, Math.sin(a) * Math.cos(lat) * RADIUS);
        }
        const g = new BufferGeometry();
        g.setAttribute('position', new Float32BufferAttribute(pts, 3));
        globe.add(new Line(g, wireMat));
    }
    for (let i = 0; i < 8; i++) {
        const lon = (i / 8) * Math.PI;
        const pts = [];
        for (let j = 0; j <= 96; j++) {
            const a = (j / 96) * Math.PI * 2;
            pts.push(Math.cos(a) * Math.cos(lon) * RADIUS, Math.sin(a) * RADIUS, Math.cos(a) * Math.sin(lon) * RADIUS);
        }
        const g = new BufferGeometry();
        g.setAttribute('position', new Float32BufferAttribute(pts, 3));
        globe.add(new Line(g, wireMat));
    }

    // --- Data arcs + endpoint nodes ---
    const arcMat = new ShaderMaterial({
        vertexShader: ARC_VERTEX,
        fragmentShader: ARC_FRAGMENT,
        uniforms: {
            uTime: uniforms.uTime,
            uOpacity: uniforms.uOpacity,
            uColor: { value: new Color('#3b82f6') },
            uHead: { value: new Color('#e0f2fe') },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
    });

    const nodePositions = [];
    const nodeRandoms = [];
    const ARC_COUNT = isSmall() ? 12 : 22;
    const SEGMENTS = 72;
    for (let i = 0; i < ARC_COUNT; i++) {
        let a, b;
        do {
            a = randomOnSphere(RADIUS);
            b = randomOnSphere(RADIUS);
        } while (a.angleTo(b) < 0.7);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const lift = RADIUS * (1.15 + a.angleTo(b) * 0.28);
        mid.normalize().multiplyScalar(lift);
        const curve = new QuadraticBezierCurve3(a, mid, b);
        const pts = curve.getPoints(SEGMENTS);
        const pos = [];
        const t = [];
        const off = [];
        const spd = [];
        const offset = Math.random();
        const speed = 0.12 + Math.random() * 0.16;
        pts.forEach((p, k) => {
            pos.push(p.x, p.y, p.z);
            t.push(k / SEGMENTS);
            off.push(offset);
            spd.push(speed);
        });
        const g = new BufferGeometry();
        g.setAttribute('position', new Float32BufferAttribute(pos, 3));
        g.setAttribute('aT', new Float32BufferAttribute(t, 1));
        g.setAttribute('aOffset', new Float32BufferAttribute(off, 1));
        g.setAttribute('aSpeed', new Float32BufferAttribute(spd, 1));
        globe.add(new Line(g, arcMat));
        nodePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        nodeRandoms.push(Math.random(), Math.random());
    }

    const nodeGeo = new BufferGeometry();
    nodeGeo.setAttribute('position', new Float32BufferAttribute(nodePositions, 3));
    nodeGeo.setAttribute('aRandom', new Float32BufferAttribute(nodeRandoms, 1));
    const nodeMat = new ShaderMaterial({
        vertexShader: NODE_VERTEX,
        fragmentShader: NODE_FRAGMENT,
        uniforms: {
            uTime: uniforms.uTime,
            uPixelRatio: uniforms.uPixelRatio,
            uOpacity: uniforms.uOpacity,
            uColor: { value: new Color('#60a5fa') },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
    });
    globe.add(new Points(nodeGeo, nodeMat));

    // --- Orbit rings with satellites ---
    const orbits = [];
    const orbitDefs = [
        { r: RADIUS * 1.32, tiltX: 1.15, tiltZ: 0.35, speed: 0.35, color: '#60a5fa' },
        { r: RADIUS * 1.55, tiltX: 1.9, tiltZ: -0.5, speed: -0.22, color: '#a78bfa' },
    ];
    orbitDefs.forEach(def => {
        const ring = new Group();
        ring.rotation.set(def.tiltX, 0, def.tiltZ);
        const pts = [];
        for (let j = 0; j < 160; j++) {
            const a = (j / 160) * Math.PI * 2;
            pts.push(Math.cos(a) * def.r, 0, Math.sin(a) * def.r);
        }
        const g = new BufferGeometry();
        g.setAttribute('position', new Float32BufferAttribute(pts, 3));
        const mat = new LineBasicMaterial({ color: def.color, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending });
        ring.add(new LineLoop(g, mat));

        const satGeo = new BufferGeometry();
        satGeo.setAttribute('position', new Float32BufferAttribute([def.r, 0, 0], 3));
        satGeo.setAttribute('aRandom', new Float32BufferAttribute([Math.random()], 1));
        const satMat = nodeMat.clone();
        satMat.uniforms.uTime = uniforms.uTime;
        satMat.uniforms.uPixelRatio = uniforms.uPixelRatio;
        satMat.uniforms.uOpacity = uniforms.uOpacity;
        satMat.uniforms.uColor = { value: new Color(def.color) };
        const sat = new Points(satGeo, satMat);
        ring.add(sat);
        world.add(ring);
        orbits.push({ ring, mat, sat, def, angle: Math.random() * Math.PI * 2 });
    });

    // --- Star field ---
    const STAR_COUNT = isSmall() ? 600 : 1400;
    const starPos = new Float32Array(STAR_COUNT * 3);
    const starRnd = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
        const v = randomOnSphere(14 + Math.random() * 18);
        starPos[i * 3] = v.x;
        starPos[i * 3 + 1] = v.y;
        starPos[i * 3 + 2] = v.z - 10;
        starRnd[i] = Math.random();
    }
    const starGeo = new BufferGeometry();
    starGeo.setAttribute('position', new Float32BufferAttribute(starPos, 3));
    starGeo.setAttribute('aRandom', new Float32BufferAttribute(starRnd, 1));
    const stars = new Points(starGeo, new ShaderMaterial({
        vertexShader: STAR_VERTEX,
        fragmentShader: STAR_FRAGMENT,
        uniforms: { uTime: uniforms.uTime, uPixelRatio: uniforms.uPixelRatio, uOpacity: uniforms.uOpacity },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
    }));
    scene.add(stars);

    // --- Layout ---
    const layout = { x: 0, y: 0, scale: 1 };
    function resize() {
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        uniforms.uPixelRatio.value = pixelRatio();
        renderer.setPixelRatio(pixelRatio());
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (w < 768) {
            layout.x = 0.4; layout.y = -1.2; layout.scale = 0.6;
        } else if (w < 1200) {
            layout.x = 1.5 * Math.min(1.3, camera.aspect / 1.2); layout.y = -0.3; layout.scale = 0.7;
        } else {
            layout.x = 2.4 * Math.min(1.3, camera.aspect / 1.6); layout.y = -0.05; layout.scale = 0.84;
        }
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // --- Interaction state ---
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('pointermove', (e) => {
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    let scrollProgress = 0;
    const updateScroll = () => {
        scrollProgress = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight || 1)));
    };
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    let visible = true;
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) loop();
        }).observe(hero);
    }
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) loop();
    });

    const start = performance.now();
    let rafId = null;
    let firstFrame = true;
    let spin = 0;

    function render(now) {
        const elapsed = (now - start) / 1000;
        const t = prefersReducedMotion ? 4 : elapsed;
        uniforms.uTime.value = t;

        // Intro reveal (1.8s ease-out), then scroll fade
        const intro = prefersReducedMotion ? 1 : 1 - Math.pow(1 - Math.min(1, elapsed / 1.8), 3);
        const fade = 1 - scrollProgress * 0.85;
        uniforms.uOpacity.value = intro * fade;
        wireMat.opacity = wireTargetOpacity * intro * fade;
        orbits.forEach(o => { o.mat.opacity = 0.22 * intro * fade; });

        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;

        if (!prefersReducedMotion) spin += 0.0016;
        globe.rotation.y = spin + pointer.x * 0.35;
        globe.rotation.x = 0.28 + pointer.y * 0.18;
        stars.rotation.y = spin * 0.15 + pointer.x * 0.05;
        stars.rotation.x = pointer.y * 0.04;

        const s = layout.scale * (0.72 + intro * 0.28) * (1 + scrollProgress * 0.25);
        world.scale.setScalar(s);
        world.position.set(layout.x + pointer.x * 0.12, layout.y - pointer.y * 0.08 + scrollProgress * 1.4, 0);

        orbits.forEach(o => {
            if (!prefersReducedMotion) o.angle += o.def.speed * 0.016;
            const p = o.sat.geometry.attributes.position;
            p.setXYZ(0, Math.cos(o.angle) * o.def.r, 0, Math.sin(o.angle) * o.def.r);
            p.needsUpdate = true;
        });

        renderer.render(scene, camera);

        if (firstFrame) {
            firstFrame = false;
            document.documentElement.classList.add('has-webgl');
            window.dispatchEvent(new CustomEvent('hero:webgl-ready'));
        }
    }

    function loop() {
        if (rafId !== null) return;
        const tick = (now) => {
            rafId = null;
            render(now);
            if (visible && !document.hidden && !prefersReducedMotion) {
                rafId = requestAnimationFrame(tick);
            }
        };
        rafId = requestAnimationFrame(tick);
    }

    if (prefersReducedMotion) {
        window.addEventListener('resize', () => requestAnimationFrame(render), { passive: true });
    }
    loop();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroScene);
} else {
    initHeroScene();
}
