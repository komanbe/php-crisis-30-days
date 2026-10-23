import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

// A sculptural, abstract system: the PHP runtime is the central object, not a city.
const COLORS = { bg: '#080c15', metal: '#182334', edge: '#34445c', purple: '#a99bff', cyan: '#62ced5', amber: '#ffb06b', red: '#ff6b77', muted: '#61738d' };
const NODES = [
  { id: 'vendor', number: '01', name: '委託先のPHP基盤', sub: 'PHP 8.3.35 · 未修正', x: 0, z: 0, height: 4.4 },
  { id: 'hq', number: '02', name: '東都精機', sub: '受発注・生産管理', x: -6.8, z: -4.0, height: 2.7 },
  { id: 'factory', number: '03', name: '製造工場', sub: '生産ライン', x: -7.3, z: 4.8, height: 2.7 },
  { id: 'logistics', number: '04', name: '物流センター', sub: '配送・在庫', x: 4.6, z: 6.5, height: 2.7 },
  { id: 'hospital', number: '05', name: '医療機関', sub: '地域の医療', x: 8.1, z: -2.6, height: 3.0 },
  { id: 'retail', number: '06', name: '販売店', sub: '暮らしへの影響', x: 1.2, z: -8.1, height: 2.5 },
];
const PEOPLE = {
  vendor: { shirt: '#9f8bd5', skin: '#e7b996', hair: '#3b2b39', style: 'curly', role: '委託先エンジニア', x: 2.35, z: 1.8 },
  hq: { shirt: '#74a8df', skin: '#cc977b', hair: '#252939', style: 'bob', role: '業務担当', x: -1.65, z: 1.25 },
  factory: { shirt: '#e2a65d', skin: '#d8aa84', hair: '#443535', style: 'helmet', role: '工場スタッフ', x: -1.65, z: 1.15 },
  logistics: { shirt: '#63b7ba', skin: '#a8755a', hair: '#292a37', style: 'cap', role: '配送スタッフ', x: 1.65, z: 1.2 },
  hospital: { shirt: '#dc929b', skin: '#e8bda4', hair: '#47383b', style: 'bun', role: '医療スタッフ', x: 1.65, z: 1.1 },
  retail: { shirt: '#9bcfc1', skin: '#c38b6e', hair: '#343140', style: 'pony', role: 'お店のスタッフ', x: -1.55, z: 1.2 },
};

export function portraitSVG(id, mood = 'calm') {
  const p = PEOPLE[id] || PEOPLE.vendor;
  const hat = p.style === 'helmet' ? '<path d="M17 25a15 15 0 0 1 30 0v3H17Z" fill="#edb965"/><path d="M14 28h36M32 12v14" stroke="#f8d99b" stroke-width="3"/>' : p.style === 'cap' ? '<path d="M17 24a15 15 0 0 1 30 0v4H17Z" fill="#75a4d6"/><path d="M29 27h22" stroke="#99c3ec" stroke-width="4"/>' : '';
  const glasses = id === 'vendor' ? '<g fill="none" stroke="#313342" stroke-width="1.5"><rect x="21" y="27" width="9" height="7" rx="2"/><rect x="34" y="27" width="9" height="7" rx="2"/><path d="M30 30h4"/></g>' : '';
  const mouth = mood === 'alert' ? '<ellipse cx="32" cy="37" rx="2.5" ry="3.2" fill="#67403d"/>' : `<path d="M27 36q5 ${mood === 'relief' ? '7' : '4'} 10 0" fill="none" stroke="#67403d" stroke-width="1.6" stroke-linecap="round"/>`;
  const hairExtra = p.style === 'bun' || p.style === 'pony' ? `<circle cx="44" cy="18" r="7" fill="${p.hair}"/>` : '';
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#e8dfd2"/>${hairExtra}<path d="M11 64v-8q1-14 21-14t21 14v8" fill="${p.shirt}"/><path d="M28 40h8v10h-8" fill="${p.skin}"/><path d="M17 34V24q0-14 15-14t15 14v15l-6 6H23Z" fill="${p.hair}"/><ellipse cx="32" cy="29" rx="13" ry="16" fill="${p.skin}"/><path d="M19 28v-6q0-13 13-12 15-1 14 15-10-2-14-9-1 8-13 12" fill="${p.hair}"/>${hat}<g fill="#313342"><circle cx="26" cy="30" r="1.4"/><circle cx="38" cy="30" r="1.4"/></g>${glasses}${mouth}<path d="M24 49l8 6 8-6" fill="none" stroke="#ffffff80" stroke-width="2"/></svg>`;
}

function overlapArea(a, b, padding = 0) {
  return Math.max(0, Math.min(a.x + a.w + padding, b.x + b.w + padding) - Math.max(a.x - padding, b.x - padding)) * Math.max(0, Math.min(a.y + a.h + padding, b.y + b.h + padding) - Math.max(a.y - padding, b.y - padding));
}
function fitDialoguePosition(position, width, height, w, h) {
  const mx = Math.min(10, Math.max(0, width - w) / 2), my = Math.min(10, Math.max(0, height - h) / 2);
  return { x: Math.max(mx, Math.min(width - w - mx, position.x)), y: Math.max(my, Math.min(height - h - my, position.y)) };
}

function asSet(value, defaults = []) {
  if (value instanceof Set) return value;
  if (Array.isArray(value)) return new Set(value);
  if (typeof value === 'string') return new Set([value]);
  return new Set(value ? defaults : []);
}
// RAF's first timestamp may precede a setup-time performance.now() read.
function frameDelta(now, previous) {
  if (!Number.isFinite(now) || !Number.isFinite(previous)) return 0;
  return Math.min(.06, Math.max(0, (now - previous) / 1000));
}
function nodeStatus(id, state) {
  const affected = asSet(state.impacted), patched = asSet(state.patched, ['vendor']), isolated = asSet(state.isolated, ['vendor']);
  // The future exercise concerns fictional maintenance pressure, not a continued
  // exploit of the already-patched PHP vulnerability.
  if (state.futureMode) return affected.has(id) || (id === 'vendor' && state.pressure >= .65) ? 'impacted' : 'normal';
  if (state.visibility === 'truth' && state.day >= 1 && !state.prevented) {
    if (id === 'vendor' && (affected.has(id) || !patched.has(id))) return 'incident';
    if (id === 'hq' && state.day >= 3 && affected.has(id) && !isolated.has('vendor')) return 'incident';
  }
  if (affected.has(id)) return 'impacted';
  if (patched.has(id) || isolated.has(id) || (id === 'vendor' && state.prevented)) return 'protected';
  return 'normal';
}
function statusColor(id, status) {
  return status === 'incident' ? COLORS.red : status === 'impacted' ? COLORS.amber : status === 'protected' ? COLORS.cyan : id === 'vendor' ? COLORS.purple : COLORS.cyan;
}
function installStyle() {
  let style = document.getElementById('supply-city-styles');
  if (!style) { style = document.createElement('style'); style.id = 'supply-city-styles'; document.head.appendChild(style); }
  style.textContent = `
    .supply-city-labels{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:2}
    .supply-city-leaders{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
    .supply-city-leaders line{stroke:#60778d;stroke-width:.6;opacity:.5}
    .supply-city-label{position:absolute;left:0;top:0;display:flex;align-items:center;gap:8px;min-width:104px;padding:8px 9px 8px 0;border:0;border-bottom:1px solid #50607850;border-radius:0;background:linear-gradient(90deg,#080c15d9,#080c1570);color:#e6eaf5;font-family:inherit;text-align:left;pointer-events:auto;cursor:pointer;will-change:transform;white-space:nowrap;line-height:1.2;transition:border-color .2s,color .2s}
    .supply-city-label[hidden]{display:none!important}
    [data-story-scene=true] .supply-city-label{pointer-events:none;cursor:default;background:linear-gradient(90deg,#080c1590,#080c1520);border-bottom-color:#50607830}
    [data-story-scene=true] .supply-city-label small{color:#a0acc1}
    [data-story-scene=true] .supply-city-label:disabled{opacity:1}
    [data-story-scene=true] .supply-city-fallback{align-content:start;padding-top:70px;padding-bottom:var(--story-scene-bottom,0px)}
    [data-story-scene=true] .supply-city-fallback button:disabled{opacity:1;cursor:default}
    .supply-city-label:hover,.supply-city-label[aria-pressed=true]{border-bottom-color:#a99bff;color:#fff}
    .supply-city-label:focus-visible{outline:2px solid #a99bff;outline-offset:4px}
    .supply-city-number{display:grid;place-items:center;width:23px;height:23px;background:#17343c;color:#7fdae0;font:500 9px/1 ui-monospace,SFMono-Regular,monospace;border:1px solid #62ced54d}
    .supply-city-label[data-node=vendor] .supply-city-number{background:#2e244f;color:#c3b8ff;border-color:#a99bfF5c}
    .supply-city-label[data-status=impacted] .supply-city-number{background:#3e2a20;color:#ffb06b;border-color:#ffb06b66}
    .supply-city-label[data-status=incident] .supply-city-number{background:#3a202c;color:#ff8290;border-color:#ff6b7766}
    .supply-city-label[data-status=protected] .supply-city-number{background:#163238;color:#92e3dc;border-color:#62ced56b}
    .supply-city-label strong{display:block;font-size:11px;font-weight:550;letter-spacing:.07em}
    .supply-city-label small{display:block;margin-top:5px;font-size:8px;color:#8290a8;letter-spacing:.035em}
    .supply-city-label[data-node=vendor] strong{font-family:ui-monospace,SFMono-Regular,monospace;color:#c7bcff;font-size:12px}
    .supply-city-fallback{position:absolute;inset:0;display:grid;place-content:center;grid-template-columns:repeat(3,minmax(100px,170px));gap:30px;padding:24px;background:radial-gradient(ellipse at 50% 40%,#28204455,#080c15 65%)}
    .supply-city-fallback button{padding:20px 10px;min-height:105px;border:1px solid #365365;border-radius:0;background:#101a29;color:#95dce0;font:500 12px/1.7 inherit;cursor:pointer;box-shadow:0 0 25px #62ced510}
    .supply-city-fallback button:first-child{border-color:#9384d7;color:#c5baff;background:#211b33}
    .supply-city-fallback button[data-status=impacted]{color:#ffb06b;border-color:#ffb06b66}
    .supply-city-fallback button[data-status=incident]{color:#ff6b77;border-color:#ff6b7780}
    .supply-dialogue-layer{position:absolute;inset:0;pointer-events:none;z-index:4;overflow:hidden}
    .supply-dialogue-line{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
    .supply-dialogue-line path{fill:none;stroke:#e7b276;stroke-width:1.2;stroke-dasharray:3 4;opacity:.75}
    .supply-dialogue-line circle{fill:#f5c58e;stroke:#172335;stroke-width:2}
    .supply-dialogue{position:absolute;top:0;left:0;box-sizing:border-box;width:246px;max-width:calc(100% - 20px);padding:11px 13px 12px;border:1px solid #e2cfaf;border-radius:14px 14px 14px 4px;background:linear-gradient(135deg,#fffcf4,#eee9df);color:#263448;box-shadow:0 7px 26px #0006,0 1px 0 #ffffff90 inset;font-family:inherit;line-height:1.4;isolation:isolate}
    .supply-dialogue[hidden],.supply-dialogue-line[hidden]{display:none!important}
    .supply-dialogue[data-mood=alert]{border-color:#edb16f;background:linear-gradient(135deg,#fff9ed,#f2e5d5)}
    .supply-dialogue[data-mood=relief]{border-color:#92c5b3;background:linear-gradient(135deg,#f7fff9,#e3ece4)}
    .supply-dialogue-badge{display:block;font:600 8px/1.2 ui-monospace,SFMono-Regular,monospace;letter-spacing:.1em;color:#81715d;margin-bottom:7px}
    .supply-dialogue-person{display:flex;align-items:center;gap:9px}
    .supply-dialogue-portrait{display:block;width:36px;height:36px;flex:0 0 36px;overflow:hidden;border-radius:10px;background:#e8dfd2;box-shadow:0 0 0 1px #24314112}
    .supply-dialogue-portrait svg{display:block;width:100%;height:100%}
    .supply-dialogue-name{display:block;font-size:11px;font-weight:750;letter-spacing:.025em;color:#253247}
    .supply-dialogue-role{display:block;margin-top:2px;font-size:9px;color:#7d7c7a}
    .supply-dialogue-text{margin:9px 0 0;font-size:13px;font-weight:550;line-height:1.65;letter-spacing:.015em;overflow-wrap:anywhere}
    .supply-dialogue-live{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
    .supply-fallback-portrait{display:block;width:34px;height:34px;margin:0 auto 7px;border-radius:9px;overflow:hidden}
    .supply-fallback-portrait svg{display:block;width:100%;height:100%}
    @media(max-width:650px){.supply-city-label{min-width:87px;padding:6px 3px 6px 0;gap:5px}.supply-city-label strong{font-size:9px}.supply-city-label small{font-size:7px;margin-top:4px}.supply-city-label[data-node=vendor] strong{font-size:10px}.supply-city-number{width:19px;height:21px;font-size:8px}.supply-city-fallback{gap:15px;grid-template-columns:repeat(2,minmax(95px,150px))}.supply-dialogue{width:236px;padding:9px 11px 10px}.supply-dialogue-badge{font-size:7px;margin-bottom:5px}.supply-dialogue-text{font-size:12px;line-height:1.6;margin-top:7px}.supply-dialogue-portrait{width:31px;height:31px;flex-basis:31px}.supply-dialogue-name{font-size:10px}.supply-dialogue-role{font-size:8px}}
  `;
}

// This one overlay is shared by WebGL and fallback. Only update() changes the
// live-region text; projecting and animating its leader never announces again.
function createDialogueOverlay(container) {
  const root = document.createElement('div'); root.className = 'supply-dialogue-layer';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'supply-dialogue-line'); svg.setAttribute('aria-hidden', 'true'); svg.style.display = 'none';
  const path = document.createElementNS(svg.namespaceURI, 'path'), dot = document.createElementNS(svg.namespaceURI, 'circle'); dot.setAttribute('r', '3.5'); svg.append(path, dot); root.appendChild(svg);
  const bubble = document.createElement('section'); bubble.className = 'supply-dialogue'; bubble.hidden = true; bubble.setAttribute('role', 'note'); bubble.setAttribute('aria-label', '演習内の会話');
  bubble.innerHTML = '<span class="supply-dialogue-badge">演習内の会話</span><div class="supply-dialogue-person"><span class="supply-dialogue-portrait" aria-hidden="true"></span><span><strong class="supply-dialogue-name"></strong><span class="supply-dialogue-role"></span></span></div><p class="supply-dialogue-text"></p>';
  root.appendChild(bubble);
  const live = document.createElement('div'); live.className = 'supply-dialogue-live'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); live.setAttribute('aria-atomic', 'true'); root.appendChild(live); container.appendChild(root);
  let dialogue = null, signature = '', previousPosition = null, previousViewport = '';
  return {
    get active() { return dialogue; },
    update(value) {
      const node = value && NODES.find(n => n.id === value.nodeId);
      const next = node && String(value.text || '').trim() ? { nodeId: node.id, name: String(value.name || '担当者').slice(0, 32), role: String(value.role || PEOPLE[node.id].role).slice(0, 50), text: String(value.text).slice(0, 350), mood: ['alert', 'relief'].includes(value.mood) ? value.mood : 'calm', stamp: String(value.stamp ?? '') } : null;
      const key = JSON.stringify(next); if (signature === key) return false; signature = key; dialogue = next; previousPosition = null;
      bubble.hidden = !next; svg.style.display = next ? '' : 'none';
      if (!next) { live.textContent = ''; return true; }
      bubble.dataset.mood = next.mood; bubble.querySelector('.supply-dialogue-portrait').innerHTML = portraitSVG(next.nodeId, next.mood);
      bubble.querySelector('.supply-dialogue-name').textContent = next.name; bubble.querySelector('.supply-dialogue-role').textContent = next.role; bubble.querySelector('.supply-dialogue-text').textContent = next.text;
      live.textContent = `${next.name}、${next.role}。${next.text}（演習内の会話）`;
      return true;
    },
    layout({ width, height, anchor, obstacles = [], core = null }) {
      if (!dialogue) return null;
      const w = bubble.offsetWidth || Math.min(246, width - 20), h = bubble.offsetHeight || 134, margin = 10;
      const viewport = `${width}:${height}:${w}:${h}`;
      if (viewport !== previousViewport) { previousPosition = null; previousViewport = viewport; }
      const left = margin, right = Math.max(margin, width - w - margin), top = margin, bottom = Math.max(margin, height - h - margin);
      const fit = p => fitDialoguePosition(p, width, height, w, h);
      const candidates = [{ x: left, y: top }, { x: right, y: top }, { x: left, y: bottom }, { x: right, y: bottom }, { x: (width - w) / 2, y: top }, { x: (width - w) / 2, y: bottom }].map(fit);
      const score = p => { const rect = { ...p, w, h }; return (core ? overlapArea(rect, core, 10) * 30 : 0) + obstacles.reduce((sum, o) => sum + overlapArea(rect, o, 7) * 2, 0) + Math.hypot(p.x + w / 2 - anchor.x, p.y + h / 2 - anchor.y) * .3; };
      let position = candidates.reduce((best, p) => score(p) < score(best) ? p : best);
      if (previousPosition && score(fit(previousPosition)) <= score(position) + 150) position = fit(previousPosition);
      position = fit(position);
      previousPosition = position; bubble.style.transform = `translate3d(${position.x}px,${position.y}px,0)`;
      const endX = Math.max(position.x + 16, Math.min(position.x + w - 16, anchor.x));
      const endY = anchor.y > position.y + h / 2 ? position.y + h : position.y;
      path.setAttribute('d', `M${anchor.x.toFixed(1)} ${anchor.y.toFixed(1)} Q${endX.toFixed(1)} ${anchor.y.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`);
      dot.setAttribute('cx', anchor.x); dot.setAttribute('cy', anchor.y);
      return { ...position, w, h };
    },
    dispose() { root.remove(); },
  };
}
function fallback(container, onSelect) {
  container.dataset.renderer = 'fallback';
  if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
  const root = document.createElement('div'); root.className = 'supply-city-fallback'; root.setAttribute('aria-label', 'PHPランタイムと業務依存関係');
  const buttons = NODES.map(node => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `<span class="supply-fallback-portrait" aria-hidden="true">${portraitSVG(node.id)}</span><span class="supply-fallback-name">${node.number}　${node.name}</span>`; b.onclick = () => onSelect?.(node.id); root.appendChild(b); return [node.id, b]; });
  container.appendChild(root);
  const dialogue = createDialogueOverlay(container); let currentState = { dialogue: null }, storyMode = false, storyFocus = null;
  function storyLabels() { buttons.forEach(([id, button]) => { button.disabled = storyMode; button.tabIndex = storyMode ? -1 : 0; button.hidden = storyMode && id !== 'vendor' && id !== storyFocus; button.style.display = button.hidden ? 'none' : ''; }); }
  function layout() {
    if (!dialogue.active) return; const bounds = container.getBoundingClientRect(), target = buttons.find(([id]) => id === dialogue.active.nodeId)?.[1].getBoundingClientRect();
    const obstacles = buttons.map(([, button]) => { const r = button.getBoundingClientRect(); return { x: r.left - bounds.left, y: r.top - bounds.top, w: r.width, h: r.height }; });
    dialogue.layout({ width: container.clientWidth, height: container.clientHeight, anchor: { x: target ? target.left - bounds.left + target.width / 2 : bounds.width / 2, y: target ? target.top - bounds.top + 20 : bounds.height / 2 }, obstacles });
  }
  const observer = new ResizeObserver(layout); observer.observe(container);
  return {
    update(next) { currentState = { ...currentState, ...next }; const state = currentState; buttons.forEach(([id, b]) => { b.dataset.status = nodeStatus(id, state); b.setAttribute('aria-pressed', String(state.selected === id)); if (id === 'vendor') b.querySelector('.supply-fallback-name').textContent = state.futureMode ? '共通ソフトウェア基盤 · 継続的な更新' : `委託先のPHP基盤 · ${asSet(state.patched, ['vendor']).has('vendor') ? '8.3.36 / 更新確認済み' : '8.3.35 / 未修正'}`; }); dialogue.update(state.dialogue); layout(); },
    focus(id) { if (!storyMode) buttons.find(([key]) => key === id)?.[1].focus(); }, reset() {}, zoom() {}, setRotate() {},
    setStoryMode(enabled = true) { storyMode = Boolean(enabled); container.dataset.storyScene = String(storyMode); storyLabels(); },
    focusStory(id = null) { storyFocus = NODES.some(n => n.id === id) ? id : null; storyLabels(); },
    dispose() { observer.disconnect(); dialogue.dispose(); root.remove(); delete container.dataset.storyScene; },
  };
}

/** Procedural PHP network. Optional futureMode / pressure represent maintenance
 *  across an ecosystem; prevention and later remediation remain separate facts. */
export function createScene(container, { onSelect } = {}) {
  installStyle();
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' }); }
  catch (error) { console.warn('WebGL unavailable; showing the PHP dependency map.', error); return fallback(container, onSelect); }
  container.dataset.renderer = 'webgl';
  if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;outline:none;touch-action:none';
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', '中央のPHPランタイムと五つの業務拠点を示す3Dネットワーク。ドラッグで回転、拠点を選択。');
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(COLORS.bg); scene.fog = new THREE.Fog(COLORS.bg, 45, 90);
  const camera = new THREE.OrthographicCamera(-16, 16, 11, -11, .1, 120);
  const initialPosition = new THREE.Vector3(17, 23, 29), initialTarget = new THREE.Vector3(0, .8, -.2);
  camera.position.copy(initialPosition);
  const controls = new OrbitControls(camera, renderer.domElement); controls.target.copy(initialTarget);
  controls.enableDamping = true; controls.dampingFactor = .07; controls.minPolarAngle = .28; controls.maxPolarAngle = 1.15;
  controls.minZoom = .7; controls.maxZoom = 2.8; controls.rotateSpeed = .45; controls.panSpeed = .65; controls.zoomSpeed = .7; controls.autoRotateSpeed = .28; controls.update();
  scene.add(new THREE.HemisphereLight('#a9c8ff', '#151021', 1.15));
  const key = new THREE.DirectionalLight('#d3defa', 2.6); key.position.set(-9, 15, 12); scene.add(key);
  const edge = new THREE.DirectionalLight('#8a76ff', 2.5); edge.position.set(10, 10, -12); scene.add(edge);
  const coreLight = new THREE.PointLight(COLORS.purple, 35, 16, 2); coreLight.position.set(0, 3.6, 0); scene.add(coreLight);
  const cyanLight = new THREE.PointLight(COLORS.cyan, 18, 14, 2); cyanLight.position.set(-6, 5, 4); scene.add(cyanLight);

  const metal = new THREE.MeshStandardMaterial({ color: COLORS.metal, metalness: .68, roughness: .31 });
  const lighterMetal = new THREE.MeshStandardMaterial({ color: '#35445e', metalness: .7, roughness: .26 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#8670ca', metalness: .15, roughness: .12, transparent: true, opacity: .23, side: THREE.DoubleSide, depthWrite: false });
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const world = new THREE.Group(); scene.add(world);
  const structures = new Map(), people = new Map(), pickable = [], routes = [], particles = [], spinners = [], pulses = [];
  let state = { day: 0, visibility: 'observed', impacted: [], patched: false, prevented: false, isolated: false, selected: null, layer: 'all', futureMode: false, pressure: 0, dialogue: null };
  let disposed = false, frame = 0, elapsed = 0, lastTime = null, focusTarget = null, desiredZoom = null, needsLabelLayout = true;
  let storyMode = false, storyFocus = null, storyBottom = 0, storyTop = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const basic = (color, opacity = 1) => new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, toneMapped: false, depthWrite: opacity === 1 });
  function box(group, x, y, z, w, h, d, material = metal) { const o = new THREE.Mesh(unitBox, material); o.position.set(x, y, z); o.scale.set(w, h, d); group.add(o); return o; }
  function disk(group, radius, height, y, material = metal, sides = 64) { const o = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, sides), material); o.position.y = y; group.add(o); return o; }
  function ring(group, radius, tube, y, material, rotation = [Math.PI / 2, 0, 0]) { const o = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 96), material); o.rotation.set(...rotation); o.position.y = y; group.add(o); return o; }
  function outline(object, color = COLORS.cyan, opacity = .5) { const line = new THREE.LineSegments(new THREE.EdgesGeometry(object.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity, toneMapped: false })); object.add(line); return line; }
  function loop(radius, y, color, opacity, start = 0, length = Math.PI * 2) {
    const points = Array.from({ length: 129 }, (_, i) => { const a = start + i / 128 * length; return new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius); });
    const o = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, transparent: true, opacity, toneMapped: false })); world.add(o); return o;
  }
  const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 128;
  const glowContext = glowCanvas.getContext('2d'); const gradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(.12, '#ffffffbb'); gradient.addColorStop(.38, '#ffffff24'); gradient.addColorStop(1, '#ffffff00');
  glowContext.fillStyle = gradient; glowContext.fillRect(0, 0, 128, 128);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  function glow(group, x, y, z, size, color, opacity = .3) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity, toneMapped: false })); s.position.set(x, y, z); s.scale.set(size, size, 1); group.add(s); return s; }

  // Restrained coordinates and sparse particles establish a navigable dark volume.
  [3.5, 6.4, 9.7, 12.5].forEach((r, i) => loop(r, -.71, '#4d6280', i === 2 ? .3 : .16));
  loop(5.8, -.68, COLORS.purple, .28, .2, 1.3); loop(10.5, -.68, COLORS.cyan, .21, 3.4, 1.0);
  for (let i = 0; i < 36; i++) {
    const a = i * Math.PI / 18, r = i % 3 === 0 ? 11.9 : 12.22;
    const points = [new THREE.Vector3(Math.cos(a) * r, -.69, Math.sin(a) * r), new THREE.Vector3(Math.cos(a) * 12.5, -.69, Math.sin(a) * 12.5)];
    world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: '#526787', transparent: true, opacity: .3, toneMapped: false })));
  }
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a) * 3.2, -.73, Math.sin(a) * 3.2), new THREE.Vector3(Math.cos(a) * 12.4, -.73, Math.sin(a) * 12.4)]), new THREE.LineDashedMaterial({ color: '#36445b', dashSize: .08, gapSize: .3, transparent: true, opacity: .38, toneMapped: false })); line.computeLineDistances(); world.add(line);
  }
  let seed = 7123; const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const starPositions = [];
  for (let i = 0; i < 115; i++) starPositions.push((random() - .5) * 44, random() * 17 - 3, (random() - .5) * 40);
  const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3)), new THREE.PointsMaterial({ color: '#8a99bd', size: .035, transparent: true, opacity: .45, toneMapped: false })); scene.add(stars);

  const phpCanvas = document.createElement('canvas'); phpCanvas.width = 768; phpCanvas.height = 384;
  const phpTexture = new THREE.CanvasTexture(phpCanvas); phpTexture.colorSpace = THREE.SRGBColorSpace;
  let displayedVersion = '', displayedFutureMode = false;
  function paintPHP(patched, futureMode = false) {
    const version = patched ? '8.3.36' : '8.3.35'; if (displayedVersion === version && displayedFutureMode === futureMode) return; displayedVersion = version; displayedFutureMode = futureMode;
    const ctx = phpCanvas.getContext('2d'); ctx.clearRect(0, 0, 768, 384); ctx.textAlign = 'center';
    ctx.fillStyle = '#c6bce4'; ctx.font = '500 29px sans-serif'; ctx.fillText(futureMode ? '共通ソフトウェア基盤' : '委託先のPHP基盤', 384, 71);
    ctx.shadowColor = '#9d83ff'; ctx.shadowBlur = 24; ctx.fillStyle = '#ede8ff'; ctx.font = `italic 700 ${futureMode ? 105 : 166}px ui-monospace, SFMono-Regular, Menlo, monospace`; ctx.fillText(futureMode ? 'PHP + OSS' : 'PHP', 384, 224);
    ctx.shadowBlur = 0; ctx.fillStyle = '#beb0ee'; ctx.font = '500 29px ui-monospace, SFMono-Regular, Menlo, sans-serif'; ctx.fillText(futureMode ? '継続的な更新' : `${version} / ${patched ? '更新確認済み' : '未修正'}`, 384, 300); phpTexture.needsUpdate = true;
  }
  paintPHP(false);

  const personSphere = new THREE.SphereGeometry(1, 14, 10);
  function makePerson(node, parent) {
    const p = PEOPLE[node.id], rig = new THREE.Group(); rig.position.set(p.x, -.42, p.z); rig.scale.setScalar(1.08); parent.add(rig);
    const cloth = new THREE.MeshStandardMaterial({ color: p.shirt, roughness: .75, emissive: p.shirt, emissiveIntensity: .12 });
    const skin = new THREE.MeshStandardMaterial({ color: p.skin, roughness: .87, emissive: p.skin, emissiveIntensity: .12 });
    const hair = new THREE.MeshStandardMaterial({ color: p.hair, roughness: .8 }), ink = basic('#222639'), trousers = new THREE.MeshStandardMaterial({ color: '#3b4c66', roughness: .8 });
    function ball(group, x, y, z, sx, sy, sz, material) { const o = new THREE.Mesh(personSphere, material); o.position.set(x, y, z); o.scale.set(sx, sy, sz); group.add(o); return o; }
    ring(rig, .46, .017, .025, basic(p.shirt, .55));
    [-.14, .14].forEach(x => { const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.095, .35, 3, 8), trousers); leg.position.set(x, .34, 0); rig.add(leg); box(rig, x, .075, .065, .19, .12, .33, ink); });
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.245, .37, 4, 12), cloth); torso.position.y = 1.02; torso.scale.z = .8; rig.add(torso);
    box(rig, 0, .61, 0, .39, .13, .29, trousers); ball(rig, 0, 1.43, 0, .12, .15, .12, skin);
    const head = new THREE.Group(); head.position.y = 1.69; rig.add(head);
    ball(head, 0, 0, 0, .31, .34, .29, skin); ball(head, -.31, -.02, 0, .055, .09, .05, skin); ball(head, .31, -.02, 0, .055, .09, .05, skin);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.329, 14, 10, 0, Math.PI * 2, 0, 1.69), hair); cap.position.y = .035; head.add(cap);
    if (p.style === 'curly') for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; ball(head, Math.cos(a) * .21, .27 + (i % 2) * .02, Math.sin(a) * .17, .13, .12, .13, hair); }
    if (p.style === 'bob') { ball(head, -.27, -.04, -.04, .095, .25, .19, hair); ball(head, .27, -.04, -.04, .095, .25, .19, hair); }
    if (p.style === 'bun' || p.style === 'pony') ball(head, .02, p.style === 'bun' ? .21 : -.04, -.31, .16, p.style === 'bun' ? .16 : .28, .14, hair);
    if (p.style === 'helmet' || p.style === 'cap') {
      const hatMaterial = new THREE.MeshStandardMaterial({ color: p.style === 'helmet' ? '#f0be70' : '#72a3d9', roughness: .6, emissive: p.style === 'helmet' ? '#ad7238' : '#214968', emissiveIntensity: .12 });
      const hat = new THREE.Mesh(new THREE.SphereGeometry(.353, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), hatMaterial); hat.position.y = .1; head.add(hat);
      if (p.style === 'helmet') { ring(head, .36, .034, .1, hatMaterial); box(head, 0, .34, 0, .06, .12, .55, hatMaterial); }
      else box(head, 0, .105, .19, .54, .045, .4, hatMaterial);
    }
    [-.105, .105].forEach(x => ball(head, x, .015, .269, .023, .027, .018, ink));
    const brows = [-.105, .105].map(x => box(head, x, .089, .275, .078, .019, .014, hair));
    ball(head, 0, -.055, .29, .036, .043, .035, skin);
    const mouth = new THREE.Group(); mouth.position.set(0, -.13, .283); head.add(mouth);
    const smile = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.061, .01, 0), new THREE.Vector3(0, -.019, .012), new THREE.Vector3(.061, .01, 0)]), new THREE.LineBasicMaterial({ color: '#694142', toneMapped: false })); mouth.add(smile);
    const surprise = new THREE.Mesh(new THREE.TorusGeometry(.034, .013, 6, 12), basic('#694142')); surprise.visible = false; mouth.add(surprise);
    if (node.id === 'vendor') { [-.107, .107].forEach(x => { const lens = new THREE.Mesh(new THREE.TorusGeometry(.069, .012, 5, 12), ink); lens.position.set(x, .015, .292); lens.scale.y = .77; head.add(lens); }); box(head, 0, .02, .297, .08, .012, .015, ink); }
    function arm(side) {
      const pivot = new THREE.Group(); pivot.position.set(side * .28, 1.27, 0); rig.add(pivot);
      const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(.095, .22, 3, 8), cloth); sleeve.position.y = -.15; pivot.add(sleeve);
      ball(pivot, 0, -.37, .02, .086, .12, .085, skin); pivot.rotation.x = -.22; return pivot;
    }
    const leftArm = arm(-1), rightArm = arm(1);
    if (node.id === 'vendor' || node.id === 'hq') {
      const tablet = box(rig, 0, .96, .32, .48, .32, .055, ink); tablet.rotation.x = -.15;
      box(rig, 0, .97, .355, .38, .22, .012, basic(node.id === 'vendor' ? '#b7a9ef' : '#9bced1'));
    } else if (node.id === 'logistics') {
      const parcel = box(rig, 0, .88, .34, .43, .38, .32, new THREE.MeshStandardMaterial({ color: '#d4ad7c', roughness: .9 }));
      box(parcel, 0, 0, .51, .12, 1.02, .02, basic('#f0d8b5')); rightArm.rotation.x = -.6;
    } else if (node.id === 'hospital') {
      box(rig, -.15, 1.08, .18, .1, .53, .07, basic('#eff4e5')); box(rig, .15, 1.08, .18, .1, .53, .07, basic('#eff4e5'));
      const scope = new THREE.Mesh(new THREE.TorusGeometry(.13, .018, 5, 16, Math.PI * 1.6), ink); scope.position.set(0, 1.15, .22); scope.rotation.z = -.6; rig.add(scope);
      ball(rig, .1, 1.01, .23, .045, .045, .018, basic('#d9e3dd'));
    } else if (node.id === 'retail') box(rig, 0, .94, .22, .36, .52, .035, new THREE.MeshStandardMaterial({ color: '#547e6f', roughness: .8 }));
    const marker = new THREE.Group(); marker.position.y = 2.24; rig.add(marker); marker.visible = false;
    const markerMaterial = basic(COLORS.amber); box(marker, 0, .09, 0, .055, .21, .055, markerMaterial); ball(marker, 0, -.075, 0, .035, .035, .035, markerMaterial);
    const pick = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 2.2, 10), new THREE.MeshBasicMaterial({ visible: false })); pick.position.y = 1.05; pick.userData.nodeId = node.id; rig.add(pick); pickable.push(pick);
    people.set(node.id, { rig, head, leftArm, rightArm, brows, smile, surprise, marker, baseY: rig.position.y, phase: NODES.indexOf(node) * 1.17, mood: 'calm', active: false });
  }

  for (const node of NODES) {
    const group = new THREE.Group(); group.position.set(node.x, 0, node.z); world.add(group);
    const accent = basic(node.id === 'vendor' ? COLORS.purple : COLORS.cyan);
    const radius = node.id === 'vendor' ? 2.55 : 1.55;
    disk(group, radius, .16, -.46); disk(group, radius * .86, .17, -.27, lighterMetal);
    const statusRing = ring(group, radius, .035, -.36, accent);
    const baseGlow = glow(group, 0, -.15, 0, radius * 3.5, node.id === 'vendor' ? COLORS.purple : COLORS.cyan, node.id === 'vendor' ? .24 : .13);
    const statusPulse = ring(group, radius + .18, .015, -.48, basic(COLORS.cyan, .2)); pulses.push({ object: statusPulse, base: radius + .18, phase: NODES.indexOf(node) * .13, id: node.id });
    const pick = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, node.height + 1, 16), new THREE.MeshBasicMaterial({ visible: false })); pick.position.y = node.height / 2; pick.userData.nodeId = node.id; group.add(pick); pickable.push(pick);
    if (node.id === 'vendor') {
      disk(group, 2.2, .25, .03); disk(group, 1.95, .15, .27, lighterMetal);
      [.38, .58, 3.48, 3.7].forEach((y, i) => ring(group, i < 2 ? 1.92 : 1.55, i % 2 ? .027 : .065, y, basic(COLORS.purple, i % 2 ? .55 : 1)));
      disk(group, 1.44, 2.9, 1.96, glass);
      disk(group, 1.52, .18, 3.5, metal); disk(group, .98, .1, 3.7, lighterMetal);
      const energy = new THREE.Mesh(new THREE.IcosahedronGeometry(.83, 2), new THREE.MeshStandardMaterial({ color: '#8675d5', emissive: '#7f5ce1', emissiveIntensity: .55, metalness: .7, roughness: .17, transparent: true, opacity: .65 })); energy.position.y = 1.96; group.add(energy); spinners.push({ object: energy, axis: 'y', speed: .15 });
      outline(energy, '#cebeff', .3);
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2; const support = box(group, Math.cos(a) * 1.66, 1.87, Math.sin(a) * 1.66, .065, 2.8, .065, lighterMetal);
        if (i % 2 === 0) box(group, support.position.x, 1.87, support.position.z, .018, 2.55, .018, basic(COLORS.purple, .7));
      }
      const orbit = new THREE.Group(); orbit.position.y = 1.9; group.add(orbit);
      ring(orbit, 2.1, .018, 0, basic(COLORS.purple, .5), [1.02, .2, .34]);
      ring(orbit, 2.22, .012, 0, basic('#b5d9ff', .3), [1.6, .4, -.56]); spinners.push({ object: orbit, axis: 'y', speed: .055 });
      const bracketMat = basic('#b5a7f1', .72);
      [-1, 1].forEach(side => {
        const bracket = new THREE.Group(); bracket.position.set(side * 2.5, 2, 0); bracket.rotation.y = -.5; group.add(bracket);
        box(bracket, 0, 0, 0, .06, 1.28, .08, bracketMat); box(bracket, -side * .18, .64, 0, .4, .06, .08, bracketMat); box(bracket, -side * .18, -.64, 0, .4, .06, .08, bracketMat);
      });
      const php = new THREE.Sprite(new THREE.SpriteMaterial({ map: phpTexture, transparent: true, depthWrite: false, depthTest: false, toneMapped: false })); php.scale.set(3.75, 1.875, 1); php.position.set(0, 2.07, .15); php.renderOrder = 8; group.add(php);
      glow(group, 0, 2, 0, 5.7, COLORS.purple, .16);
      const sweep = new THREE.Group(); group.add(sweep);
      for (let i = 0; i < 3; i++) { const marker = new THREE.Mesh(new THREE.OctahedronGeometry(.085), basic('#d7ccff')); const a = i / 3 * Math.PI * 2; marker.position.set(Math.cos(a) * 2.72, .05, Math.sin(a) * 2.72); sweep.add(marker); }
      spinners.push({ object: sweep, axis: 'y', speed: .11 });
    } else if (node.id === 'hq') {
      for (let i = 0; i < 3; i++) {
        const slab = box(group, 0, .25 + i * .58, 0, 2.15, .25, 1.75, i % 2 ? lighterMetal : metal); outline(slab, COLORS.cyan, .55);
        box(group, 0, .4 + i * .58, .91, 1.75, .025, .025, accent);
      }
      [-.8, .8].forEach(x => [-.6, .6].forEach(z => box(group, x, .9, z, .075, 1.8, .075, lighterMetal)));
      const chip = box(group, 0, 1.83, 0, .85, .16, .85, glass); outline(chip, COLORS.cyan, .85);
      for (let i = 0; i < 5; i++) { box(group, -.52 + i * .26, 1.85, .61, .04, .025, .24, accent); box(group, -.52 + i * .26, 1.85, -.61, .04, .025, .24, accent); }
      glow(group, 0, 1.6, 0, 2.2, COLORS.cyan, .15);
    } else if (node.id === 'factory') {
      function gear(x, y, z, r, teeth) {
        const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = .4; group.add(g);
        ring(g, r * .66, r * .22, 0, lighterMetal, [0, 0, 0]); ring(g, r * .66, .025, .0, accent, [0, 0, 0]);
        for (let i = 0; i < teeth; i++) { const a = i / teeth * Math.PI * 2; const tooth = box(g, Math.sin(a) * r, Math.cos(a) * r, 0, .32, .3, .35); tooth.rotation.z = -a; }
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * .18, r * .18, .4, 24), accent); hub.rotation.x = Math.PI / 2; g.add(hub); spinners.push({ object: g, axis: 'z', speed: x < 0 ? .07 : -.1 });
      }
      gear(-.52, 1.05, .12, .8, 9); gear(.63, 1.66, -.05, .55, 7);
      box(group, -.52, .25, 0, .25, .9, .45, lighterMetal); box(group, .65, .5, -.1, .19, 1.55, .35, lighterMetal);
    } else if (node.id === 'logistics') {
      [[-.6, .43, .35], [.62, .43, .35], [0, 1.55, -.3]].forEach(([x, y, z], i) => {
        const cargo = box(group, x, y, z, 1.03, 1.03, 1.03, i === 2 ? glass : metal); outline(cargo, COLORS.cyan, .8);
        box(group, x, y, z + .52, .035, 1.03, .025, accent); box(group, x, y, z + .525, 1.03, .035, .025, accent);
      });
      ring(group, 1.47, .019, 1.1, basic(COLORS.cyan, .35));
    } else if (node.id === 'hospital') {
      const points = [[-.38, 1.25], [.38, 1.25], [.38, .38], [1.25, .38], [1.25, -.38], [.38, -.38], [.38, -1.25], [-.38, -1.25], [-.38, -.38], [-1.25, -.38], [-1.25, .38], [-.38, .38]];
      const shape = new THREE.Shape(); points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y)); shape.closePath();
      const plus = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .3, bevelEnabled: true, bevelSize: .055, bevelThickness: .045, bevelSegments: 2, steps: 1 }), new THREE.MeshStandardMaterial({ color: '#6c9fac', emissive: COLORS.cyan, emissiveIntensity: .2, metalness: .6, roughness: .22 })); plus.position.y = 1.32; plus.rotation.y = .45; group.add(plus); outline(plus, COLORS.cyan, .5);
      ring(group, 1.52, .018, 1.1, basic(COLORS.cyan, .35), [0, .45, 0]);
    } else {
      for (let i = 0; i < 3; i++) { disk(group, 1.12 - i * .12, .16, .28 + i * .48, i % 2 ? lighterMetal : metal); ring(group, 1.12 - i * .12, .035, .28 + i * .48, accent); }
      const exchange = new THREE.Group(); exchange.position.y = 1.75; group.add(exchange);
      ring(exchange, .68, .06, 0, lighterMetal, [.55, 0, 0]); ring(exchange, .68, .027, 0, accent, [.55, 0, 0]);
      const dot = new THREE.Mesh(new THREE.OctahedronGeometry(.22), accent); dot.position.set(.67, 0, 0); exchange.add(dot); spinners.push({ object: exchange, axis: 'y', speed: .12 });
    }
    makePerson(node, group);
    structures.set(node.id, { node, group, accent, statusRing, baseGlow, statusPulse, status: 'normal' });
  }

  function connection(from, to, waypoints, security = false) {
    const curve = new THREE.CatmullRomCurve3(waypoints.map(p => new THREE.Vector3(...p)), false, 'centripetal');
    let path, halo;
    if (security) {
      path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(100)), new THREE.LineDashedMaterial({ color: COLORS.red, dashSize: .16, gapSize: .13, transparent: true, opacity: .9, toneMapped: false })); path.computeLineDistances();
    } else {
      path = new THREE.Mesh(new THREE.TubeGeometry(curve, 72, .048, 7, false), basic(COLORS.cyan, .78));
      halo = new THREE.Mesh(new THREE.TubeGeometry(curve, 72, .14, 6, false), new THREE.MeshBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: .075, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); world.add(halo);
    }
    world.add(path);
    const route = { from, to, security, curve, path, halo, status: 'normal', particles: [] };
    if (!security) { const arrow = new THREE.Mesh(new THREE.ConeGeometry(.13, .32, 8), basic(COLORS.cyan)); arrow.position.copy(curve.getPointAt(.55)); arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangentAt(.55)); world.add(arrow); route.arrow = arrow; }
    for (let i = 0; i < 3; i++) { const o = new THREE.Mesh(new THREE.SphereGeometry(.072, 9, 7), basic(security ? COLORS.red : '#d3ffff')); world.add(o); const item = { object: o, curve, phase: i / 3, route }; particles.push(item); route.particles.push(item); }
    routes.push(route);
  }
  connection('vendor', 'hq', [[-1.8, 1.15, -.7], [-3.3, 3.6, -1.7], [-5, 3.45, -3.0], [-6.8, 1.8, -4]]);
  connection('hq', 'factory', [[-7.5, 1.1, -3], [-9, 3.6, -.4], [-9, 3.2, 2.4], [-7.7, 1.4, 4.4]]);
  connection('hq', 'logistics', [[-5.8, 1.4, -3.5], [-3.6, 3.9, 3.8], [1.8, 3.4, 6.3], [3.8, 1.4, 6.5]]);
  connection('logistics', 'hospital', [[5.4, 1.4, 6.3], [8.4, 3.5, 4.5], [9.5, 3.5, .6], [8.5, 1.4, -2.1]]);
  connection('logistics', 'retail', [[5.6, .9, 5.8], [6.5, 2.5, 0], [5.0, 3.9, -6.4], [2.1, 1.4, -8.0]]);
  connection('vendor', 'hq', [[-.8, 3.7, -.2], [-2.5, 5.6, -1.8], [-4.5, 5.2, -3.5], [-6.6, 2.2, -4]], true);

  const labelsRoot = document.createElement('div'); labelsRoot.className = 'supply-city-labels'; container.appendChild(labelsRoot);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'supply-city-leaders'); labelsRoot.appendChild(svg);
  const labels = NODES.map(node => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'supply-city-label'; button.dataset.node = node.id; button.dataset.status = 'normal'; button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `${node.name}、${node.sub}の詳細を表示`);
    button.innerHTML = `<span class="supply-city-number">${node.number}</span><span><strong>${node.name}</strong><small>${node.sub}</small></span>`;
    button.onclick = event => { event.stopPropagation(); if (!storyMode) onSelect?.(node.id); }; labelsRoot.appendChild(button);
    const leader = document.createElementNS('http://www.w3.org/2000/svg', 'line'); svg.appendChild(leader);
    return { node, button, leader, anchor: new THREE.Vector3(node.x, node.height + .5, node.z), x: 0, y: 0 };
  });
  const dialogueOverlay = createDialogueOverlay(container);
  const projected = new THREE.Vector3(); let width = 1, height = 1;
  function layoutLabels() {
    world.updateMatrixWorld(true); camera.updateMatrixWorld();
    const layoutHeight = height - storyBottom, layoutTop = storyTop;
    const visibleLabels = labels.filter(label => !storyMode || label.node.id === 'vendor' || label.node.id === storyFocus);
    labels.forEach(label => {
      const visible = visibleLabels.includes(label); label.button.hidden = !visible; label.leader.style.display = visible ? '' : 'none';
    });
    visibleLabels.forEach(label => {
      projected.copy(label.anchor).project(camera); label.w = label.button.offsetWidth || 120; label.h = label.button.offsetHeight || 42;
      label.px = (projected.x + 1) * width / 2; label.py = (1 - projected.y) * height / 2;
      label.x = Math.max(7, Math.min(width - label.w - 7, label.px - label.w / 2));
      label.y = Math.max(layoutTop + 8, Math.min(layoutHeight - label.h - 8, label.py - label.h));
    });
    let bubbleBounds = null, coreBounds = null;
    if (dialogueOverlay.active) {
      const person = people.get(dialogueOverlay.active.nodeId);
      projected.set(0, 2.12, 0); person.rig.localToWorld(projected); projected.project(camera);
      const anchor = { x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2 };
      projected.set(0, 2, 0).project(camera); const unit = height / (camera.top - camera.bottom) * camera.zoom;
      coreBounds = { x: (projected.x + 1) * width / 2 - 1.9 * unit, y: (1 - projected.y) * height / 2 - 2.1 * unit, w: 3.8 * unit, h: 4.2 * unit };
      bubbleBounds = dialogueOverlay.layout({ width, height: layoutHeight, anchor, obstacles: visibleLabels, core: coreBounds });
    }
    function avoid(label, obstacle) {
      if (!obstacle || !overlapArea(label, obstacle, 5)) return;
      const choices = [{ x: label.x, y: obstacle.y - label.h - 9 }, { x: label.x, y: obstacle.y + obstacle.h + 9 }, { x: obstacle.x - label.w - 9, y: label.y }, { x: obstacle.x + obstacle.w + 9, y: label.y }].filter(p => p.x >= 7 && p.y >= layoutTop + 7 && p.x + label.w <= width - 7 && p.y + label.h <= layoutHeight - 7);
      if (choices.length) { const best = choices.reduce((a, b) => Math.hypot(a.x - label.x, a.y - label.y) < Math.hypot(b.x - label.x, b.y - label.y) ? a : b); label.x = best.x; label.y = best.y; }
    }
    for (let pass = 0; pass < 14; pass++) {
      visibleLabels.forEach(label => { avoid(label, bubbleBounds); avoid(label, coreBounds); });
      for (let i = 0; i < visibleLabels.length; i++) for (let j = i + 1; j < visibleLabels.length; j++) {
        const a = visibleLabels[i], b = visibleLabels[j];
        const ox = Math.min(a.x + a.w + 7, b.x + b.w + 7) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h + 8, b.y + b.h + 8) - Math.max(a.y, b.y);
        if (ox > 0 && oy > 0) {
          const shift = oy / 2 + 1; if (a.y <= b.y) { a.y -= shift; b.y += shift; } else { a.y += shift; b.y -= shift; }
          a.y = Math.max(layoutTop + 7, Math.min(layoutHeight - a.h - 7, a.y)); b.y = Math.max(layoutTop + 7, Math.min(layoutHeight - b.h - 7, b.y));
        }
      }
    }
    // Final packing reserves the bubble and PHP core first. Unlike pairwise
    // relaxation, placing each label once cannot push a later one into speech.
    if (bubbleBounds) {
      const occupied = [bubbleBounds, coreBounds].filter(Boolean);
      const priority = label => label.node.id === 'vendor' ? 0 : label.node.id === dialogueOverlay.active.nodeId ? 1 : 2;
      [...visibleLabels].sort((a, b) => priority(a) - priority(b) || a.py - b.py).forEach(label => {
        const desired = { x: Math.max(7, Math.min(width - label.w - 7, label.px - label.w / 2)), y: Math.max(layoutTop + 7, Math.min(layoutHeight - label.h - 7, label.py - label.h)) };
        const candidates = [{ x: label.x, y: label.y }, desired];
        for (const x of [7, (width - label.w) / 2, width - label.w - 7, desired.x]) for (let y = layoutTop + 7; y <= layoutHeight - label.h - 7; y += label.h + 9) candidates.push({ x, y });
        const score = p => occupied.reduce((sum, obstacle) => sum + overlapArea({ ...p, w: label.w, h: label.h }, obstacle, 5) * 1000, 0) + (p.x - desired.x) ** 2 + (p.y - desired.y) ** 2;
        const best = candidates.reduce((a, b) => score(a) <= score(b) ? a : b); label.x = best.x; label.y = best.y; occupied.push({ x: best.x, y: best.y, w: label.w, h: label.h });
      });
    }
    visibleLabels.forEach(label => {
      label.button.style.transform = `translate3d(${label.x.toFixed(1)}px,${label.y.toFixed(1)}px,0)`;
      label.leader.setAttribute('x1', label.px); label.leader.setAttribute('y1', label.py + 7); label.leader.setAttribute('x2', label.x + label.w / 2); label.leader.setAttribute('y2', label.y + label.h);
      label.leader.style.opacity = Math.abs(label.y + label.h - label.py) > 12 ? '.6' : '.15';
    }); needsLabelLayout = false;
  }
  function resize() {
    width = Math.max(1, container.clientWidth); height = Math.max(1, container.clientHeight);
    const style = storyMode ? getComputedStyle(container) : null;
    // The heading can wrap on mobile; reserve its measured height before labels.
    storyTop = storyMode ? Math.min(Math.max(0, height - 160), Math.max(0, parseFloat(style.getPropertyValue('--story-scene-top')) || 0)) : 0;
    storyBottom = storyMode ? Math.min(Math.max(0, height - storyTop - 160), Math.max(0, parseFloat(style.getPropertyValue('--story-scene-bottom')) || 0)) : 0;
    const safeHeight = Math.max(1, height - storyTop - storyBottom), aspect = width / safeHeight, half = storyMode ? Math.max(9.4, 13 / aspect) : Math.max(10.6, 13.8 / aspect), units = 2 * half / safeHeight;
    // An asymmetric frustum keeps the network centered above the dialogue dock.
    // Its horizontal field stays wide enough to retain all supply-chain nodes.
    camera.left = -half * aspect; camera.right = half * aspect; camera.top = half + storyTop * units; camera.bottom = -half - storyBottom * units; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); needsLabelLayout = true;
  }
  const observer = new ResizeObserver(resize); observer.observe(container);
  const styleObserver = new MutationObserver(() => { if (storyMode) resize(); }); styleObserver.observe(container, { attributes: true, attributeFilter: ['style', 'class'] }); resize();
  controls.addEventListener('change', () => { needsLabelLayout = true; }); controls.addEventListener('start', () => { focusTarget = null; desiredZoom = null; });
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(); let pointerStart = null;
  function down(e) { pointerStart = storyMode ? null : { x: e.clientX, y: e.clientY }; }
  function up(e) {
    if (storyMode || !pointerStart || Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 5) return;
    const bounds = renderer.domElement.getBoundingClientRect(); pointer.set((e.clientX - bounds.left) / bounds.width * 2 - 1, -(e.clientY - bounds.top) / bounds.height * 2 + 1); raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickable, false)[0]; if (hit) onSelect?.(hit.object.userData.nodeId); pointerStart = null;
  }
  renderer.domElement.addEventListener('pointerdown', down); renderer.domElement.addEventListener('pointerup', up);

  function updatePeople() {
    people.forEach((person, id) => {
      person.active = dialogueOverlay.active?.nodeId === id || (storyMode && storyFocus === id);
      const status = nodeStatus(id, state);
      person.mood = dialogueOverlay.active?.nodeId === id ? dialogueOverlay.active.mood : person.active && ['incident', 'impacted'].includes(status) ? 'alert' : person.active && status === 'protected' ? 'relief' : 'calm';
      person.surprise.visible = person.mood === 'alert'; person.smile.visible = person.mood !== 'alert'; person.marker.visible = person.active && person.mood === 'alert';
      person.brows[0].rotation.z = person.mood === 'alert' ? -.23 : 0; person.brows[1].rotation.z = person.mood === 'alert' ? .23 : 0;
    });
  }
  function update(next = {}) {
    state = { ...state, ...next }; const affected = asSet(state.impacted), patched = asSet(state.patched, ['vendor']), isolated = asSet(state.isolated, ['vendor']);
    state.futureMode = Boolean(state.futureMode); state.pressure = Math.min(1, Math.max(0, Number(state.pressure) || 0));
    dialogueOverlay.update(state.dialogue);
    updatePeople();
    paintPHP(patched.has('vendor'), state.futureMode);
    const maintenanceColor = new THREE.Color(COLORS.amber);
    coreLight.color.set(COLORS.purple); if (state.futureMode) coreLight.color.lerp(maintenanceColor, state.pressure * .8);
    structures.forEach((item, id) => {
      const status = nodeStatus(id, state), color = new THREE.Color(statusColor(id, status));
      if (state.futureMode && status === 'normal') color.lerp(maintenanceColor, state.pressure * .85);
      item.status = status; item.accent.color.copy(color); item.baseGlow.material.color.copy(color); item.statusPulse.material.color.copy(color);
      item.statusRing.scale.setScalar(state.selected === id ? 1.08 : 1); item.baseGlow.material.opacity = state.selected === id ? .35 : (id === 'vendor' ? .24 : .13) + (state.futureMode ? state.pressure * .08 : 0);
      const label = labels.find(label => label.node.id === id); label.button.dataset.status = status; label.button.setAttribute('aria-pressed', String(state.selected === id));
      if (id === 'vendor') {
        label.button.querySelector('strong').textContent = state.futureMode ? '共通ソフトウェア基盤' : '委託先のPHP基盤';
        label.button.querySelector('small').textContent = state.futureMode ? '継続的な更新' : `PHP ${displayedVersion} · ${patched.has('vendor') ? '更新確認済み' : '未修正'}`;
        label.button.setAttribute('aria-label', state.futureMode ? (storyMode ? '共通ソフトウェア基盤、継続的な更新' : '共通ソフトウェア基盤、継続的な更新の詳細を表示') : (storyMode ? '委託先のPHP基盤' : '委託先のPHP基盤の詳細を表示'));
      }
    });
    routes.forEach(route => {
      const blocked = isolated.has(route.from) || isolated.has(route.to);
      route.status = affected.has(route.from) || affected.has(route.to) ? 'impacted' : blocked ? 'isolated' : 'normal';
      route.path.visible = route.security ? !state.futureMode && state.layer !== 'business' && state.visibility === 'truth' && state.day >= 3 && !state.prevented && !blocked : state.layer !== 'security';
      if (route.security) route.path.material.opacity = patched.has('vendor') ? .4 : .9;
      else {
        const color = new THREE.Color(route.status === 'impacted' ? COLORS.amber : route.status === 'isolated' ? COLORS.muted : COLORS.cyan);
        if (state.futureMode && route.status === 'normal') color.lerp(maintenanceColor, state.pressure * .85);
        route.path.material.color.set(color); route.path.material.opacity = route.status === 'impacted' ? 1 : .73;
        route.arrow.material.color.set(color); route.arrow.visible = route.path.visible; route.halo.material.color.set(color); route.halo.material.opacity = route.status === 'impacted' ? .16 : .075; route.halo.visible = route.path.visible;
      }
      route.particles.forEach(p => { p.object.visible = route.path.visible && !blocked && !(route.security && patched.has('vendor')); p.object.material.color.set(route.security ? COLORS.red : route.status === 'impacted' ? '#ffe0b7' : '#d6ffff'); });
    }); needsLabelLayout = true;
  }
  function render(now) {
    if (disposed) return; frame = requestAnimationFrame(render); const frameTime = Number.isFinite(now) ? now : performance.now(); const dt = frameDelta(frameTime, lastTime); lastTime = frameTime; elapsed += dt;
    if (focusTarget) {
      const movement = focusTarget.clone().sub(controls.target).multiplyScalar(reducedMotion ? 1 : storyMode ? Math.min(1, dt * 3) : .06);
      controls.target.add(movement); if (storyMode) camera.position.add(movement);
      if (controls.target.distanceTo(focusTarget) < .02) focusTarget = null; needsLabelLayout = true;
    }
    if (desiredZoom !== null) { camera.zoom += (desiredZoom - camera.zoom) * (reducedMotion ? 1 : .09); camera.updateProjectionMatrix(); if (Math.abs(desiredZoom - camera.zoom) < .002) { camera.zoom = desiredZoom; desiredZoom = null; } needsLabelLayout = true; }
    controls.update();
    people.forEach((person, id) => {
      const node = structures.get(id).node, p = PEOPLE[id];
      person.rig.rotation.y = Math.atan2(camera.position.x - node.x - p.x, camera.position.z - node.z - p.z);
      const wave = reducedMotion ? 0 : Math.sin(elapsed * (person.active ? 3.4 : 1.3) + person.phase);
      person.rig.position.y = person.baseY + (reducedMotion ? 0 : Math.sin(elapsed * 1.8 + person.phase) * (person.active && person.mood === 'relief' ? .035 : .012));
      person.head.rotation.z = (person.active ? -.07 : 0) + wave * .018;
      person.leftArm.rotation.z = -.12 - wave * .035;
      person.rightArm.rotation.z = person.active ? (person.mood === 'alert' ? 1.55 : person.mood === 'relief' ? 1.0 : .48) + wave * .12 : .12 + wave * .035;
      person.marker.rotation.y = -person.rig.rotation.y;
    });
    if (!reducedMotion) {
      spinners.forEach(s => { s.object.rotation[s.axis] += dt * s.speed; });
      particles.forEach(p => { const speed = p.route.security ? .1 : p.route.status === 'impacted' ? .025 : .055; p.object.position.copy(p.curve.getPointAt((elapsed * speed + p.phase) % 1)); });
      pulses.forEach(p => { const t = (elapsed * .18 + p.phase) % 1; p.object.scale.setScalar(1 + t * .25); p.object.material.opacity = (1 - t) * (structures.get(p.id).status === 'normal' ? .14 : .45); });
    }
    if (needsLabelLayout) layoutLabels(); renderer.render(scene, camera);
  }
  update(); particles.forEach(p => p.object.position.copy(p.curve.getPointAt(p.phase))); frame = requestAnimationFrame(render);
  return {
    update,
    setStoryMode(enabled = true) {
      storyMode = Boolean(enabled); container.dataset.storyScene = String(storyMode); controls.enabled = !storyMode; pointerStart = null;
      renderer.domElement.style.touchAction = storyMode ? 'pan-y' : 'none';
      renderer.domElement.setAttribute('aria-label', storyMode ? 'PHPの基盤と、そこにつながる会社・工場・物流・医療・暮らしの3Dシーン。' : '中央のPHPランタイムと五つの業務拠点を示す3Dネットワーク。ドラッグで回転、拠点を選択。');
      labels.forEach(({ node, button }) => { button.disabled = storyMode; button.tabIndex = storyMode ? -1 : 0; button.setAttribute('aria-label', storyMode ? node.name : `${node.name}の詳細を表示`); });
      if (!storyMode) storyFocus = null;
      focusTarget = initialTarget.clone(); desiredZoom = 1; updatePeople(); resize();
    },
    focusStory(id = null) {
      const nextId = structures.has(id) ? id : null; if (!storyMode || nextId === storyFocus) return; storyFocus = nextId;
      const node = structures.get(nextId)?.node;
      focusTarget = node ? new THREE.Vector3(node.x * .13, 1.0, node.z * .13) : initialTarget.clone();
      desiredZoom = node ? 1.04 : 1; updatePeople(); needsLabelLayout = true;
    },
    focus(id) { const item = structures.get(id); if (!item) return; update({ selected: id }); focusTarget = new THREE.Vector3(item.node.x * .6, 1.2, item.node.z * .6); desiredZoom = 1.4; },
    reset() { controls.autoRotate = false; camera.position.copy(initialPosition); controls.target.copy(initialTarget); camera.zoom = 1; camera.updateProjectionMatrix(); focusTarget = null; desiredZoom = null; controls.update(); needsLabelLayout = true; },
    zoom(delta) { desiredZoom = THREE.MathUtils.clamp(camera.zoom * (delta > 0 ? 1.18 : .85), controls.minZoom, controls.maxZoom); },
    setRotate(value) { controls.autoRotate = Boolean(value) && !reducedMotion; },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); styleObserver.disconnect(); controls.dispose(); renderer.domElement.removeEventListener('pointerdown', down); renderer.domElement.removeEventListener('pointerup', up);
      const geometries = new Set(), materials = new Set(), textures = new Set([glowTexture, phpTexture]);
      scene.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m)); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); dialogueOverlay.dispose(); renderer.dispose(); renderer.domElement.remove(); labelsRoot.remove(); delete container.dataset.storyScene;
    },
  };
}
