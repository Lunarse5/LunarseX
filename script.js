// ==========================================
// 1. WEB AUDIO SYNTHESIZER
// ==========================================
let audioCtx = null;
let isSoundEnabled = false;
let ambientOsc = null;
let ambientGain = null;

function toggleAudio() {
    const icon = document.getElementById('sound-icon');
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!isSoundEnabled) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        ambientOsc = audioCtx.createOscillator();
        ambientGain = audioCtx.createGain();
        ambientOsc.type = 'sine';
        ambientOsc.frequency.setValueAtTime(55, audioCtx.currentTime);
        ambientGain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        
        ambientOsc.connect(ambientGain);
        ambientGain.connect(audioCtx.destination);
        ambientOsc.start();

        isSoundEnabled = true;
        icon.className = 'fa-solid fa-volume-high text-orange-400 text-base';
        playBeep(660, 0.08);
    } else {
        if (ambientOsc) {
            ambientOsc.stop();
            ambientOsc.disconnect();
            ambientOsc = null;
        }
        isSoundEnabled = false;
        icon.className = 'fa-solid fa-volume-xmark text-base';
    }
}

function playBeep(freq = 520, duration = 0.06) {
    if (!isSoundEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playClickSound() {
    playBeep(740, 0.05);
}

// ==========================================
// 2. PLANETARY TELEMETRY DATABASE & CARD TOGGLE
// ==========================================
const PLANET_DATA = {
    earth: {
        code: 'SOL-03',
        name: 'EARTH',
        type: 'Biosphere',
        typeColor: 'text-sky-400',
        desc: 'Primary logistics hub & extreme terrestrial analog proving ground for off-world hardware validation.',
        gravity: '9.807 m/s²',
        temp: '+15.0 °C',
        atmo: '101.3 kPa (N₂/O₂)',
        transit: 'LEO: 8.5 MIN'
    },
    moon: {
        code: 'SOL-03A',
        name: 'MOON (LUNA)',
        type: 'Cislunar Satellite',
        typeColor: 'text-slate-300',
        desc: 'Tidal-locked basaltic world featuring permanently shadowed polar craters rich in water ice.',
        gravity: '1.620 m/s²',
        temp: '-53.0 °C (Avg)',
        atmo: '10⁻¹⁰ Pa (Vacuum)',
        transit: '72 HOURS'
    },
    mars: {
        code: 'SOL-04',
        name: 'MARS',
        type: 'Terrestrial Frontier',
        typeColor: 'text-orange-400',
        desc: 'Iron-oxide desert world with ancient river deltas, polar ice caps, and thin CO₂ atmosphere.',
        gravity: '3.721 m/s²',
        temp: '-63.0 °C',
        atmo: '0.636 kPa (95% CO₂)',
        transit: '6–9 MONTHS'
    }
};

function showTelemetryCard() {
    const card = document.getElementById('telemetry-card');
    card.classList.remove('opacity-0', 'translate-x-8', 'pointer-events-none');
    card.classList.add('opacity-100', 'translate-x-0', 'pointer-events-auto');
}

function hideTelemetryCard() {
    playBeep(400, 0.04);
    const card = document.getElementById('telemetry-card');
    card.classList.remove('opacity-100', 'translate-x-0', 'pointer-events-auto');
    card.classList.add('opacity-0', 'translate-x-8', 'pointer-events-none');
    
    ['earth', 'moon', 'mars'].forEach(p => {
        const pill = document.getElementById(`pill-${p}`);
        if (pill) pill.classList.remove('active');
    });
}

function updateTelemetryUI(key) {
    const data = PLANET_DATA[key];
    if (!data) return;

    document.getElementById('telemetry-code').innerText = data.code;
    document.getElementById('telemetry-name').innerText = data.name;
    const typeEl = document.getElementById('telemetry-type');
    typeEl.innerText = data.type;
    typeEl.className = `text-[9px] font-pixel uppercase tracking-wider ${data.typeColor}`;
    document.getElementById('telemetry-desc').innerText = data.desc;
    document.getElementById('telemetry-gravity').innerText = data.gravity;
    document.getElementById('telemetry-temp').innerText = data.temp;
    document.getElementById('telemetry-atmo').innerText = data.atmo;
    document.getElementById('telemetry-transit').innerText = data.transit;

    ['earth', 'moon', 'mars'].forEach(p => {
        const pill = document.getElementById(`pill-${p}`);
        if (pill) {
            if (p === key) pill.classList.add('active');
            else pill.classList.remove('active');
        }
    });

    showTelemetryCard();
}

// ==========================================
// 3. RETRO PIXEL-ART TEXTURE GENERATORS
// ==========================================
function createPixelTexture(width, height, drawFn, transparent = false) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!transparent) {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 0, width, height);
    }
    drawFn(ctx, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

const earthTexture = createPixelTexture(32, 16, (ctx, w, h) => {
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            ctx.fillStyle = (x + y) % 3 === 0 ? '#0369a1' : '#0284c7';
            ctx.fillRect(x, y, 1, 1);
        }
    }

    const landPixels = [
        [8,2], [9,2], [10,2], [7,3], [8,3], [9,3], [10,3], [7,4], [8,4], [9,4],
        [9,7], [10,7], [9,8], [10,8], [10,9], [11,9],
        [16,3], [17,3], [16,4], [17,4], [18,4], [16,5], [17,5], [18,5], [17,6], [18,6], [17,7], [18,7],
        [20,2], [21,2], [22,2], [21,3], [22,3], [23,3], [22,4], [23,4], [24,4], [21,5], [22,5],
        [25,10], [26,10], [25,11], [26,11]
    ];

    landPixels.forEach(([x, y]) => {
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(x, y, 1, 1);
        if (x % 2 === 0) {
            ctx.fillStyle = '#22c55e';
            ctx.fillRect((x + 1) % w, y, 1, 1);
        }
    });

    for (let x = 0; x < w; x++) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x, 0, 1, 1);
        ctx.fillRect(x, h - 1, 1, 1);
    }
});

const cloudTexture = createPixelTexture(32, 16, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const cloudPixels = [
        [4,3], [5,3], [12,5], [13,5], [14,5], [20,3], [21,3], [27,7], [28,7]
    ];
    cloudPixels.forEach(([x, y]) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(x, y, 2, 1);
    });
}, true);

const marsTexture = createPixelTexture(32, 16, (ctx, w, h) => {
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (y < 2 || y > h - 3) {
                ctx.fillStyle = '#fed7aa';
            } else {
                const pat = (x * 2 + y) % 4;
                ctx.fillStyle = pat === 0 ? '#ea580c' : (pat === 1 ? '#c2410c' : '#9a3412');
            }
            ctx.fillRect(x, y, 1, 1);
        }
    }
});

const moonTexture = createPixelTexture(32, 16, (ctx, w, h) => {
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const c = (x + y * 3) % 4;
            ctx.fillStyle = c === 0 ? '#334155' : (c === 1 ? '#64748b' : (c === 2 ? '#94a3b8' : '#cbd5e1'));
            ctx.fillRect(x, y, 1, 1);
        }
    }
});

// ==========================================
// 4. THREE.JS 3D PLANET ENGINE
// ==========================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 28);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x334155, 1.35);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
sunLight.position.set(18, 12, 20);
scene.add(sunLight);

const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
rimLight.position.set(-18, -10, -10);
scene.add(rimLight);

// Persistent Full-Sphere Starfield
const starGeo = new THREE.BufferGeometry();
const starCount = 2600;
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i += 3) {
    const radius = 140 + Math.random() * 260;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[i + 2] = radius * Math.cos(phi);

    const tint = Math.random();
    if (tint > 0.84) {
        starColors[i] = 0.98; starColors[i + 1] = 0.58; starColors[i + 2] = 0.25;
    } else if (tint > 0.64) {
        starColors[i] = 0.55; starColors[i + 1] = 0.85; starColors[i + 2] = 1.0;
    } else {
        starColors[i] = 0.95; starColors[i + 1] = 0.96; starColors[i + 2] = 1.0;
    }
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
const starMat = new THREE.PointsMaterial({
    size: 0.75,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false
});
const starField = new THREE.Points(starGeo, starMat);
starField.frustumCulled = false;
scene.add(starField);

// Master Group
const solarGroup = new THREE.Group();
scene.add(solarGroup);

// --- EARTH ---
const earthGroup = new THREE.Group();
earthGroup.position.set(8.8, -2.4, 2.0);
solarGroup.add(earthGroup);

const earthGeo = new THREE.IcosahedronGeometry(4.8, 1);
const earthMat = new THREE.MeshStandardMaterial({
    map: earthTexture,
    flatShading: true,
    roughness: 0.75,
    metalness: 0.1
});
const earthMesh = new THREE.Mesh(earthGeo, earthMat);
earthMesh.userData = { planetKey: 'earth' };
earthGroup.add(earthMesh);

const cloudGeo = new THREE.IcosahedronGeometry(5.02, 1);
const cloudMat = new THREE.MeshStandardMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.78,
    flatShading: true,
    depthWrite: false
});
const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
earthGroup.add(cloudMesh);

const atmosGeo = new THREE.SphereGeometry(5.45, 32, 32);
const atmosMat = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
        glowColor: { value: new THREE.Color(0x38bdf8) }
    },
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            gl_FragColor = vec4(glowColor, intensity * 0.85);
        }
    `
});
const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
earthGroup.add(atmosMesh);

// --- MARS ---
const marsGroup = new THREE.Group();
marsGroup.position.set(-12.5, 6.2, -5.0);
solarGroup.add(marsGroup);

const marsGeo = new THREE.IcosahedronGeometry(2.3, 1);
const marsMat = new THREE.MeshStandardMaterial({
    map: marsTexture,
    flatShading: true,
    roughness: 0.88,
    metalness: 0.05
});
const marsMesh = new THREE.Mesh(marsGeo, marsMat);
marsMesh.userData = { planetKey: 'mars' };
marsGroup.add(marsMesh);

// --- MOON ---
const moonBasePos = { x: -1.2, y: 5.8, z: 3.5 };
const moonGroup = new THREE.Group();
moonGroup.position.set(moonBasePos.x, moonBasePos.y, moonBasePos.z);
solarGroup.add(moonGroup);

const moonGeo = new THREE.IcosahedronGeometry(1.35, 1);
const moonMat = new THREE.MeshStandardMaterial({
    map: moonTexture,
    flatShading: true,
    roughness: 0.92,
    metalness: 0.05
});
const moonMesh = new THREE.Mesh(moonGeo, moonMat);
moonMesh.userData = { planetKey: 'moon' };
moonGroup.add(moonMesh);

// Orbital Ring
const orbitRingGeo = new THREE.RingGeometry(6.1, 6.16, 64);
const orbitRingMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.25
});
const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
orbitRing.rotation.x = Math.PI / 2.4;
orbitRing.rotation.y = -0.25;
earthGroup.add(orbitRing);

// ==========================================
// 5. RAYCASTING, CAMERA FOCUS & RESET VIEW
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let targetMouseX = 0;
let targetMouseY = 0;

const interactiveMeshes = [earthMesh, marsMesh, moonMesh];

const CAMERA_TARGETS = {
    earth: { x: 2.5, y: -0.8, z: 24 },
    moon: { x: -1.0, y: 3.5, z: 19 },
    mars: { x: -7.5, y: 4.0, z: 19.5 }
};
let desiredCamPos = { x: 0, y: 0, z: 28 };

function selectPlanet(key, shouldOpenCard = true) {
    playBeep(620, 0.07);
    if (shouldOpenCard) {
        updateTelemetryUI(key);
    }
    if (CAMERA_TARGETS[key]) {
        desiredCamPos = { ...CAMERA_TARGETS[key] };
    }
}

function resetCameraView() {
    playBeep(500, 0.06);
    desiredCamPos = { x: 0, y: 0, z: 28 };
    hideTelemetryCard();
}

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    targetMouseX = mouse.x * 1.4;
    targetMouseY = mouse.y * 0.9;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes);

    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
});

window.addEventListener('click', (event) => {
    if (event.target.closest('button, a, input, select, aside')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(interactiveMeshes);
    if (intersects.length > 0) {
        const hitKey = intersects[0].object.userData.planetKey;
        selectPlanet(hitKey, true);
    }
});

function applyResponsiveSpacing() {
    if (window.innerWidth < 768) {
        earthGroup.position.set(4.5, -4.5, 0);
        marsGroup.position.set(-6.5, 7.2, -5.0);
        moonBasePos.x = 0.5;
        moonBasePos.y = 5.2;
    } else {
        earthGroup.position.set(8.8, -2.4, 2.0);
        marsGroup.position.set(-12.5, 6.2, -5.0);
        moonBasePos.x = -1.2;
        moonBasePos.y = 5.8;
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    applyResponsiveSpacing();
});
applyResponsiveSpacing();

// Animation Loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    earthMesh.rotation.y += 0.0022;
    cloudMesh.rotation.y += 0.0031;
    cloudMesh.rotation.x = Math.sin(elapsed * 0.2) * 0.04;

    marsMesh.rotation.y += 0.0035;
    moonMesh.rotation.y += 0.004;

    moonGroup.position.x = moonBasePos.x + Math.cos(elapsed * 0.25) * 0.55;
    moonGroup.position.y = moonBasePos.y + Math.sin(elapsed * 0.25) * 0.4;

    starField.position.copy(camera.position);
    starField.rotation.y = elapsed * 0.006;

    const swayX = Math.sin(elapsed * 0.4) * 0.35;
    const swayY = Math.cos(elapsed * 0.3) * 0.25;

    camera.position.x += ((desiredCamPos.x + targetMouseX + swayX) - camera.position.x) * 0.04;
    camera.position.y += ((desiredCamPos.y + targetMouseY + swayY) - camera.position.y) * 0.04;
    camera.position.z += (desiredCamPos.z - camera.position.z) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}
animate();

// ==========================================
// 6. MODAL HANDLERS
// ==========================================
function openMissionModal(contextLabel) {
    playBeep(780, 0.08);
    const modal = document.getElementById('mission-modal');
    const tag = document.getElementById('modal-tag');
    const destSelect = document.getElementById('modal-destination');
    const feedback = document.getElementById('modal-feedback');

    feedback.classList.add('hidden');
    if (contextLabel) {
        tag.innerText = `UPLINK // ${contextLabel}`;
        if (contextLabel.includes('MOON')) destSelect.selectedIndex = 1;
        else if (contextLabel.includes('MARS')) destSelect.selectedIndex = 2;
        else destSelect.selectedIndex = 0;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeMissionModal() {
    playBeep(420, 0.05);
    const modal = document.getElementById('mission-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function handleMissionSubmit(e) {
    e.preventDefault();
    playBeep(880, 0.12);
    const feedback = document.getElementById('modal-feedback');
    feedback.classList.remove('hidden');
    setTimeout(() => {
        closeMissionModal();
    }, 1800);
}

document.getElementById('mission-modal').addEventListener('click', (e) => {
    if (e.target.id === 'mission-modal') closeMissionModal();
});
// Planetary datasets
const PLANETARY_DATA = {
    moon: {
        id: 'moon',
        name: 'Moon',
        gravity: '1.62',
        gravityRatio: '0.165 g',
        tagline: 'Dry highland and regolith-like testbeds',
        analogSite: 'Eastern Desert, Egypt - SAMPLE',
        coordinates: "25°18'N 34°12'E",
        matchScore: 94.8,
        structure: [
            { param: 'Temp (°C avg)', earth: '15°C', target: '-20°C', sub: '(-173° to 127°C)' },
            { param: 'Pressure', earth: '101.3 kPa', target: '3 × 10⁻¹⁵ kPa', sub: 'Ultra-high vacuum' },
            { param: 'Day duration', earth: '24h 00m', target: '29.5 Earth days', sub: '708.7 hrs synodic' },
            { param: 'Regolith Depth', earth: '0.5 - 3.0 m', target: '4.0 - 15.0 m', sub: 'Anorthositic' }
        ],
        composition: [
            { param: 'Silica (SiO₂)', earth: '60.6%', target: '45.4%', sub: 'Silicate matrix' },
            { param: 'Iron Oxide (FeO)', earth: '6.7%', target: '14.1%', sub: 'Mare basaltic' },
            { param: 'Alumina (Al₂O₃)', earth: '15.9%', target: '14.9%', sub: 'Plagioclase' },
            { param: 'Titanium (TiO₂)', earth: '0.7%', target: '3.9%', sub: 'Ilmenite trace' }
        ]
    },
    mars: {
        id: 'mars',
        name: 'Mars',
        gravity: '3.72',
        gravityRatio: '0.379 g',
        tagline: 'Hyper-arid, iron-rich terrain testbeds',
        analogSite: 'Wadi El-Natrun / Eastern Desert - SAMPLE',
        coordinates: "26°04'N 33°51'E",
        matchScore: 96.4,
        structure: [
            { param: 'Temp (°C avg)', earth: '15°C', target: '-63°C', sub: '(-140° to 20°C)' },
            { param: 'Pressure', earth: '101.3 kPa', target: '0.636 kPa', sub: '95.3% CO₂ atm' },
            { param: 'Day duration', earth: '24h 00m', target: '24h 39m', sub: '1.027 Earth sols' },
            { param: 'Regolith Depth', earth: '0.5 - 3.0 m', target: '2.0 - 10.0 m', sub: 'Oxidized basalt' }
        ],
        composition: [
            { param: 'Silica (SiO₂)', earth: '60.6%', target: '49.0%', sub: 'Tholeiitic basalt' },
            { param: 'Iron Oxide (FeO)', earth: '6.7%', target: '18.2%', sub: 'Nanophase hematite' },
            { param: 'Alumina (Al₂O₃)', earth: '15.9%', target: '10.5%', sub: 'Feldspathic' },
            { param: 'Perchlorates', earth: '<0.01%', target: '0.6%', sub: 'ClO₄⁻ oxidizing salts' }
        ]
    }
};

const NAV_STEPS = [
    { id: 1, label: 'Setup', code: 'Step 01' },
    { id: 2, label: 'Analog Finder', code: 'Step 02' },
    { id: 3, label: 'Details', code: 'Step 03' },
    { id: 4, label: 'Analysis', code: 'Step 04' },
    { id: 5, label: 'Reports', code: 'Step 05' }
];

let state = {
    theme: 'dark',
    activeNavStep: 2,
    selectedTarget: 'moon',
    matrixTab: 'Structure',
    activeMinerals: ['Basalt', 'Hematite', 'Perchlorate']
};

// Initialize Lucide icons on load
window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    startClock();
    renderMatrix();
});

// Clock ticker
function startClock() {
    const clockEl = document.getElementById('utc-clock');
    if (!clockEl) return;
    setInterval(() => {
        const now = new Date();
        clockEl.textContent = now.toISOString().substring(11, 19) + ' UTC';
    }, 1000);
}

// Toast notification helper
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    toastText.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3200);
}

// Theme toggler (Dark / Light)
function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    const isLight = state.theme === 'light';
    const body = document.body;

    body.dataset.theme = state.theme;
    
    // Update theme toggle button UI
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (isLight) {
        body.className = "bg-[#eef2f9] text-slate-900 selection:bg-orange-500/30 selection:text-orange-900 min-h-screen flex flex-col relative overflow-x-hidden";
        themeIcon.setAttribute('data-lucide', 'moon');
        themeIcon.className = "w-3.5 h-3.5 text-indigo-600";
        themeText.textContent = "DARK";
        
        // Header & Cards light styling
        document.getElementById('nav-header').className = "sticky top-0 z-30 backdrop-blur-xl border-b px-4 sm:px-6 lg:px-8 py-3 bg-white/90 border-slate-200/90 shadow-sm transition-colors";
        document.getElementById('metric-bar').className = "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 backdrop-blur-md border rounded-2xl px-4 py-3 bg-white/90 border-slate-200/90 shadow-md transition-colors";
        document.getElementById('card-mission').className = "backdrop-blur-xl border rounded-2xl p-5 flex flex-col justify-between bg-white/95 border-slate-200 shadow-md transition-colors";
        document.getElementById('card-projection').className = "backdrop-blur-xl border rounded-2xl p-5 flex-1 flex flex-col justify-between bg-white/95 border-slate-200 shadow-md transition-colors";
        document.getElementById('card-center').className = "lg:col-span-6 backdrop-blur-xl border rounded-2xl p-5 sm:p-6 flex flex-col justify-between bg-white/95 border-slate-200 shadow-md transition-colors";
        document.getElementById('card-matrix').className = "backdrop-blur-xl border rounded-2xl p-5 bg-white/95 border-slate-200 shadow-md transition-colors";
        document.getElementById('card-gauge').className = "relative backdrop-blur-xl border rounded-2xl p-5 flex-1 flex flex-col justify-between bg-white/95 border-slate-200 shadow-md transition-colors";
    } else {
        body.className = "bg-[#070812] text-slate-100 selection:bg-orange-500/30 selection:text-orange-200 min-h-screen flex flex-col relative overflow-x-hidden";
        themeIcon.setAttribute('data-lucide', 'sun');
        themeIcon.className = "w-3.5 h-3.5 text-amber-400";
        themeText.textContent = "LIGHT";

        document.getElementById('nav-header').className = "sticky top-0 z-30 backdrop-blur-xl border-b px-4 sm:px-6 lg:px-8 py-3 bg-[#090b16]/85 border-blue-900/35 transition-colors";
        document.getElementById('metric-bar').className = "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 backdrop-blur-md border rounded-2xl px-4 py-3 bg-[#0c1120]/75 border-blue-900/35 shadow-lg transition-colors";
        document.getElementById('card-mission').className = "backdrop-blur-xl border rounded-2xl p-5 flex flex-col justify-between bg-[#0d1222]/85 border-blue-900/35 shadow-xl transition-colors";
        document.getElementById('card-projection').className = "backdrop-blur-xl border rounded-2xl p-5 flex-1 flex flex-col justify-between bg-[#0d1222]/85 border-blue-900/35 shadow-xl transition-colors";
        document.getElementById('card-center').className = "lg:col-span-6 backdrop-blur-xl border rounded-2xl p-5 sm:p-6 flex flex-col justify-between bg-[#0d1222]/85 border-blue-900/35 shadow-xl transition-colors";
        document.getElementById('card-matrix').className = "backdrop-blur-xl border rounded-2xl p-5 bg-[#0d1222]/85 border-blue-900/35 shadow-xl transition-colors";
        document.getElementById('card-gauge').className = "relative backdrop-blur-xl border rounded-2xl p-5 flex-1 flex flex-col justify-between bg-[#0d1222]/85 border-blue-900/35 shadow-xl transition-colors";
    }

    lucide.createIcons();
    showToast(`Display mode switched: ${state.theme.toUpperCase()} TELEMETRY`);
}

// Navigation Step switch
function setActiveNav(stepId) {
    state.activeNavStep = stepId;
    const stepObj = NAV_STEPS.find(s => s.id === stepId);
    
    // Update step badge in center card
    document.getElementById('step-badge').innerHTML = `<i data-lucide="sparkles" class="w-3.5 h-3.5 text-cyan-400"></i> ${stepObj.code} - ${stepObj.label}`;
    document.getElementById('status-phase-label').textContent = stepObj.label;
    document.getElementById('phase-counter').textContent = `PHASE ${stepId} OF 5`;

    lucide.createIcons();
    showToast(`Switched view: ${stepObj.code} — ${stepObj.label}`);
}

function prevStep() {
    if (state.activeNavStep > 1) {
        setActiveNav(state.activeNavStep - 1);
    }
}

function nextStep() {
    if (state.activeNavStep < 5) {
        setActiveNav(state.activeNavStep + 1);
    } else {
        openReportModal();
    }
}

// Target Planetary Selection (Moon vs Mars)
function selectTarget(targetKey) {
    state.selectedTarget = targetKey;
    const planet = PLANETARY_DATA[targetKey];

    // Update Top Metric Bar
    document.getElementById('stat-target-gravity').textContent = planet.gravity + ' m/s²';
    document.getElementById('stat-target-ratio').textContent = planet.gravityRatio;
    document.getElementById('stat-target-label').textContent = planet.name + ' Gravity';
    document.getElementById('target-name-badge').textContent = planet.name;

    // Update Card selections styling
    const moonCard = document.getElementById('card-target-moon');
    const marsCard = document.getElementById('card-target-mars');
    const checkMoon = document.getElementById('check-moon');
    const checkMars = document.getElementById('check-mars');

    if (targetKey === 'moon') {
        moonCard.className = "group relative rounded-2xl p-4 cursor-pointer transition-all duration-300 border flex flex-col justify-between bg-[#111933] border-cyan-400/70 shadow-[0_0_28px_rgba(56,189,248,0.2)]";
        marsCard.className = "group relative rounded-2xl p-4 cursor-pointer transition-all duration-300 border flex flex-col justify-between bg-[#090d1b]/90 border-blue-900/40";
        checkMoon.classList.remove('hidden');
        checkMars.classList.add('hidden');
    } else {
        marsCard.className = "group relative rounded-2xl p-4 cursor-pointer transition-all duration-300 border flex flex-col justify-between bg-[#1a1426] border-orange-500/75 shadow-[0_0_28px_rgba(249,115,22,0.22)]";
        moonCard.className = "group relative rounded-2xl p-4 cursor-pointer transition-all duration-300 border flex flex-col justify-between bg-[#090d1b]/90 border-blue-900/40";
        checkMars.classList.remove('hidden');
        checkMoon.classList.add('hidden');
    }

    // Update Matrix Target Header
    document.getElementById('matrix-target-header').textContent = planet.name;

    // Update Gauge Card
    document.getElementById('gauge-score').textContent = planet.matchScore + '%';
    document.getElementById('gauge-site').textContent = planet.analogSite;
    document.getElementById('gauge-coords').textContent = planet.coordinates + ' • ' + (targetKey === 'moon' ? 'Basaltic Regolith' : 'Oxidized Basalt');

    renderMatrix();
    showToast(`Selected planetary baseline: Earth vs ${planet.name}`);
}

// Matrix Tabs (Structure vs Composition)
function setMatrixTab(tabName) {
    state.matrixTab = tabName;
    const structBtn = document.getElementById('tab-btn-Structure');
    const compBtn = document.getElementById('tab-btn-Composition');

    if (tabName === 'Structure') {
        structBtn.className = "py-1.5 text-[11px] font-pixel-ui rounded-lg transition-all bg-gradient-to-r from-cyan-500/20 to-blue-600/25 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(56,189,248,0.18)]";
        compBtn.className = "py-1.5 text-[11px] font-pixel-ui rounded-lg transition-all text-slate-400";
    } else {
        compBtn.className = "py-1.5 text-[11px] font-pixel-ui rounded-lg transition-all bg-gradient-to-r from-cyan-500/20 to-blue-600/25 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(56,189,248,0.18)]";
        structBtn.className = "py-1.5 text-[11px] font-pixel-ui rounded-lg transition-all text-slate-400";
    }

    renderMatrix();
}

function renderMatrix() {
    const planet = PLANETARY_DATA[state.selectedTarget];
    const rowsContainer = document.getElementById('matrix-rows');
    const dataList = state.matrixTab === 'Structure' ? planet.structure : planet.composition;

    rowsContainer.innerHTML = dataList.map(row => `
        <div class="grid grid-cols-12 items-center py-2.5 px-1 hover:bg-blue-950/20">
            <div class="col-span-5 pr-1">
                <div class="text-[11px] font-pixel-ui leading-tight text-slate-200">${row.param}</div>
                <div class="text-xs font-pixel-mono text-slate-500 truncate">${row.sub}</div>
            </div>
            <div class="col-span-3 text-right font-pixel-mono text-base font-bold tabular-nums text-cyan-300">${row.earth}</div>
            <div class="col-span-4 text-right font-pixel-mono text-base font-bold tabular-nums text-orange-300">${row.target}</div>
        </div>
    `).join('');
}

// 3D Projection Mineral Toggles
function toggleMineral(mineralId) {
    const idx = state.activeMinerals.indexOf(mineralId);
    if (idx > -1) {
        if (state.activeMinerals.length === 1) return; // Keep at least one active
        state.activeMinerals.splice(idx, 1);
    } else {
        state.activeMinerals.push(mineralId);
    }

    // Update Waveform opacity
    ['Basalt', 'Hematite', 'Perchlorate'].forEach(m => {
        const pathEl = document.getElementById(`wave-${m.toLowerCase()}`);
        const chipEl = document.getElementById(`chip-${m}`);
        const isActive = state.activeMinerals.includes(m);

        if (pathEl) pathEl.style.opacity = isActive ? '1' : '0.14';
        if (chipEl) {
            chipEl.className = isActive
                ? "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-pixel-ui transition-all border bg-slate-800/90 text-white border-slate-600"
                : "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-pixel-ui transition-all border bg-[#080b16] text-slate-500 border-blue-950/60";
        }
    });
}

// Modal Handlers
function openReportModal() {
    const planet = PLANETARY_DATA[state.selectedTarget];
    document.getElementById('modal-dossier-id').textContent = `ID: LNX-2026-ED-${planet.id.toUpperCase()}`;
    document.getElementById('modal-site').textContent = planet.analogSite;
    document.getElementById('modal-score').textContent = planet.matchScore + '%';
    document.getElementById('modal-pair').textContent = `Earth vs ${planet.name}`;
    document.getElementById('modal-gravity-delta').textContent = `9.81 → ${planet.gravity} m/s²`;
    document.getElementById('modal-summary-text').innerHTML = `Spectral LiDAR and mineralogical assays confirm high structural fidelity for <strong>${planet.name}</strong> surface operations. Active spectral channels (${state.activeMinerals.join(', ')}) fall within 1.4σ of orbital reference signatures.`;

    document.getElementById('report-modal').classList.remove('hidden');
}

function closeReportModal() {
    document.getElementById('report-modal').classList.add('hidden');
}
// Planetary datasets
const PLANETARY_DATA = {
    moon: {
        id: 'moon',
        name: 'Moon',
        gravity: '1.62',
        gravityRatio: '0.165 g',
        tagline: 'Dry highland and regolith-like testbeds',
        analogSite: 'Eastern Desert, Egypt - SAMPLE',
        coordinates: "25°18'N 34°12'E",
        matchScore: 94.8,
        structure: [
            { param: 'Temp (°C avg)', earth: '15°C', target: '-20°C', sub: '(-173° to 127°C)' },
            { param: 'Pressure', earth: '101.3 kPa', target: '3 × 10⁻¹⁵ kPa', sub: 'Ultra-high vacuum' },
            { param: 'Day duration', earth: '24h 00m', target: '29.5 Earth days', sub: '708.7 hrs synodic' },
            { param: 'Regolith Depth', earth: '0.5 - 3.0 m', target: '4.0 - 15.0 m', sub: 'Anorthositic' }
        ],
        composition: [
            { param: 'Silica (SiO₂)', earth: '60.6%', target: '45.4%', sub: 'Silicate matrix' },
            { param: 'Iron Oxide (FeO)', earth: '6.7%', target: '14.1%', sub: 'Mare basaltic' },
            { param: 'Alumina (Al₂O₃)', earth: '15.9%', target: '14.9%', sub: 'Plagioclase' },
            { param: 'Titanium (TiO₂)', earth: '0.7%', target: '3.9%', sub: 'Ilmenite trace' }
        ]
    },
    mars: {
        id: 'mars',
        name: 'Mars',
        gravity: '3.72',
        gravityRatio: '0.379 g',
        tagline: 'Hyper-arid, iron-rich terrain testbeds',
        analogSite: 'Wadi El-Natrun / Eastern Desert - SAMPLE',
        coordinates: "26°04'N 33°51'E",
        matchScore: 96.4,
        structure: [
            { param: 'Temp (°C avg)', earth: '15°C', target: '-63°C', sub: '(-140° to 20°C)' },
            { param: 'Pressure', earth: '101.3 kPa', target: '0.636 kPa', sub: '95.3% CO₂ atm' },
            { param: 'Day duration', earth: '24h 00m', target: '24h 39m', sub: '1.027 Earth sols' },
            { param: 'Regolith Depth', earth: '0.5 - 3.0 m', target: '2.0 - 10.0 m', sub: 'Oxidized basalt' }
        ],
        composition: [
            { param: 'Silica (SiO₂)', earth: '60.6%', target: '49.0%', sub: 'Tholeiitic basalt' },
            { param: 'Iron Oxide (FeO)', earth: '6.7%', target: '18.2%', sub: 'Nanophase hematite' },
            { param: 'Alumina (Al₂O₃)', earth: '15.9%', target: '10.5%', sub: 'Feldspathic' },
            { param: 'Perchlorates', earth: '<0.01%', target: '0.6%', sub: 'ClO₄⁻ oxidizing salts' }
        ]
    }
};

const NAV_STEPS = [
    { id: 1, label: 'Setup', code: 'Step 01' },
    { id: 2, label: 'Analog Finder', code: 'Step 02' },
    { id: 3, label: 'Details', code: 'Step 03' },
    { id: 4, label: 'Analysis', code: 'Step 04' },
    { id: 5, label: 'Reports', code: 'Step 05' }
];

let state = {
    theme: 'dark',
    activeNavStep: 2,
    selectedTarget: 'moon',
    matrixTab: 'Structure',
    activeMinerals: ['Basalt', 'Hematite', 'Perchlorate']
};

// Initialize starfield background and Lucide icons on load
window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    startClock();
    renderMatrix();
    generateStarfield();
});

// Generate dynamic twinkling starfield in the background matching space aesthetics
function generateStarfield() {
    const starContainer = document.getElementById('starfield-bg');
    if (!starContainer) return;
    
    starContainer.innerHTML = '';
    const starCount = 95;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 0.8;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        
        if (Math.random() > 0.65) {
            star.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.75)';
            star.style.backgroundColor = '#f8fafc';
        } else {
            star.style.backgroundColor = '#94a3b8';
            star.style.opacity = '0.5';
        }
        starContainer.appendChild(star);
    }
}

// Clock ticker
document.addEventListener('DOMContentLoaded', () => {
  /* =========================================================
     1. TWINKLING STARFIELD CANVAS GENERATOR (DARK & LIGHT)
     ========================================================= */
  const canvas = document.getElementById('starfield-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let currentTheme = 'dark';

  const starColorsDark = ['#ffffff', '#ffe4b5', '#9ec5ff', '#f59b4c'];
  const starColorsLight = ['#e69d35', '#3b82f6', '#7c6cf0', '#f59e0b'];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars();
  }

  function createStars() {
    const count = Math.floor((canvas.width * canvas.height) / 9500);
    const palette = currentTheme === 'dark' ? starColorsDark : starColorsLight;

    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.2 + 0.8,
      baseAlpha: Math.random() * 0.65 + 0.25,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2,
      driftY: (Math.random() - 0.5) * 0.12,
      color: palette[Math.floor(Math.random() * palette.length)],
      isCrossSparkle: Math.random() > 0.78
    }));
  }

  function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach((s) => {
      s.phase += s.twinkleSpeed;
      s.y += s.driftY;

      if (s.y < 0) s.y = canvas.height;
      if (s.y > canvas.height) s.y = 0;

      const alpha = Math.max(0.1, Math.min(1, s.baseAlpha + Math.sin(s.phase) * 0.4));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color;
      ctx.shadowBlur = currentTheme === 'dark' ? 10 : 8;
      ctx.shadowColor = s.color;

      // Pixel-style crisp square/cross sparkle
      const pxSize = Math.round(s.size * 1.5);
      ctx.fillRect(Math.round(s.x), Math.round(s.y), pxSize, pxSize);

      if (s.isCrossSparkle && alpha > 0.65) {
        ctx.fillRect(Math.round(s.x - pxSize), Math.round(s.y), pxSize * 3, Math.max(1, Math.floor(pxSize / 2)));
        ctx.fillRect(Math.round(s.x), Math.round(s.y - pxSize), Math.max(1, Math.floor(pxSize / 2)), pxSize * 3);
      }

      ctx.restore();
    });

    requestAnimationFrame(animateStars);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animateStars();

  /* =========================================================
     2. DARK / LIGHT MODE TOGGLE
     ========================================================= */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeLabel = document.getElementById('theme-label');

  themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'light') {
      themeIcon.textContent = '☾';
      themeLabel.textContent = 'DARK';
    } else {
      themeIcon.textContent = '☀';
      themeLabel.textContent = 'LIGHT';
    }

    createStars(); // Refresh twinkle colors for the active theme
  });

  /* =========================================================
     3. PLANETARY COMPARISON & STRUCTURE/COMPOSITION DATA
     ========================================================= */
  const planetaryData = {
    moon: {
      name: 'Moon',
      gravityLabel: 'Moon gravity',
      gravity: '1.62 m/s²',
      gravityShort: '1.62',
      barWidth: '24%',
      matchPercent: '94.8%',
      gaugeOffset: 13, // ~94.8% of 251.3 arc length
      sampleCaption: 'Eastern Desert, Egypt · SAMPLE',
      structure: {
        earth: [
          { k: 'Temp', v: '15 °C avg' },
          { k: 'Pressure', v: '101.3 kPa' },
          { k: 'Day', v: '24 h' }
        ],
        target: [
          { k: 'Temp', v: '-173...127 °C' },
          { k: 'Pressure', v: '≈ 0 (trace)' },
          { k: 'Day', v: '29.5 days' }
        ]
      },
      composition: {
        earth: [
          { k: 'Silica', v: '59.1% SiO₂' },
          { k: 'Alumina', v: '15.2% Al₂O₃' },
          { k: 'Iron Oxide', v: '6.8% FeO' }
        ],
        target: [
          { k: 'Silica', v: '45.5% SiO₂' },
          { k: 'Alumina', v: '24.0% Al₂O₃' },
          { k: 'Iron Oxide', v: '6.0% FeO' }
        ]
      }
    },
    mars: {
      name: 'Mars',
      gravityLabel: 'Mars gravity',
      gravity: '3.72 m/s²',
      gravityShort: '3.72',
      barWidth: '42%',
      matchPercent: '91.4%',
      gaugeOffset: 22,
      sampleCaption: 'Wadi El Rayan, Egypt · SAMPLE',
      structure: {
        earth: [
          { k: 'Temp', v: '15 °C avg' },
          { k: 'Pressure', v: '101.3 kPa' },
          { k: 'Day', v: '24 h' }
        ],
        target: [
          { k: 'Temp', v: '-63 °C avg' },
          { k: 'Pressure', v: '0.61 kPa' },
          { k: 'Day', v: '24h 37m' }
        ]
      },
      composition: {
        earth: [
          { k: 'Silica', v: '59.1% SiO₂' },
          { k: 'Alumina', v: '15.2% Al₂O₃' },
          { k: 'Iron Oxide', v: '6.8% FeO' }
        ],
        target: [
          { k: 'Silica', v: '43.8% SiO₂' },
          { k: 'Iron Oxide', v: '18.2% Fe₂O₃' },
          { k: 'Perchlorate', v: '0.6% ClO₄⁻' }
        ]
      }
    }
  };

  let selectedTarget = 'moon';
  let selectedView = 'structure';

  const cardMoon = document.getElementById('card-moon');
  const cardMars = document.getElementById('card-mars');
  const viewPills = document.querySelectorAll('.view-pill');

  function updateComparisonUI() {
    const data = planetaryData[selectedTarget];

    // Left Gravity Card
    document.getElementById('left-target-gravity').innerHTML = `${data.gravityShort}<span class="unit">m/s²</span>`;
    document.getElementById('left-target-label').textContent = data.gravityLabel;

    // Right View Card Header & Bar
    document.getElementById('target-planet-name').textContent = data.name;
    document.getElementById('target-val-1').textContent = data.gravity;
    document.getElementById('target-bar-fill').style.width = data.barWidth;

    // Right View Rows (Structure vs Composition)
    const earthRows = data[selectedView].earth;
    const targetRows = data[selectedView].target;

    earthRows.forEach((row, idx) => {
      document.getElementById(`earth-key-${idx + 2}`).textContent = row.k;
      document.getElementById(`earth-val-${idx + 2}`).textContent = row.v;
    });

    targetRows.forEach((row, idx) => {
      document.getElementById(`target-key-${idx + 2}`).textContent = row.k;
      document.getElementById(`target-val-${idx + 2}`).textContent = row.v;
    });

    // Top Analog Match Gauge
    document.getElementById('analog-match-percent').textContent = data.matchPercent;
    document.getElementById('gauge-arc').style.strokeDashoffset = data.gaugeOffset;
    document.getElementById('analog-sample-caption').textContent = data.sampleCaption;
  }

  [cardMoon, cardMars].forEach((card) => {
    card.addEventListener('click', () => {
      cardMoon.classList.remove('selected');
      cardMars.classList.remove('selected');
      card.classList.add('selected');

      selectedTarget = card.dataset.target;
      updateComparisonUI();
    });
  });

  viewPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      viewPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      selectedView = pill.dataset.view;
      updateComparisonUI();
    });
  });

  /* =========================================================
     4. INTERACTIVE STEPPER & PREV / NEXT BUTTONS
     ========================================================= */
  const stepNames = {
    1: 'Setup',
    2: 'Analog Finder',
    3: 'Details',
    4: 'Analysis',
    5: 'Reports'
  };

  let currentStep = 2;
  const totalSteps = 5;

  const topTabs = document.querySelectorAll('.nav-tab');
  const stepItems = document.querySelectorAll('.step-item');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const heroStepPill = document.getElementById('hero-step-pill');
  const missionPhaseVal = document.getElementById('mission-phase-val');

  function setStep(step) {
    currentStep = Math.max(1, Math.min(totalSteps, step));

    // Sync top navigation tabs
    topTabs.forEach((tab) => {
      tab.classList.toggle('active', Number(tab.dataset.step) === currentStep);
    });

    // Sync bottom stepper bar
    stepItems.forEach((item) => {
      item.classList.toggle('active', Number(item.dataset.step) === currentStep);
    });

    // Update hero badge & left mission phase
    const formattedStep = String(currentStep).padStart(2, '0');
    heroStepPill.textContent = `Step ${formattedStep} · ${stepNames[currentStep]}`;
    missionPhaseVal.textContent = stepNames[currentStep];

    // Disable Prev on Step 1 and Next on Step 5
    btnPrev.disabled = currentStep === 1;
    btnNext.disabled = currentStep === totalSteps;
  }

  btnPrev.addEventListener('click', () => setStep(currentStep - 1));
  btnNext.addEventListener('click', () => setStep(currentStep + 1));

  topTabs.forEach((tab) => {
    tab.addEventListener('click', () => setStep(Number(tab.dataset.step)));
  });

  stepItems.forEach((item) => {
    item.addEventListener('click', () => setStep(Number(item.dataset.step)));
  });

  // Generate Report button feedback
  const reportBtn = document.getElementById('generate-report-btn');
  reportBtn.addEventListener('click', () => {
    const originalText = reportBtn.textContent;
    reportBtn.textContent = 'Generating...';
    setTimeout(() => {
      setStep(5);
      reportBtn.textContent = originalText;
    }, 600);
  });

  // Initialize default state
  setStep(2);
  updateComparisonUI();
});
document.addEventListener('DOMContentLoaded', () => {
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  if (btnPrev) {
    // Remove existing listeners by cloning and replacing, or override onclick
    btnPrev.replaceWith(btnPrev.cloneNode(true));
    document.getElementById('btn-prev').addEventListener('click', () => {
      window.location.href = 'main.html';
    });
  }

  if (btnNext) {
    btnNext.replaceWith(btnNext.cloneNode(true));
    document.getElementById('btn-next').addEventListener('click', () => {
      window.location.href = 'main2.html';
    });
  }
});