/* Background-only motion: the background image drifts and jolts when the phone
   tilts or shakes. Content never moves. Safe no-op where sensors or motion are unavailable. */
(function () {
  var el = document.getElementById('bgm');
  if (!el || !window.addEventListener) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var MAX = 22;                       /* px, stays inside the 28px overscan */
  var tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, jx = 0, jy = 0;
  var base = null, running = false, last = 0, on = false;
  function clamp(v) { return v < -MAX ? -MAX : v > MAX ? MAX : v; }
  function onOri(e) {
    if (e.gamma == null || e.beta == null) return;
    if (!base) base = { g: e.gamma, b: e.beta };
    var g = e.gamma - base.g, b = e.beta - base.b;
    /* slow re-centre so the rest pose is always the middle */
    base.g += g * 0.01; base.b += b * 0.01;
    tx = clamp(-g * 0.6); ty = clamp(-b * 0.6);
    start();
  }
  function onMot(e) {
    var a = e.acceleration || e.accelerationIncludingGravity;
    if (!a || a.x == null) return;
    var k = e.acceleration ? 1.2 : 0.5;
    jx = clamp(jx - a.x * k); jy = clamp(jy + a.y * k);
    vx -= a.x * k * 2; vy += a.y * k * 2;
    start();
  }
  function start() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); } }
  function tick(t) {
    var dt = Math.min((t - last) / 1000, 0.05); last = t;
    /* spring toward tilt target, damped, so shakes settle with a small bounce */
    vx += (tx - x) * 60 * dt; vy += (ty - y) * 60 * dt;
    var d = Math.exp(-7 * dt); vx *= d; vy *= d;
    x = clamp(x + vx * dt); y = clamp(y + vy * dt);
    el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
    if (Math.abs(vx) + Math.abs(vy) + Math.abs(tx - x) + Math.abs(ty - y) > 0.05 && !document.hidden) requestAnimationFrame(tick);
    else running = false;
  }
  function listen() {
    if (on) return; on = true;
    addEventListener('deviceorientation', onOri, { passive: true });
    addEventListener('devicemotion', onMot, { passive: true });
  }
  var DO = window.DeviceOrientationEvent;
  if (!DO) return;
  if (typeof DO.requestPermission === 'function') {   /* iOS: needs a tap, ask once, ignore failure */
    var once = function () {
      removeEventListener('click', once);
      try { DO.requestPermission().then(function (r) { if (r === 'granted') listen(); }).catch(function () {}); } catch (e) {}
    };
    addEventListener('click', once);
  } else listen();
  window.__bgmMotion = function (g, b) { onOri({ gamma: g, beta: b }); };  /* test hook */
})();
