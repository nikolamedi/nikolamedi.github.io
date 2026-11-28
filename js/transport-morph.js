// Transport morph loop: one line drawing that turns into 18 transport modes.
(() => {
// ---- Settings -------------------------------------------------------------
const HOLD = 500;    // ms each mode is shown
const MORPH = 600;   // ms for each transformation (18 modes x 1.1 s = 19.8 s loop)
const SPEED = 70;    // constant travel speed (units per second)
const N = 140;       // sample points per stroke

const circle = (cx, cy, r) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
const GROUND = 'M15 132 H225';
const WAVES  = 'M15 127 q13 -10 26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0';
const CLOUDS = 'M15 140 q10 -12 22 -4 q8 -12 22 -2 q12 -8 20 4 q14 -10 26 0 q10 -12 24 -2 q10 -10 22 2 q12 -10 24 0 q10 -10 22 0 q10 -8 20 2';

// Every mode is drawn with the same twelve strokes, so stroke i always morphs into stroke i:
//   c: three circles (wheels, heads, portholes ...)
//   l: up to eight lines (repeated to fill eight if fewer are given)
//   g: the ground / water / cable / clouds, which scrolls past
// All modes face right.
const modes = [
  { name: 'Walking',
    c: [circle(124, 38, 11), circle(124, 38, 11), circle(124, 38, 11)],
    l: ['M122 52 L116 90',                 // torso
        'M122 58 L140 74 L151 67',         // front arm
        'M116 90 L134 108 L137 130',       // front leg
        'M122 58 L105 72 L99 87',          // back arm
        'M116 90 L107 110 L92 128'],       // back leg
    g: GROUND },
  { name: 'Wheelchair',
    c: [circle(104, 104, 26), circle(160, 123, 7), circle(118, 30, 10)],
    l: ['M115 44 L107 84',                 // torso
        'M114 52 L124 72 L138 77',         // arm to the push rim
        'M107 84 H146 L152 114 H164',      // leg
        'M88 50 H99 L101 90',              // backrest and handle
        'M101 90 H146 L160 123',           // seat frame to castor
        'M148 119 H167',                   // footplate
        'M101 90 L104 104'],               // strut to axle
    g: GROUND },
  { name: 'Kick-scooter',
    c: [circle(80, 120, 10), circle(165, 120, 10), circle(123, 27, 10)],
    l: ['M120 41 L112 74',                 // torso
        'M120 45 L137 61 L151 56',         // arm
        'M112 74 L121 94 L115 112 H127',   // standing leg
        'M80 120 L96 112 H163',            // deck
        'M165 120 L152 56',                // stem
        'M145 56 H159',                    // handlebar
        'M67 112 Q78 101 92 110',          // rear fender
        'M112 74 L105 95 L94 109'],        // kicking leg
    g: GROUND },
  { name: 'Cycling',
    c: [circle(70, 105, 25), circle(170, 105, 25), circle(141, 12, 10)],
    l: ['M100 52 L132 25',                 // torso
        'M131 27 L143 43 L160 46',         // arm
        'M100 52 L128 74 L120 112 H131',   // leg
        'M100 55 L100 62 L70 105 L115 105 L100 62',
        'M115 105 L152 62 L100 62',
        'M170 105 L152 62 L148 50 L162 46',
        'M90 55 H110'],
    g: GROUND },
  { name: 'Motorcycle',
    c: [circle(66, 108, 22), circle(178, 108, 22), circle(123, 25, 10)],
    l: ['M96 72 L116 39',                  // torso
        'M115 43 L130 58 L145 58',         // arm
        'M96 74 L124 84 L116 104 H127',    // leg
        'M70 74 H112 Q124 60 146 64 L153 74',
        'M70 74 L88 90 H141 L153 74',
        'M178 108 L155 66 L143 58',
        'M100 90 L104 108 H130 L138 90',
        'M66 108 H104'],
    g: GROUND },
  { name: 'Rickshaw',
    c: [circle(80, 119, 11), circle(178, 119, 11), circle(80, 119, 11)],
    l: ['M48 108 V58 Q48 44 62 44 H142 L166 78 H186 Q194 80 194 92 V108 Z',
        'M92 108 V62 H138 L152 84 V108',
        'M58 58 H80 V80 H58 Z',
        'M186 91 H194',
        'M102 108 V88 H122',
        'M40 44 H150'],
    g: GROUND },
  { name: 'Electric car',
    c: [circle(72, 117, 12), circle(170, 117, 12), circle(72, 117, 12)],
    l: ['M30 104 V90 Q32 80 48 78 L70 56 Q76 50 90 50 H132 Q146 50 156 60 L174 78 Q204 82 210 96 V104 Z',
        'M78 60 H130 Q142 60 150 68 L160 78 H62 Z',   // windows
        'M112 60 V78',                                // pillar
        'M124 82 L112 94 H124 L114 104',              // lightning bolt
        'M202 92 H210',
        'M30 92 H38'],
    g: GROUND },
  { name: 'Bus',
    c: [circle(78, 118, 11), circle(166, 118, 11), circle(78, 118, 11)],
    l: ['M45 48 H195 Q205 48 205 58 V106 H35 V58 Q35 48 45 48 Z',
        'M48 60 H150 V80 H48 Z',
        'M82 60 V80',
        'M116 60 V80',
        'M162 60 H193 V80 H162 Z',
        'M35 90 H205',
        'M189 98 H197',
        'M43 98 H51'],
    g: GROUND },
  { name: 'Truck',
    c: [circle(60, 119, 11), circle(178, 119, 11), circle(86, 119, 11)],
    l: ['M24 38 H142 V106 H24 Z',                     // cargo box
        'M148 58 H182 L206 86 V106 H148 Z',           // cab
        'M158 66 H179 L193 83 H158 Z',                // cab window
        'M64 38 V106',
        'M103 38 V106',
        'M142 100 H148',
        'M206 100 H213',
        'M160 93 H168'],
    g: GROUND },
  { name: 'Tram',
    c: [circle(72, 122, 8), circle(168, 122, 8), circle(72, 122, 8)],
    l: ['M40 46 H200 L216 74 V112 H24 V74 Z',
        'M42 56 H198 L208 78 H32 Z',
        'M70 56 V78',
        'M170 56 V78',
        'M106 56 V112 H134 V56',
        'M24 96 H216',
        'M104 46 L124 37 L110 28',
        'M18 28 H222'],
    g: GROUND },
  { name: 'Rail',
    c: [circle(80, 121, 9), circle(160, 121, 9), circle(80, 121, 9)],
    l: ['M40 48 H170 Q202 50 214 86 V110 H28 V60 Q28 48 40 48 Z',
        'M43 60 H150 V80 H43 Z',
        'M78 60 V80',
        'M114 60 V80',
        'M162 60 H184 Q196 67 200 80 H162 Z',
        'M28 92 H214',
        'M95 48 L112 30 L129 48',
        'M18 30 H222'],
    g: GROUND },
  { name: 'Monorail',
    c: [circle(42, 91, 4), circle(198, 91, 4), circle(198, 91, 4)],
    l: ['M36 100 Q22 100 26 84 Q34 50 70 50 H170 Q206 50 214 84 Q218 100 204 100 Z',
        'M52 62 H188 Q198 70 202 80 H38 Q42 70 52 62 Z',
        'M78 62 V80',
        'M162 62 V80',
        'M106 62 V100 H134 V62',
        'M56 100 L62 113 H178 L184 100',              // skirt straddling the beam
        'M15 126 H225'],                              // underside of the beam
    g: 'M15 118 H225' },
  { name: 'Cable car',
    c: [circle(108, 28, 5), circle(132, 25, 5), circle(132, 25, 5)],
    l: ['M82 70 H158 Q166 70 166 78 V112 Q166 122 156 122 H84 Q74 122 74 112 V78 Q74 70 82 70 Z',
        'M82 80 H158 V100 H82 Z',
        'M120 80 V100',
        'M108 28 L120 44 L132 25',
        'M120 44 V70',
        'M74 109 H166'],
    g: 'M15 44 L225 20' },
  { name: 'Hot air balloon',
    c: [circle(114, 98, 4), circle(126, 98, 4), circle(126, 98, 4)],   // two passengers
    l: ['M120 -12 Q170 -12 170 38 Q170 66 136 88 H104 Q70 66 70 38 Q70 -12 120 -12 Z',
        'M120 -12 Q98 36 110 88',
        'M120 -12 Q142 36 130 88',
        'M108 104 H132 V120 H108 Z',                  // basket
        'M106 88 L110 104',
        'M134 88 L130 104'],
    g: CLOUDS },
  { name: 'Aeroplane',
    c: [circle(100, 73, 4), circle(122, 73, 4), circle(144, 73, 4)],
    l: ['M40 70 Q40 60 60 60 H165 Q195 62 208 78 Q195 88 165 88 H70 Q48 86 40 70 Z',
        'M48 62 L34 30 H52 L78 60',
        'M110 86 L84 122 H100 L146 86',
        'M176 66 Q186 68 192 74 H178 Z',
        'M40 72 L24 80 H58',
        'M118 60 L104 40 H116 L140 60'],
    g: CLOUDS },
  { name: 'Rocket',
    c: [circle(112, 75, 6), circle(142, 75, 9), circle(142, 75, 9)],
    l: ['M70 55 H140 Q185 58 206 75 Q185 92 140 95 H70 Q62 75 70 55 Z',
        'M98 55 L70 30 H58 L70 55',
        'M98 95 L70 120 H58 L70 95',
        'M66 62 Q44 66 22 75 Q44 84 66 88',
        'M66 69 Q52 72 42 75 Q52 78 66 81',
        'M162 58 Q170 75 162 92'],
    g: 'M15 143 Q120 118 225 143' },
  { name: 'Container ship',
    c: [circle(50, 106, 4), circle(196, 104, 4), circle(42, 43, 5)],   // portholes and radar
    l: ['M18 94 H222 L204 122 H30 Z',                 // hull
        'M70 94 V76 H190 V94',                        // lower containers
        'M70 76 V58 H160 V76',                        // upper containers
        'M100 58 V94',
        'M130 58 V94',
        'M160 76 V94',
        'M28 94 V50 H56 V94',                         // bridge
        'M34 62 H56'],
    g: WAVES },
  { name: 'Ferry',
    c: [circle(95, 100, 6), circle(140, 100, 6), circle(118, 100, 6)],
    l: ['M22 84 H218 L196 120 H48 Z',
        'M60 84 V62 H176 V84',
        'M74 73 H162',
        'M92 62 V46 H146 V62',
        'M108 46 V28 H126 V46',
        'M130 22 Q140 12 150 20 Q158 26 166 18'],
    g: WAVES },
];

// ---- Sample every stroke to N points --------------------------------------
const LINES = 8;
const strokesOf = m => [
  ...m.c,
  ...Array.from({ length: LINES }, (_, i) => m.l[i % m.l.length]),
  m.g,
];

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, parent, attrs = {}) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent.appendChild(e);
  return e;
};
const stage = document.getElementById('tm-stage');
const vehicle = document.getElementById('tm-vehicle');
const groundLayer = document.getElementById('tm-ground');

const probe = el('path', stage);
const sampled = modes.map(m => strokesOf(m).map(d => {
  probe.setAttribute('d', d);
  const len = probe.getTotalLength();
  const pts = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    const p = probe.getPointAtLength(len * i / (N - 1));
    pts[i * 2] = p.x; pts[i * 2 + 1] = p.y;
  }
  return pts;
}));
probe.remove();

const LAST = sampled[0].length - 1;   // ground stroke
const paths = sampled[0].map((_, i) =>
  el('path', i === LAST ? groundLayer : vehicle, { class: 'tm-stroke' }));
paths[LAST].setAttribute('stroke-dasharray', '44 12');

// ---- Animation loop -------------------------------------------------------
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const STEP = HOLD + MORPH;

function draw(a, b, t) {
  for (let s = 0; s < paths.length; s++) {
    const A = sampled[a][s], B = sampled[b][s];
    let d = '';
    for (let i = 0; i < N; i++) {
      const x = A[i * 2] + (B[i * 2] - A[i * 2]) * t;
      const y = A[i * 2 + 1] + (B[i * 2 + 1] - A[i * 2 + 1]) * t;
      d += (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
    }
    paths[s].setAttribute('d', d);
  }
}

// Respect "reduce motion": show the first mode as a still drawing
const still = window.matchMedia('(prefers-reduced-motion: reduce)');

// Only animate while the drawing is on screen
let visible = true, raf = null, start = null, pausedAt = 0;
function frame(now) {
  if (start === null) start = now - pausedAt;
  const elapsed = now - start;
  const a = Math.floor(elapsed / STEP) % modes.length;
  const local = elapsed % STEP;
  const raw = local < HOLD ? 0 : (local - HOLD) / MORPH;
  draw(a, (a + 1) % modes.length, ease(raw));

  // The ground scrolls past at one constant speed
  paths[LAST].setAttribute('stroke-dashoffset', (elapsed / 1000 * SPEED).toFixed(2));
  raf = requestAnimationFrame(frame);
}
function stop() {
  if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
  if (start !== null) { pausedAt = performance.now() - start; start = null; }
}
function update() {
  if (still.matches) { stop(); draw(0, 0, 0); return; }
  if (visible && !document.hidden) { if (raf === null) raf = requestAnimationFrame(frame); }
  else stop();
}
if ('IntersectionObserver' in window) {
  new IntersectionObserver(e => { visible = e[0].isIntersecting; update(); }).observe(stage);
}
document.addEventListener('visibilitychange', update);
if (still.addEventListener) still.addEventListener('change', update);
draw(0, 0, 0);
update();
})();
