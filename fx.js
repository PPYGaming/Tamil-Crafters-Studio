/* Tap / click particle burst. Light canvas overlay, never blocks clicks. */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(cv);
  var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0;
  function size() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); addEventListener('resize', size);
  var COLORS = ['#fff3c4', '#ffd54a', '#ffffff', '#7ff0e0', '#ffb36b', '#ff9ccf'];
  var parts = [], running = false, last = 0, MAX = 160;
  function burst(x, y) {
    var n = 32;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 260;
      if (parts.length >= MAX) parts.shift();
      parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: 0, max: .55 + Math.random() * .6,
        r: 2.2 + Math.random() * 3.6, c: COLORS[(Math.random() * COLORS.length) | 0], star: Math.random() < .35, rot: Math.random() * 6 });
    }
    parts.push({ ring: true, x: x, y: y, life: 0, max: .45 });
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
  }
  function step(dt) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.life += dt;
      if (p.life >= p.max) { parts.splice(i, 1); continue; }
      var t = p.life / p.max;
      if (p.ring) {
        ctx.globalAlpha = (1 - t) * .7; ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2.5 * (1 - t) + .5;
        ctx.beginPath(); ctx.arc(p.x, p.y, 8 + t * 46, 0, 6.2832); ctx.stroke(); continue;
      }
      p.vx *= 1 - 2.2 * dt; p.vy = p.vy * (1 - 2.2 * dt) + 380 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = 1 - t * t; ctx.fillStyle = p.c; var r = p.r * (1 - .5 * t);
      if (p.star) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + p.life * 6); ctx.beginPath();
        ctx.moveTo(0, -r * 2); ctx.lineTo(r * .6, -r * .6); ctx.lineTo(r * 2, 0); ctx.lineTo(r * .6, r * .6);
        ctx.lineTo(0, r * 2); ctx.lineTo(-r * .6, r * .6); ctx.lineTo(-r * 2, 0); ctx.lineTo(-r * .6, -r * .6); ctx.closePath(); ctx.fill(); ctx.restore(); }
      else { ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill(); }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  function tick(now) {
    var dt = Math.min((now - last) / 1000, .05); last = now; step(dt);
    if (parts.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, W, H); }
  }
  addEventListener('pointerdown', function (e) { burst(e.clientX, e.clientY); }, { passive: true });
  window.TCFX = { demo: function (x, y, ms) { burst(x, y); running = true; for (var t = 0; t < ms; t += 16) step(.016); running = false; } };
})();
