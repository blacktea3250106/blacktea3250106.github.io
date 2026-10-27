const GH = 'https://github.com/blacktea3250106/';
const LINKEDIN = 'https://www.linkedin.com/in/haofuchang';
const PROMPT = 'C:\\Users\\haofu>';
const PORTRAIT = '/portrait.png';

const DATA = JSON.parse(document.getElementById('site-data').textContent);
const SKILLS = DATA.skills;
const NODES = [
  ...DATA.nodes,
  ...SKILLS.map(([id, label], i) => ({ id: 's-' + id, skill: id, kind: 'skill', sec: 'blue', lane: i, x: 1030, y: 92 + i * 56, code: 'S-' + String(i + 1).padStart(2, '0'), label })),
];

const ALIASES = { me: 'root', hao: 'root', lumi: 'lumi-ai-customer-service', dream: 'dream-journal', vocab: 'vocab-pipeline', workflow: 'agent-workflow', pet: 'pet-to-character', mai: 'maiagent', 'wisdome.ai': 'wisdome', games: 'arc-games', bots: 'arc-bots', web: 'arc-web', cv: 'arc-vision' };
const KIND_LABEL = { root: 'ENGINEER', hub: 'SECTION', item: 'NODE', arc: 'ARCHIVE', skill: 'SKILL' };
const SIZE = { root: [250, 76], hub: [150, 48], item: [320, 56], arc: [320, 56] };
const DELAY = { root: 0, hub: .25, item: .5, arc: .1, skill: .8 };
const SEC = s => ({ c: `var(--${s})`, ch: `var(--${s}-hi)`, cd: `var(--${s}-dim)` });

/* 8×8 pixel icons */
const ICONS = {
  case: ['..####..', '..#..#..', '########', '########', '###..###', '########', '########', '........'],
  chip: ['.#.##.#.', '########', '.#....#.', '##.##.##', '##.##.##', '.#....#.', '########', '.#.##.#.'],
  disk: ['#######.', '#.####.#', '#.####.#', '#......#', '########', '##....##', '##....##', '########'],
};
function pixelPath(rows, s, ox = 0, oy = 0) {
  let d = '';
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === '#') d += `M${ox + x * s} ${oy + y * s}h${s}v${s}h${-s}z`; }));
  return d;
}

/* ---------- avatar sprite (16×24), drawn from the portrait's palette ---------- */
const PAL = { O: '#1b1424', H: '#4b2e22', h: '#7a4b33', S: '#f3c9a1', s: '#d79c78', E: '#2a1a14', B: '#4f7bd6', b: '#38589f', l: '#7ea2ee', P: '#8a5a3c', p: '#6c4430', G: '#a7adb6', g: '#5d636c' };
const HEAD = {
  down: ['...O.OOOOO.O....', '..OHOHHHHHHOHO..', '.OHHHHHHHHHHHHO.', '.OHHhHHHHHhHHHO.', '.OHHHHHHHHHHHHO.', '.OHHHHHHHHSSHHO.', '.OHHSSSSSSSSHHO.', '.OHSSESSSSESSHO.', '.OSSSSSSSSSSSSO.', '..OSSSSssSSSSO..', '...OOsSSSSsOO...', '....OOSSSSOO....'],
  up:   ['...O.OOOOO.O....', '..OHOHHHHHHOHO..', '.OHHHHHHHHHHHHO.', '.OHHhHHHHHhHHHO.', '.OHHHHHHHHHHHHO.', '.OHHHHHHHHHHHHO.', '.OHHHHHHHHHHHHO.', '.OHHHHHHhHHHHHO.', '.OSHHHHHHHHHHSO.', '..OHHHHHHHHHHO..', '...OOHHHHHHOO...', '....OOSSSSOO....'],
  side: ['......OOOO......', '....OOHHHHOO....', '...OHHHHHHHHO...', '..OHHhHHHHHHHO..', '..OHHHHHHHHHHHO.', '..OHHHHHHSSSSO..', '..OHHHHHSSSSSO..', '..OHHHHSSSESSO..', '..OHHHSSSSSSSSO.', '...OHHSSSSsSO...', '....OOSSSSOO....', '.....OSSSSO.....'],
};
const BODY = {
  front: ['..OOBBBBBBBBOO..', '.OBBBBlBBlBBBBO.', '.OBBBBBBBBBBBBO.', '.ObBBBBBBBBBBbO.', '.ObBBBBBBBBBBbO.', '.OSbBBBBBBBBbSO.', '..OObBBBBBBbOO..'],
  side:  ['....OBBBBBBO....', '...OBBBBlBBBO...', '...OBBBBBBBBO...', '...ObBBBBBBBO...', '...ObBBBBBBBO...', '...ObBSSBBBbO...', '....OObbbbOO....'],
};
const LEGS = {
  front: [
    ['...OPPPPPPPPO...', '...OPPPPPPPPO...', '...OPPPOOPPPO...', '...OGGGOOGGGO...', '...OgggOOgggO...'],
    ['...OPPPPPPPPO...', '...OPPPOOPPPO...', '...OPPPOOGGGO...', '...OGGGOOgggO...', '...OgggO.OOO....'],
  ],
  side: [
    ['.....OPPPPO.....', '.....OPPPPO.....', '.....OPPPPO.....', '.....OGGGGGO....', '.....OgggggO....'],
    ['....OPPPPPPO....', '...OPPPOOPPPO...', '..OPPPO..OPPPO..', '.OGGGO....OGGGGO', '.OgggO....OggggO'],
  ],
};
const mirror = rows => rows.map(r => [...r].reverse().join(''));
function spriteURL(rows) {
  const c = document.createElement('canvas'); c.width = 16; c.height = 24;
  const g = c.getContext('2d');
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (PAL[ch]) { g.fillStyle = PAL[ch]; g.fillRect(x, y, 1, 1); } }));
  return c.toDataURL();
}
const FRAMES = {};
for (const dir of ['down', 'up', 'side']) {
  const body = dir === 'side' ? BODY.side : BODY.front;
  const legs = dir === 'side' ? LEGS.side : LEGS.front;
  const steps = dir === 'side' ? [legs[0], legs[1], legs[0], legs[1]] : [legs[0], legs[1], legs[0], mirror(legs[1])];
  FRAMES[dir] = steps.map(l => spriteURL([...HEAD[dir], ...body, ...l]));
}

const SVGNS = 'http://www.w3.org/2000/svg';
const $ = s => document.querySelector(s);
const board = $('#board'), edgeG = $('#edges'), nodeG = $('#nodes'), pulseG = $('#pulses'), actorG = $('#actor');
const stage = $('#stage'), panel = $('#panel'), panelBody = $('#panelBody'), log = $('#log'), input = $('#cmd');
const reader = $('#reader');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function sv(tag, attrs = {}) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'style') e.style.cssText = attrs[k];
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) e.append(c.nodeType ? c : String(c));
  return e;
}
const setSec = (el, sec) => { const v = SEC(sec); el.style.setProperty('--c', v.c); el.style.setProperty('--ch', v.ch); el.style.setProperty('--cd', v.cd); };

const byId = {};
NODES.forEach(n => { n.x0 = n.x; n.y0 = n.y; byId[n.id] = n; });
const EDGES = [];
NODES.forEach(n => {
  if (n.parent) EDGES.push({ from: n.parent, to: n.id, kind: 'tree' });
  (n.skills || []).forEach(k => EDGES.push({ from: n.id, to: 's-' + k, kind: 'skill' }));
});
const neighbors = id => EDGES.filter(e => e.from === id || e.to === id);

/* ---------- geometry: orthogonal wires ---------- */
function anchor(n, side) {
  if (n.kind === 'skill') return [n.x + (side === 'r' ? 9 : -9), n.y];
  const [w] = SIZE[n.kind];
  return [n.x + (side === 'r' ? w / 2 : -w / 2), n.y];
}
function wirePts(e) {
  const a = byId[e.from], b = byId[e.to];
  const [sx, sy] = anchor(a, 'r'), [tx, ty] = anchor(b, 'l');
  const mx = e.kind === 'skill' ? sx + 40 + b.lane * 9 : Math.round((sx + tx) / 2);
  return [[sx, sy], [mx, sy], [mx, ty], [tx, ty]];
}
const ptsD = pts => 'M' + pts.map(p => p.join(' ')).join(' L');

/* ---------- draw ---------- */
function drawEdges() {
  EDGES.forEach(e => {
    const attrs = { class: 'edge ' + e.kind };
    if (e.kind === 'tree') attrs.pathLength = 1;
    e.el = sv('path', attrs);
    setSec(e.el, e.kind === 'skill' ? 'blue' : byId[e.to].sec);
    edgeG.append(e.el);
  });
  updateEdges();
}
function updateEdges(onlyId) {
  EDGES.forEach(e => {
    if (onlyId && e.from !== onlyId && e.to !== onlyId) return;
    e.el.setAttribute('d', ptsD(wirePts(e)));
  });
}
function animateEdges(list) {
  if (reduceMotion) return;
  list.filter(e => e.kind === 'tree').forEach(e => {
    e.el.classList.remove('grow'); void e.el.getBBox(); e.el.classList.add('grow');
    e.el.style.setProperty('--d', Math.max(0, DELAY[byId[e.to].kind] - .15) + 's');
  });
}
const notch = (x, y, w, hh, n = 5) => `M${x + n} ${y}H${x + w - n}V${y + n}H${x + w}V${y + hh - n}H${x + w - n}V${y + hh}H${x + n}V${y + hh - n}H${x}V${y + n}H${x + n}Z`;
function txt(attrs, s) { const t = sv('text', attrs); t.textContent = s; return t; }
function drawNodes() {
  NODES.forEach(n => {
    const g = sv('g', { class: `node k-${n.kind}`, 'data-id': n.id, tabindex: 0, role: 'button', 'aria-label': n.title || n.label });
    setSec(g, n.sec);
    g.style.setProperty('--d', DELAY[n.kind] + 's');
    if (n.kind === 'skill') {
      const uses = neighbors(n.id).length;
      g.append(sv('path', { class: 'pin', d: notch(-8, -8, 16, 16, 3) }), sv('rect', { class: 'pin-dot', x: -3, y: -3, width: 6, height: 6 }));
      g.append(txt({ x: 18, y: -13, class: 'code' }, n.code));
      for (let i = 0; i < 6; i++) g.append(sv('rect', { class: 'pip' + (i < uses ? '' : ' empty'), x: 56 + i * 9, y: -22, width: 7, height: 7 }));
      g.append(txt({ x: 18, y: 7, class: 'lbl' }, n.label));
    } else {
      const [w, hh] = SIZE[n.kind], x = -w / 2, y = -hh / 2;
      g.append(sv('path', { class: 'shadow', d: notch(x + 6, y + 6, w, hh) }), sv('path', { class: 'box', d: notch(x, y, w, hh) }));
      if (n.kind === 'root') {
        g.append(sv('image', { href: PORTRAIT, x: x + 12, y: -24, width: 48, height: 48, class: 'face', style: 'image-rendering:pixelated' }));
        g.append(txt({ x: x + 72, y: -2, class: 'lbl' }, n.label), txt({ x: x + 72, y: 20, class: 'sub' }, n.sub));
      } else if (n.kind === 'hub') {
        g.append(sv('path', { class: 'icon', d: pixelPath(ICONS[n.icon], 2.5, x + 16, -10) }));
        g.append(txt({ x: x + 46, y: 7, class: 'lbl' }, n.label));
      } else {
        g.append(sv('path', { class: 'icon', d: pixelPath(ICONS[n.icon], 2.5, x + 14, -10) }));
        g.append(txt({ x: x + 46, y: n.sub ? -3 : 7, class: n.sub ? 'lbl has-sub' : 'lbl' }, n.label));
        if (n.sub) g.append(txt({ x: x + 46, y: 19, class: 'sub' }, n.sub));
      }
    }
    n.el = g;
    placeNode(n);
    nodeG.append(g);
    g.addEventListener('pointerenter', () => neighbors(n.id).forEach(e => e.el.classList.add('hov')));
    g.addEventListener('pointerleave', () => neighbors(n.id).forEach(e => e.el.classList.remove('hov')));
    g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(n.id, true); } });
  });
}
function placeNode(n) { n.el.setAttribute('transform', `translate(${n.x} ${n.y})`); }

const state = { archive: false, sel: 'root', focus: null, view: 'map' };
function applyVisibility() {
  NODES.forEach(n => { n.off = !!n.hidden && !state.archive; n.el.classList.toggle('off', n.off); });
  EDGES.forEach(e => { e.off = byId[e.from].off || byId[e.to].off; e.el.classList.toggle('off', e.off); });
}

/* ---------- view: pan / zoom ---------- */
const view = { x: 0, y: 0, s: 1 };
function applyView() {
  const W = board.clientWidth, H = board.clientHeight;
  board.setAttribute('viewBox', `${view.x} ${view.y} ${W / view.s} ${H / view.s}`);
  $('#scale').textContent = '1 : ' + view.s.toFixed(2);
  board.classList.toggle('lod-low', view.s < 0.7);   // below this, sub-lines would render too small to read
}
function bounds(ids) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  ids.map(id => byId[id]).filter(n => !n.off).forEach(n => {
    let a, b, c, d;
    if (n.kind === 'skill') { a = n.x - 12; b = n.y - 30; c = n.x + 28 + Math.max(n.label.length * 10.5, 120); d = n.y + 14; }
    else { const [w, hh] = SIZE[n.kind]; a = n.x - w / 2 - 8; b = n.y - hh / 2 - 8; c = n.x + w / 2 + 12; d = n.y + hh / 2 + 12; }
    x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d);
  });
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
function freeArea() {
  const W = board.clientWidth, H = board.clientHeight;
  let w = W, hh = H;
  if (W > 760) w = panel.classList.contains('collapsed') ? W : W - panel.offsetWidth - 48;
  else hh = Math.max(160, panel.offsetTop - 12);
  return { left: 0, top: 0, w, h: hh };
}
function fitTarget(ids = NODES.map(n => n.id), pad = 30) {
  const b = bounds(ids), A = freeArea();
  const s = Math.min((A.w - pad * 2) / b.w, (A.h - pad * 2) / b.h, 1.35);
  return { s, x: b.x - (A.left + (A.w - b.w * s) / 2) / s, y: b.y - (A.top + (A.h - b.h * s) / 2) / s };
}
let viewAnim = 0;
function animateView(t, ms = 450) {
  cancelAnimationFrame(viewAnim);
  if (reduceMotion) { Object.assign(view, t); applyView(); return; }
  const from = { ...view }, t0 = performance.now();
  const step = now => {
    const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
    view.x = from.x + (t.x - from.x) * e; view.y = from.y + (t.y - from.y) * e; view.s = from.s + (t.s - from.s) * e;
    applyView();
    if (k < 1) viewAnim = requestAnimationFrame(step);
  };
  viewAnim = requestAnimationFrame(step);
}
const fit = (anim = true) => anim ? animateView(fitTarget()) : (Object.assign(view, fitTarget()), applyView());
function zoomAt(f, sx, sy) {
  const ns = Math.min(3, Math.max(0.2, view.s * f));
  const wx = view.x + sx / view.s, wy = view.y + sy / view.s;
  view.s = ns; view.x = wx - sx / ns; view.y = wy - sy / ns; applyView();
}
function ensureVisible(n) {
  const A = freeArea(), sx = (n.x - view.x) * view.s, sy = (n.y - view.y) * view.s, m = 150;
  if (sx > A.left + m && sx < A.left + A.w - m && sy > A.top + 70 && sy < A.top + A.h - 70) return;
  animateView({ s: view.s, x: n.x - (A.left + A.w / 2) / view.s, y: n.y - (A.top + A.h / 2) / view.s });
}

/* ---------- avatar: walks the wires ---------- */
const actor = { at: 'root', x: 0, y: 0, dir: 'down', flip: false, frame: 0, walk: null, img: null, bang: null };
function station(n, side = 'l') {
  const [ax, ay] = anchor(n, side);
  return [ax + (side === 'l' ? -22 : 22), ay];
}
function drawActor() {
  actorG.append(sv('rect', { class: 'feet', x: -12, y: -3, width: 24, height: 5 }));
  actor.img = sv('image', { width: 32, height: 48, x: -16, y: -47 });
  actor.bang = txt({ x: -5, y: -54, class: 'bang', opacity: 0 }, '!');
  actorG.append(actor.img, actor.bang);
  [actor.x, actor.y] = station(byId.root, 'r');
  renderActor();
}
function renderActor() {
  const set = FRAMES[actor.dir];
  actor.img.setAttribute('href', set[actor.frame % set.length]);
  actor.img.setAttribute('transform', actor.flip ? 'scale(-1 1)' : '');
  actorG.setAttribute('transform', `translate(${actor.x} ${actor.y})`);
}
function route(fromId, toId) {
  const prev = { [fromId]: null }, q = [fromId];
  while (q.length) {
    const cur = q.shift();
    if (cur === toId) break;
    for (const e of EDGES) {
      if (e.off || (e.kind === 'skill' && e.to !== toId && e.to !== fromId)) continue;   // walk visible wires; skill wires only at the ends
      const nxt = e.from === cur ? e.to : e.to === cur ? e.from : null;
      if (nxt && !(nxt in prev)) { prev[nxt] = { id: cur, e }; q.push(nxt); }
    }
  }
  if (!(toId in prev)) return null;
  const hops = [];
  for (let id = toId; prev[id]; id = prev[id].id) hops.unshift({ e: prev[id].e, to: id });
  return hops;
}
function walkTo(id) {
  const target = byId[id];
  if (!target || id === actor.at) return;
  const hops = route(actor.at, id);
  if (!hops) return;
  const pts = [[actor.x, actor.y]];
  hops.forEach(({ e, to }) => {
    const wp = wirePts(e), forward = e.to === to;
    const seq = forward ? wp : wp.slice().reverse();
    pts.push(...seq);
  });
  const last = hops[hops.length - 1], forward = last.e.to === last.to;
  pts[pts.length - 1] = station(target, forward ? 'l' : 'r');
  const segs = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], len = Math.hypot(bx - ax, by - ay);
    if (len < .5) continue;
    segs.push({ ax, ay, bx, by, len, t0: total }); total += len;
  }
  actor.at = id;
  if (reduceMotion || !segs.length) { [actor.x, actor.y] = pts[pts.length - 1]; actor.dir = 'down'; actor.frame = 0; renderActor(); arrive(); return; }
  actor.walk = { segs, total, speed: Math.max(420, total / 1.6), t0: performance.now() };
}
function stepActor(now) {
  const w = actor.walk;
  if (!w) {   // idle: face the viewer, breathe every so often
    actor.dir = 'down'; actor.flip = false; actor.frame = 0;
    actor.img.setAttribute('y', (Math.floor(now / 700) % 2) ? -46 : -47);
    renderActor(); return;
  }
  const d = Math.min(w.total, (now - w.t0) / 1000 * w.speed);
  const s = w.segs.find(sg => d <= sg.t0 + sg.len) || w.segs[w.segs.length - 1];
  const k = Math.min(1, (d - s.t0) / s.len);
  actor.x = s.ax + (s.bx - s.ax) * k; actor.y = s.ay + (s.by - s.ay) * k;
  const dx = s.bx - s.ax, dy = s.by - s.ay;
  if (Math.abs(dx) > Math.abs(dy)) { actor.dir = 'side'; actor.flip = dx < 0; } else { actor.dir = dy < 0 ? 'up' : 'down'; actor.flip = false; }
  actor.frame = Math.floor(d / 14) % 4;
  actor.img.setAttribute('y', -47);
  renderActor();
  if (d >= w.total) { actor.walk = null; arrive(); }
}
function arrive() {
  if (reduceMotion) return;
  actor.bang.setAttribute('opacity', 1);
  setTimeout(() => actor.bang.setAttribute('opacity', 0), 700);
}
function nudge(dx, dy) {
  const cur = byId[actor.at];
  const cand = new Set(neighbors(cur.id).map(e => e.from === cur.id ? e.to : e.from));
  NODES.forEach(n => { if (n.parent && n.parent === cur.parent && n.id !== cur.id) cand.add(n.id); });
  let best = null, bestScore = Infinity;
  cand.forEach(id => {
    const n = byId[id]; if (n.off) return;
    const vx = n.x - cur.x, vy = n.y - cur.y, dist = Math.hypot(vx, vy);
    const along = (vx * dx + vy * dy) / dist;
    if (along < 0.35) return;
    const score = dist * (2 - along);
    if (score < bestScore) { bestScore = score; best = id; }
  });
  if (best) go(best);
}

/* ---------- pointer: drag nodes, pan, pinch ---------- */
const pts = new Map();
let drag = null, pinch = null;
const local = ev => { const r = board.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
board.addEventListener('pointerdown', ev => {
  const g = ev.target.closest('.node');
  board.setPointerCapture(ev.pointerId);
  pts.set(ev.pointerId, local(ev));
  if (pts.size === 2) {
    const [a, b] = [...pts.values()];
    pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: view.s }; drag = null; return;
  }
  const [sx, sy] = local(ev);
  drag = g ? { node: byId[g.dataset.id], sx, sy, nx: byId[g.dataset.id].x, ny: byId[g.dataset.id].y, moved: false }
           : { pan: true, sx, sy, vx: view.x, vy: view.y, moved: false };
});
board.addEventListener('pointermove', ev => {
  const [sx, sy] = local(ev);
  $('#coords').textContent = `X ${String(Math.round(view.x + sx / view.s)).padStart(4, '0')} Y ${String(Math.round(view.y + sy / view.s)).padStart(4, '0')}`;
  if (!pts.has(ev.pointerId)) return;
  pts.set(ev.pointerId, [sx, sy]);
  if (pinch && pts.size === 2) {
    const [a, b] = [...pts.values()];
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    zoomAt((pinch.s * d / pinch.d) / view.s, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); return;
  }
  if (!drag) return;
  const dx = sx - drag.sx, dy = sy - drag.sy;
  if (!drag.moved && Math.hypot(dx, dy) < 4) return;
  if (!drag.moved) cancelAnimationFrame(viewAnim);
  drag.moved = true;
  if (drag.pan) { board.classList.add('panning'); view.x = drag.vx - dx / view.s; view.y = drag.vy - dy / view.s; applyView(); }
  else {
    const n = drag.node; n.x = drag.nx + dx / view.s; n.y = drag.ny + dy / view.s; placeNode(n); updateEdges(n.id);
    if (actor.at === n.id && !actor.walk) { [actor.x, actor.y] = station(n, n.kind === 'root' ? 'r' : 'l'); renderActor(); }
  }
});
function endPointer(ev) {
  if (!pts.has(ev.pointerId)) return;
  pts.delete(ev.pointerId);
  if (pinch) { if (pts.size < 2) pinch = null; drag = null; return; }
  if (drag && !drag.moved) {
    if (drag.node) go(drag.node.id, true);
    else if (state.focus) select('root', true);
  }
  board.classList.remove('panning');
  drag = null;
}
board.addEventListener('pointerup', endPointer);
board.addEventListener('pointercancel', endPointer);
board.addEventListener('wheel', ev => {
  ev.preventDefault(); cancelAnimationFrame(viewAnim);
  const [sx, sy] = local(ev);
  zoomAt(Math.exp(-ev.deltaY * 0.0015), sx, sy);
}, { passive: false });
$('#zin').onclick = () => { const A = freeArea(); zoomAt(1.25, A.left + A.w / 2, A.top + A.h / 2); };
$('#zout').onclick = () => { const A = freeArea(); zoomAt(0.8, A.left + A.w / 2, A.top + A.h / 2); };
$('#zfit').onclick = () => fit();

/* ---------- selection + dialog ---------- */
function go(id, fromBoard) { select(id, fromBoard); walkTo(id); }
function select(id, fromBoard) {
  const n = byId[id];
  if (!n) return;
  if (n.off) { state.archive = true; applyVisibility(); animateEdges(EDGES.filter(e => !e.off && byId[e.to].hidden)); }
  state.sel = id;
  state.focus = id === 'root' ? null : id;
  const lit = new Set([id]);
  NODES.forEach(m => m.el.classList.toggle('sel', m.id === id));
  EDGES.forEach(e => {
    const on = !!state.focus && (e.from === id || e.to === id);
    e.el.classList.toggle('lit', on);
    if (on) { lit.add(e.from); lit.add(e.to); }
  });
  NODES.forEach(m => m.el.classList.toggle('lit', lit.has(m.id)));
  board.classList.toggle('focusing', !!state.focus);
  renderPanel(n);
  if (!fromBoard) ensureVisible(n);
  if (state.view === 'read') readerSync(n);
}
function cmdButton(label, cmd, cls = 'chip') { return h('button', { type: 'button', class: cls, onclick: () => run(cmd) }, label); }
const usesOf = id => neighbors('s-' + id).length;
function statBars(compact) {
  return h('div', { class: 'stats' }, SKILLS.map(([id, label]) => {
    const u = usesOf(id);
    return [h('button', { type: 'button', onclick: () => run('filter ' + id) }, label),
      h('span', { class: 'bar', 'aria-hidden': 'true' }, Array.from({ length: 6 }, (_, i) => h('i', { class: i < u ? 'on' : '' }))),
      h('span', { class: 'n' }, compact ? u : `${u} node${u === 1 ? '' : 's'}`)];
  }));
}
function renderPanel(n) {
  setSec(panel, n.sec);
  $('#eyebrow').textContent = `${n.code} · ${KIND_LABEL[n.kind]}`;
  const parts = [];
  if (n.kind === 'skill') {
    const users = neighbors(n.id).map(e => byId[e.from]);
    parts.push(h('h2', {}, n.label));
    parts.push(h('div', { class: 'meta' }, `EVIDENCE ${users.length} / 6`));
    parts.push(h('p', {}, 'The lit nodes on the map are where this skill was used. Open one to see the evidence.'));
    parts.push(h('div', {}, h('div', { class: 'label' }, 'WHERE'), h('div', { class: 'chips' }, users.map(u => cmdButton(u.title || u.label, 'open ' + u.id)))));
    parts.push(h('div', {}, cmdButton('clear filter', 'filter off')));
  } else {
    parts.push(h('h2', {}, n.title));
    if (n.meta) parts.push(h('div', { class: 'meta' }, n.meta));
    if (n.text) parts.push(h('p', {}, n.text));
    if (n.bullets) parts.push(h('ul', {}, n.bullets.map(b => h('li', {}, b))));
    if (n.stack) parts.push(h('div', {}, h('div', { class: 'label' }, 'STACK'), h('div', { class: 'chips' }, n.stack.map(s => h('span', { class: 'chip' }, s)))));
    if (n.skills) parts.push(h('div', {}, h('div', { class: 'label' }, 'SKILLS · click to trace'), h('div', { class: 'chips' }, n.skills.map(k => cmdButton(byId['s-' + k].label, 'filter ' + k)))));
    if (n.kind === 'hub') {
      const kids = NODES.filter(m => m.parent === n.id);
      parts.push(h('div', {}, h('div', { class: 'label' }, 'CONTAINS'), h('div', { class: 'chips' }, kids.map(k => cmdButton(k.label, 'open ' + k.id)))));
      if (n.id === 'archive') parts.push(h('div', {}, cmdButton(state.archive ? 'fold archive' : 'unfold archive', 'archive')));
    }
    const links = (n.links || []).slice();
    if (n.repo) links.unshift(['source on GitHub', GH + n.id]);
    if (links.length) parts.push(h('div', {}, h('div', { class: 'label' }, n.repo ? 'SOURCE' : 'LINKS'), h('div', { class: 'chips' }, links.map(([t, href]) => h('a', { class: 'chip', href, target: '_blank', rel: 'noopener' }, t + ' ↗')))));
    if (n.kind === 'root') parts.push(h('div', {}, h('div', { class: 'label' }, 'STATUS · evidence per skill'), statBars(true)));
    if (n.contact) parts.push(contactBlock());
  }
  panelBody.replaceChildren(...parts);
  panelBody.scrollTop = 0;
}
function contactBlock() {
  return h('div', {}, h('div', { class: 'label' }, 'CONTACT'),
    h('div', { class: 'links' },
      h('a', { href: LINKEDIN, target: '_blank', rel: 'noopener' }, 'linkedin.com/in/haofuchang ↗'),
      h('a', { href: 'https://github.com/blacktea3250106', target: '_blank', rel: 'noopener' }, 'github.com/blacktea3250106 ↗')));
}
$('#collapse').addEventListener('click', () => {
  const c = panel.classList.toggle('collapsed');
  $('#collapse').textContent = c ? '[ show ]' : '[ hide ]';
  $('#collapse').setAttribute('aria-expanded', String(!c));
});

/* ---------- read mode ---------- */
function readerFilter(skill) {
  const bar = $('#rFilter');
  reader.classList.toggle('filtering', !!skill);
  let first = null, count = 0;
  reader.querySelectorAll('.r-entry').forEach(e => {
    const hit = !!skill && e.dataset.skills.split(' ').includes(skill);
    e.classList.toggle('hit', hit);
    if (hit) { count++; first = first || e; }
  });
  bar.hidden = !skill;
  if (skill) bar.replaceChildren(h('span', {}, `FILTER ${byId['s-' + skill].label} · ${count} matches`), cmdButton('clear', 'filter off'));
  return first;
}
function readerSync(n) {
  const behavior = reduceMotion ? 'auto' : 'smooth';
  if (n.kind === 'skill') { const first = readerFilter(n.skill); if (first) first.scrollIntoView({ behavior, block: 'center' }); return; }
  readerFilter(null);
  const el = n.id === 'root' ? null : $('#r-' + n.id);
  if (!el) { reader.scrollTo({ top: 0, behavior }); return; }
  el.scrollIntoView({ behavior, block: 'start' });
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
}
function setMode(v, save = true) {
  state.view = v;
  reader.hidden = v !== 'read';
  document.documentElement.dataset.view = v;
  document.querySelectorAll('.views button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
  if (v === 'map') fit(false); else readerSync(byId[state.sel]);
  if (save) try { localStorage.setItem('bp-view', v); } catch {}
}
document.querySelector('.views').addEventListener('click', ev => { const b = ev.target.closest('button[data-view]'); if (b) setMode(b.dataset.view); });

/* ---------- console ---------- */
function say(...parts) {
  const line = h('div', { class: 'ln' });
  parts.forEach(p => {
    if (typeof p === 'string') line.append(p);
    else if (p.cmd) line.append(h('button', { type: 'button', class: 'lnk', onclick: () => run(p.cmd) }, p.t));
    else if (p.href) line.append(h('a', { href: p.href, target: '_blank', rel: 'noopener' }, p.t));
    else line.append(h('span', { class: p.c || '' }, p.t));
  });
  log.append(line);
  log.scrollTop = log.scrollHeight;
}
function resolve(name) {
  if (!name) return null;
  name = name.toLowerCase().replace(/^[\\/]+|[\\/]+$/g, '');
  if (ALIASES[name]) return ALIASES[name];
  if (byId[name]) return name;
  if (byId['s-' + name]) return 's-' + name;
  const pool = [...NODES.map(n => n.id), ...Object.keys(ALIASES)];
  const hits = [...new Set(pool.filter(k => k.replace(/^s-/, '').startsWith(name)).map(k => ALIASES[k] || k))];
  return hits.length === 1 ? hits[0] : null;
}
const COMMANDS = ['help', 'read', 'map', 'whoami', 'dir', 'ls', 'open', 'skills', 'filter', 'archive', 'fit', 'reset', 'contact', 'cls', 'clear'];
const hist = []; let hIdx = 0;

function toggleArchive(force) {
  state.archive = force ?? !state.archive;
  if (!state.archive && byId[state.sel].hidden) select('archive', true);
  if (!state.archive && byId[actor.at].hidden) { actor.walk = null; actor.at = 'archive'; [actor.x, actor.y] = station(byId.archive); renderActor(); }
  applyVisibility();
  if (state.archive) animateEdges(EDGES.filter(e => !e.off && (byId[e.to].hidden || byId[e.from].hidden)));
  if (state.sel === 'archive') renderPanel(byId.archive);
  fit();
}

function run(raw, echo = true) {
  const line = raw.trim();
  if (!line) return;
  if (echo) say({ c: 'echo', t: PROMPT + line });
  hist.push(line); hIdx = hist.length;
  const [cmd, ...args] = line.split(/\s+/);
  const arg = args.join(' ');
  switch (cmd.toLowerCase()) {
    case 'help':
      say({ cmd: 'read', t: 'read' }, ' / ', { cmd: 'map', t: 'map' }, { c: 'dim', t: '       plain reading view / back to the map' });
      say({ cmd: 'whoami', t: 'whoami' }, { c: 'dim', t: '           who this is' });
      say({ cmd: 'dir', t: 'dir' }, { c: 'dim', t: '              everything on the map (ls works too)' });
      say({ cmd: 'open lumi', t: 'open <name>' }, { c: 'dim', t: '      walk to a node and open it (cd works too)' });
      say({ cmd: 'skills', t: 'skills' }, ' · ', { cmd: 'filter eval', t: 'filter <skill>' }, { c: 'dim', t: '  where each skill was used · filter off' });
      say({ cmd: 'archive', t: 'archive' }, { c: 'dim', t: '          unfold or fold 2018–2024 work' });
      say({ cmd: 'fit', t: 'fit' }, ' · ', { cmd: 'reset', t: 'reset' }, ' · ', { cmd: 'cls', t: 'cls' }, { c: 'dim', t: '   refit · put nodes back · clear screen' });
      say({ c: 'dim', t: 'On the map: click a node to walk there, or use ←↑→↓ / WASD.' });
      break;
    case 'whoami':
      go('root');
      say({ c: 'hi', t: 'Hao-Fu Chang' }, ' — AI Product Engineer. 2.5 years building backends for enterprise AI and LLM products. Taichung, Taiwan · open to remote and relocation.');
      break;
    case 'dir': case 'ls': {
      ['work', 'build', 'archive'].forEach(hub => {
        const kids = NODES.filter(n => n.parent === hub && !n.off);
        const parts = [{ c: 'hi', t: `<DIR> ${hub.padEnd(8)}` }];
        if (!kids.length) parts.push({ c: 'dim', t: '(folded) ' }, { cmd: 'archive', t: 'unfold' });
        kids.forEach((k, i) => { if (i) parts.push('  '); parts.push({ cmd: 'open ' + k.id, t: k.label }); });
        say(...parts);
      });
      break;
    }
    case 'open': case 'cd': case 'type': case 'cat': case 'start': {
      if (!arg) { say({ c: 'err', t: 'open needs a name. ' }, 'Try ', { cmd: 'open lumi', t: 'open lumi' }); break; }
      const id = resolve(arg);
      if (!id) { say({ c: 'err', t: `The system cannot find "${arg}". ` }, 'Run ', { cmd: 'dir', t: 'dir' }, ' to see names.'); break; }
      go(id);
      const n = byId[id];
      say({ c: 'ok', t: '→ ' }, n.title || n.label, n.repo ? { c: 'dim', t: '  · ' } : '', n.repo ? { href: GH + n.id, t: 'source ↗' } : '');
      break;
    }
    case 'skills':
      SKILLS.forEach(([id, label]) => { const u = usesOf(id); say({ cmd: 'filter ' + id, t: id.padEnd(12) }, { c: 'ok', t: '■'.repeat(u) }, { c: 'dim', t: '□'.repeat(6 - u) + `  ${label}` }); });
      break;
    case 'filter': case 'find': case 'grep': {
      if (!arg || /^(off|none|clear)$/i.test(arg)) { select('root'); say({ c: 'dim', t: 'filter cleared' }); break; }
      const id = resolve(arg);
      if (!id || !id.startsWith('s-')) { say({ c: 'err', t: `unknown skill "${arg}". ` }, 'Run ', { cmd: 'skills', t: 'skills' }, '.'); break; }
      const users = neighbors(id).map(e => byId[e.from]);
      if (users.some(u => u.hidden) && !state.archive) toggleArchive(true);
      go(id);
      const parts = [{ c: 'hi', t: byId[id].label }, `: ${users.length} nodes — `];
      users.forEach((u, i) => { if (i) parts.push(', '); parts.push({ cmd: 'open ' + u.id, t: u.title || u.label }); });
      say(...parts);
      break;
    }
    case 'archive': case 'timeline':
      toggleArchive();
      say({ c: 'dim', t: state.archive ? 'archive unfolded: 2018–2024, 4 groups' : 'archive folded' });
      break;
    case 'read': setMode('read'); say({ c: 'dim', t: 'read mode · type map to return' }); break;
    case 'map': case 'blueprint': setMode('map'); break;
    case 'fit': if (state.view !== 'map') setMode('map'); fit(); break;
    case 'reset':
      NODES.forEach(n => { n.x = n.x0; n.y = n.y0; placeNode(n); });
      updateEdges(); actor.walk = null; [actor.x, actor.y] = station(byId[actor.at], actor.at === 'root' ? 'r' : 'l'); renderActor();
      fit(); say({ c: 'dim', t: 'layout reset' });
      break;
    case 'contact': case 'email': case 'hire':
      go('root');
      say({ href: LINKEDIN, t: 'LinkedIn ↗' }, '  ·  ', { href: 'https://github.com/blacktea3250106', t: 'GitHub ↗' });
      break;
    case 'sudo': case 'runas':
      if (/hire/i.test(arg)) { say({ c: 'ok', t: 'Access granted.' }, ' Opening a line:'); run('contact', false); }
      else say({ c: 'err', t: 'You already have admin rights here. Try ' }, { cmd: 'sudo hire hao', t: 'sudo hire hao' });
      break;
    case 'rm': case 'del': case 'format': say({ c: 'err', t: 'Access is denied. This map is read-only.' }); break;
    case 'cls': case 'clear': log.replaceChildren(); break;
    default:
      say({ c: 'err', t: `'${cmd}' is not recognized as an internal or external command. ` }, 'Type ', { cmd: 'help', t: 'help' }, '.');
  }
}

$('#cmdform').addEventListener('submit', ev => { ev.preventDefault(); const v = input.value; input.value = ''; run(v); });
input.addEventListener('keydown', ev => {
  if (ev.key === 'ArrowUp') { ev.preventDefault(); if (hIdx > 0) input.value = hist[--hIdx]; }
  else if (ev.key === 'ArrowDown') { ev.preventDefault(); hIdx = Math.min(hist.length, hIdx + 1); input.value = hist[hIdx] || ''; }
  else if (ev.key === 'Tab') {
    ev.preventDefault();
    const v = input.value, parts = v.split(/\s+/);
    let pool, last = parts[parts.length - 1].toLowerCase();
    if (parts.length === 1) pool = COMMANDS;
    else if (/^(filter|find|grep)$/.test(parts[0])) pool = SKILLS.map(s => s[0]).concat('off');
    else pool = [...NODES.filter(n => n.kind !== 'skill').map(n => n.id), ...Object.keys(ALIASES)];
    const hits = pool.filter(p => p.startsWith(last));
    if (hits.length === 1) { parts[parts.length - 1] = hits[0]; input.value = parts.join(' ') + ' '; }
    else if (hits.length > 1) say({ c: 'dim', t: hits.join('  ') });
  }
});
const KEYS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
document.addEventListener('keydown', ev => {
  const typing = document.activeElement === input;
  if (ev.key === '/' && !typing) { ev.preventDefault(); input.focus(); return; }
  if (ev.key === 'Escape') { if (state.focus) select('root', true); input.blur(); return; }
  const k = KEYS[ev.key] || KEYS[ev.key.toLowerCase?.()];
  if (k && !typing && state.view === 'map' && !ev.metaKey && !ev.ctrlKey && !ev.altKey) { ev.preventDefault(); nudge(k[0], k[1]); }
});
$('#quick').addEventListener('click', ev => { const b = ev.target.closest('button[data-cmd]'); if (b) run(b.dataset.cmd); });

/* ---------- loop: avatar + signal pulses ---------- */
const pulses = []; let lastSpawn = 0;
function tick(t) {
  stepActor(t);
  if (!reduceMotion) {
    if (t - lastSpawn > 650 && pulses.length < 5) {
      lastSpawn = t;
      const litEdges = EDGES.filter(e => !e.off && e.el.classList.contains('lit'));
      const pool = litEdges.length ? litEdges : EDGES.filter(e => !e.off && e.kind === 'tree');
      if (pool.length) {
        const e = pool[Math.random() * pool.length | 0], c = sv('rect', { width: 6, height: 6, class: 'pulse', opacity: 0 });
        setSec(c, e.kind === 'skill' ? 'blue' : byId[e.to].sec);
        pulseG.append(c); pulses.push({ e, c, t0: t, dur: 1300 + Math.random() * 900 });
      }
    }
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i], k = (t - p.t0) / p.dur;
      if (k >= 1 || p.e.off) { p.c.remove(); pulses.splice(i, 1); continue; }
      const pt = p.e.el.getPointAtLength(p.e.el.getTotalLength() * k);
      p.c.setAttribute('x', Math.round(pt.x - 3)); p.c.setAttribute('y', Math.round(pt.y - 3));
      p.c.setAttribute('opacity', k < .85 ? 1 : 0);
    }
  }
  requestAnimationFrame(tick);
}
const clockFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit' });
const updateClock = () => { $('#clock').textContent = 'TPE ' + clockFmt.format(new Date()); };

/* ---------- boot ---------- */
drawEdges();
drawNodes();
drawActor();
applyVisibility();
animateEdges(EDGES.filter(e => !e.off));
reader.addEventListener('click', ev => { const b = ev.target.closest('[data-cmd]'); if (b) run(b.dataset.cmd); });
select('root', true);
fit(false);
let savedView = null; try { savedView = localStorage.getItem('bp-view'); } catch {}
setMode(savedView === 'read' || savedView === 'map' ? savedView : (innerWidth <= 760 ? 'read' : 'map'), false);
updateClock(); setInterval(updateClock, 20000);
requestAnimationFrame(tick);
let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { if (state.view === 'map') fit(false); }, 120); });
say({ c: 'dim', t: 'blueprint shell [rev 2026.10] · (c) Hao-Fu Chang' });
say('Click a node to walk there, or use ←↑→↓. Type ', { cmd: 'help', t: 'help' }, ', try ', { cmd: 'filter eval', t: 'filter eval' }, ', or switch to ', { cmd: 'read', t: 'read' }, '.');
