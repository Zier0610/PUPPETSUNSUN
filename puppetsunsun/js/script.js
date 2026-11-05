/* ── 設定（頁首三條線旁的齒輪）：轉場開關、轉場音量、首頁 MV 音量、麵包游標 ──
   設定存在瀏覽器裡（localStorage），換頁、下次再來都會記得；其他程式用 window.PS 讀取，變更時發出 'ps-change' 事件 */
(function () {
  var KEY = 'ps-settings';
  var PS = window.PS = { tr: true, trVol: 1, mvVol: 1, cur: true };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || '{}'); for (var k in PS) if (k in saved) PS[k] = saved[k]; } catch (e) {}
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(PS)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('ps-change'));
  }

  // 麵包游標：每次進頁面隨機換一個麵包（image/bread-1～8.png），而且不會跟上一次一樣
  var BREADS = 4, root = document.documentElement, last = 0, pick;
  try { last = +localStorage.getItem('ps-bread') || 0; } catch (e) {}
  do { pick = 1 + Math.floor(Math.random() * BREADS); } while (pick === last && BREADS > 1);
  try { localStorage.setItem('ps-bread', String(pick)); } catch (e) {}
  root.style.setProperty('--bread-cur', 'url("../image/bread-' + pick + '.png") 6 6, auto');
  function applyCursor() { root.classList.toggle('no-bread', !PS.cur); }
  applyCursor();

  var menu = document.querySelector('header .menu');
  if (!menu) return;
  // 把齒輪和三條線包在一起，放在頁首右側
  var right = document.createElement('div'); right.className = 'hd-right';
  menu.parentNode.insertBefore(right, menu);
  var set = document.createElement('div'); set.className = 'set';
  set.innerHTML =
    '<button class="set-btn" type="button" aria-label="設定" aria-expanded="false" aria-controls="setPanel">' +
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>' +
    '</button>' +
    '<div class="set-panel" id="setPanel" role="dialog" aria-label="設定" hidden>' +
      '<p class="set-h">設定</p>' +
      '<label class="set-row"><span>換頁轉場動畫</span><input type="checkbox" class="set-switch" data-k="tr"></label>' +
      '<label class="set-row set-col"><span>轉場音量 <output data-o="trVol"></output></span><input type="range" min="0" max="100" step="5" data-k="trVol"></label>' +
      '<label class="set-row set-col"><span>首頁 MV 音量 <output data-o="mvVol"></output></span><input type="range" min="0" max="100" step="5" data-k="mvVol"></label>' +
      '<label class="set-row"><span>麵包游標</span><input type="checkbox" class="set-switch" data-k="cur"></label>' +
      '<p class="set-note">MV 預設靜音，點左上角喇叭才會出聲<br>麵包游標每次進頁面都會換一種麵包</p>' +
    '</div>';
  right.appendChild(set);
  right.appendChild(menu);

  var btn = set.querySelector('.set-btn'), panel = set.querySelector('.set-panel');
  function sync() {
    set.querySelector('[data-k="tr"]').checked = PS.tr;
    set.querySelector('[data-k="cur"]').checked = PS.cur;
    applyCursor();
    ['trVol', 'mvVol'].forEach(function (k) {
      set.querySelector('[data-k="' + k + '"]').value = Math.round(PS[k] * 100);
      set.querySelector('[data-o="' + k + '"]').textContent = Math.round(PS[k] * 100) + '%';
    });
    set.querySelector('[data-k="trVol"]').disabled = !PS.tr;
    set.classList.toggle('tr-off', !PS.tr);
  }
  sync();
  set.addEventListener('input', function (e) {
    var k = e.target.getAttribute('data-k'); if (!k) return;
    PS[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value / 100;
    sync(); save();
  });

  function open(on) {
    panel.hidden = !on; btn.setAttribute('aria-expanded', String(on));
  }
  btn.addEventListener('click', function () { open(panel.hidden); });
  document.addEventListener('click', function (e) { if (!panel.hidden && !set.contains(e.target)) open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { open(false); btn.focus(); } });
})();

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 文字從上往下淡入
  var sel = 'main h1, main h2, main h3, main p, main li, main dt, main dd, main figcaption, .news-thumb, .news-line, .mv-cap';
  // 角色頁的吊牌有自己的掉落動畫、商店的內容會隨篩選重畫、小測試的卡片自己會滑上來，都不套淡入
  var els = Array.prototype.filter.call(document.querySelectorAll(sel), function (el) { return !el.closest('.hang-stage, .shop, .chp, .qz'); });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el, i) { el.classList.add('reveal'); el.style.setProperty('--rd', (i % 4) * 0.08 + 's'); io.observe(el); });
  }

  // 貼紙：捲到「關於」才像發牌一樣一張張滑下來；位置、角度每次載入都稍微隨機
  // 發牌順序固定：由上往下一排一排、每排由左到右（照貼紙原本的位置排，隨機偏移不會打亂順序）
  var st = document.getElementById('stickers');
  if (st) {
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    var cards = Array.prototype.slice.call(st.querySelectorAll('.st'));
    var base = cards.map(function (c) { return { x: parseFloat(c.style.getPropertyValue('--x')), y: parseFloat(c.style.getPropertyValue('--y')) }; });
    var seq = cards.map(function (_, i) { return i; }).sort(function (a, b) {
      var ra = Math.round(base[a].y / 30), rb = Math.round(base[b].y / 30);   // 每 30% 高度算一排
      return ra - rb || base[a].x - base[b].x;
    });
    var order = []; seq.forEach(function (ci, n) { order[ci] = n; });
    cards.forEach(function (c, i) {
      var cs = c.style;
      var w = parseFloat(cs.getPropertyValue('--w'));
      var x = Math.max(-2, Math.min(100 - w + 2, base[i].x + rnd(-7, 7)));
      var y = Math.max(-2, Math.min(74, base[i].y + rnd(-5, 5)));
      var r = rnd(-13, 13);
      cs.setProperty('--x', x.toFixed(1) + '%');
      cs.setProperty('--y', y.toFixed(1) + '%');
      cs.setProperty('--r', r.toFixed(1) + 'deg');
      cs.setProperty('--r0', (r + rnd(-30, 30)).toFixed(1) + 'deg');
      cs.setProperty('--d', (order[i] * 0.22 + 0.05).toFixed(2) + 's');
    });
    // 牌堆在貼紙區上方正中間：發牌前量好每張到牌堆的距離（px），每張都從同一個點出發
    var deal = function () {
      var box = st.getBoundingClientRect();
      cards.forEach(function (c) {
        var b = c.getBoundingClientRect();
        c.style.setProperty('--sx', Math.round(box.left + box.width / 2 - (b.left + b.width / 2)) + 'px');
        c.style.setProperty('--sy', Math.round(box.top - 80 - (b.top + b.height / 2)) + 'px');
      });
      st.classList.add('in');
    };
    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { deal(); so.disconnect(); } });
      }, { threshold: 0.3 });
      so.observe(st);
    } else { deal(); }
  }

  // 觀看資訊兩側的照片帶：照片隨機排序後放兩輪，往下捲到一半剛好接回開頭，看起來是無限循環
  document.querySelectorAll('.watch-track').forEach(function (t) {
    var list = t.getAttribute('data-photos').split(',').sort(function () { return Math.random() - .5; });
    t.innerHTML = list.concat(list).map(function (p, i) {
      return '<img src="image/' + p.trim() + '.jpg" alt="" loading="lazy" style="--r:' + (i % 2 ? 1.5 : -1.5) + 'deg">';
    }).join('');
  });

  // 最新消息：可以點，但目前不跳頁
  document.querySelectorAll('.news-link').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  // 角色頁：5 秒都沒指到任何角色就顯示提示，指到就收起來，離開後重新計時
  var hint = document.getElementById('hangHint');
  if (hint && window.matchMedia('(hover: hover)').matches) {
    var hintTimer;
    var armHint = function () {
      clearTimeout(hintTimer);
      hintTimer = setTimeout(function () { hint.classList.add('show'); }, 5000);
    };
    document.querySelectorAll('.hang-card').forEach(function (c) {
      c.addEventListener('mouseenter', function () { clearTimeout(hintTimer); hint.classList.remove('show'); });
      c.addEventListener('mouseleave', armHint);
    });
    armHint();
  }

  // MV 聲音開關（瀏覽器規定一開始必須靜音，點喇叭才會出聲）；音量照設定裡的「首頁 MV 音量」
  var v = document.getElementById('mv'), b = document.getElementById('snd');
  if (v && b) {
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    var mvVol = function () { return window.PS ? window.PS.mvVol : 1; };
    document.addEventListener('ps-change', function () { v.volume = mvVol(); });
    b.addEventListener('click', function () {
      v.muted = !v.muted;
      if (!v.muted) { v.volume = mvVol(); v.play(); }
      b.setAttribute('aria-pressed', String(!v.muted));
      b.setAttribute('aria-label', v.muted ? '開啟 MV 聲音' : '關閉 MV 聲音');
    });
  }

  // 角色頁：抓住角色卡左右拖，放開後像鐘擺一樣甩動（支點在繩子頂端）
  var panel = document.querySelector('.hang-panel');
  if (panel) {
    document.querySelectorAll('.hang-card').forEach(function (card) {
      var s = { a: 0, w: 0, drag: false, x0: 0, a0: 0, len: 300, lastX: 0, lastT: 0, moved: 0, raf: 0 };
      card.querySelectorAll('img').forEach(function (img) { img.draggable = false; });

      function pivot() {
        // 支點在繩子露出來的最上端：紙的頂端，或（手機版）上一張卡的底部
        var toTop = card.offsetTop + card.offsetParent.offsetTop;
        var rope = parseFloat(getComputedStyle(card, '::before').height) || toTop;
        s.len = Math.max(100, Math.min(toTop, rope));
        card.style.transformOrigin = '50% ' + (-s.len) + 'px';
      }
      function apply() { card.style.rotate = (s.a * 180 / Math.PI).toFixed(3) + 'deg'; }
      function loop(t0) {
        var last = t0;
        cancelAnimationFrame(s.raf);
        s.raf = requestAnimationFrame(function step(t) {
          var dt = Math.min((t - last) / 1000, 0.032); last = t;
          if (!s.drag) {
            // 鐘擺：回復力和阻尼
            var k = 9.8 / (s.len / 100) * 1.6, c = 2.2;
            s.w += (-k * Math.sin(s.a) - c * s.w) * dt;
            s.a = Math.max(-0.75, Math.min(0.75, s.a + s.w * dt));
            if (Math.abs(s.a) < 0.0005 && Math.abs(s.w) < 0.002) { s.a = 0; s.w = 0; apply(); card.classList.remove('swinging'); return; }
          }
          apply();
          s.raf = requestAnimationFrame(step);
        });
      }

      card.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        pivot();
        s.drag = true; s.x0 = e.clientX; s.a0 = s.a; s.moved = 0; s.w = 0;
        s.lastX = e.clientX; s.lastT = performance.now();
        card.setPointerCapture(e.pointerId);
        card.classList.add('swinging');
        loop(performance.now());
      });
      card.addEventListener('pointermove', function (e) {
        if (!s.drag) return;
        var dx = e.clientX - s.x0;
        s.moved = Math.max(s.moved, Math.abs(dx));
        // 支點在上方，往右拖要逆時針轉（角度為負），卡片才會往右擺
        var target = s.a0 - Math.atan2(dx, s.len);
        s.a = Math.max(-0.6, Math.min(0.6, target));
        apply();
        var now = performance.now(), dtt = (now - s.lastT) / 1000;
        if (dtt > 0.004) {
          // 放開時的甩動速度：取平滑後的值，避免一點點抖動就甩飛
          var inst = -Math.atan2(e.clientX - s.lastX, s.len) / dtt;
          s.w = s.w * 0.6 + inst * 0.4;
          s.lastX = e.clientX; s.lastT = now;
        }
      });
      function release(e) {
        if (!s.drag) return;
        s.drag = false;
        // 停太久才放開就不甩；速度也設上限
        if (performance.now() - s.lastT > 80) s.w = 0;
        s.w = Math.max(-3, Math.min(3, s.w));
        if (card.hasPointerCapture && card.hasPointerCapture(e.pointerId)) card.releasePointerCapture(e.pointerId);
      }
      card.addEventListener('pointerup', release);
      card.addEventListener('pointercancel', release);
      // 有拖動過就不算點擊，不會跳到個人頁
      card.addEventListener('click', function (e) {
        if (s.moved > 6) { e.preventDefault(); e.stopPropagation(); s.moved = 0; }
      }, true);
    });
  }
})();

/* ── 換頁轉場 ＋ 點照片發聲 ── */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 可以在這裡調整轉場的節奏（毫秒）與聲音
  var T = {
    close: 380,       // 藍色從四周縮向中心
    open: 260,        // 中心的圓形缺口打開
    play: 1150,       // 影片從缺口打開到開始收圓圈，總共演多久
    shut: 320,        // 圓圈被藍色收起來
    sound: true       // 轉場影片是否帶聲音（點連結時才會出聲，瀏覽器允許）
  };


  // ① 換頁後：藍色幕往上撤掉
  if (root.classList.contains('tr-in')) {
    var lifted = false;
    var lift = function () {
      if (lifted) return; lifted = true;
      requestAnimationFrame(function () {
        root.classList.add('tr-go');
        setTimeout(function () { root.classList.remove('tr-in', 'tr-go'); }, 700);
      });
    };
    if (document.readyState === 'complete') lift();
    else { window.addEventListener('load', lift); setTimeout(lift, 1800); }
  }
  // 按上一頁回來時（頁面從快取還原），不要停在藍色
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      root.classList.remove('tr-in', 'tr-go');
      var o = document.querySelector('.tr'); if (o) { o.classList.remove('on'); }
      busy = false;
    }
  });

  // ② 建立轉場圖層（影片先預載）
  var busy = false, ov, hole, vid;
  function build() {
    ov = document.createElement('div'); ov.className = 'tr'; ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = '<div class="tr-hole"><video src="image/transition.mp4" playsinline preload="auto"></video></div>';
    document.body.appendChild(ov);
    hole = ov.firstChild; vid = hole.firstChild;
  }
  if (!reduce) { if (document.body) build(); else document.addEventListener('DOMContentLoaded', build); }

  function tween(el, from, to, ms, ease) {
    return new Promise(function (res) {
      var a = el.animate([from, to], { duration: ms, easing: ease, fill: 'forwards' });
      a.onfinish = function () {
        for (var k in to) el.style[k] = to[k];
        a.cancel(); res();
      };
    });
  }
  function size(d, ring) { return { width: d + 'px', height: d + 'px', boxShadow: '0 0 0 ' + ring + 'px #fff, 0 0 0 200vmax var(--bg)' }; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function run(url) {
    busy = true;
    var W = window.innerWidth, H = window.innerHeight;
    var big = Math.hypot(W, H) * 1.06;                 // 大到整個畫面都看得到頁面
    var D = Math.min(Math.min(W, H) * 0.36, 280);      // 中間圓圈的大小（影片原本就不大，縮小才不會糊）
    var ring = 8;

    // 在點擊的當下先「解鎖」聲音，之後才能順利出聲；音量照設定裡的「轉場音量」，0 就直接靜音
    var vol = window.PS ? window.PS.trVol : 1;
    var soundOk = T.sound && vol > 0;
    vid.muted = !soundOk; vid.volume = vol; vid.currentTime = 0;
    try { var p = vid.play(); if (p && p.then) p.then(function () { vid.pause(); vid.currentTime = 0; }, function () { soundOk = false; }); } catch (e) { soundOk = false; }

    hole.classList.remove('show');
    hole.style.width = hole.style.height = big + 'px';
    hole.style.boxShadow = '0 0 0 0 #fff, 0 0 0 200vmax var(--bg)';
    ov.classList.add('on');

    // 1. 藍色從四周縮向中心（頁面看得到的範圍縮成一點）
    tween(hole, size(big, 0), size(0, 0), T.close, 'cubic-bezier(.6,0,.9,.5)')
      .then(function () {
        // 2. 中心跑出圓形缺口，裡面播影片（閉嘴 → 張嘴）
        hole.classList.add('show');
        if (!soundOk) vid.muted = true;
        var pl = vid.play(); if (pl && pl.catch) pl.catch(function () { vid.muted = true; vid.play(); });
        return tween(hole, size(0, 0), size(D, ring), T.open, 'cubic-bezier(.3,1.5,.5,1)');
      })
      .then(function () { return wait(Math.max(0, T.play - T.open)); })
      .then(function () {
        // 3. 圓圈被藍色收起來（聲音同時淡出）
        var fade = setInterval(function () { vid.volume = Math.max(0, vid.volume - 0.15); }, T.shut / 7);
        setTimeout(function () { clearInterval(fade); }, T.shut + 50);
        return tween(hole, size(D, ring), size(0, 0), T.shut, 'cubic-bezier(.6,0,.9,.4)');
      })
      .then(function () {
        // 4. 全藍時換頁；新頁會從藍色開始，再往上撤掉
        vid.pause();
        try { window.name = '__tr'; } catch (e) {}
        window.location.href = url;
      });
  }

  document.addEventListener('click', function (e) {
    // 設定裡關掉轉場時，連結照常直接換頁
    if (window.PS && !window.PS.tr) return;
    if (reduce || busy || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || !ov) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    var raw = a.getAttribute('href');
    if (!raw || raw.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
    if (a.protocol !== location.protocol || a.host !== location.host) return;          // 外部連結不處理
    if (a.pathname === location.pathname && a.search === location.search) return;      // 同一頁的 #錨點照常捲動
    e.preventDefault();
    run(a.href);
  });

  // ③ 點角色照片發出聲音（<figure data-sound="聲音檔">）
  document.querySelectorAll('[data-sound]').forEach(function (el) {
    var au = new Audio(el.getAttribute('data-sound')); au.preload = 'auto';
    function play() {
      try { au.currentTime = 0; var p = au.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
      el.classList.add('used');
      el.classList.remove('squish'); void el.offsetWidth; el.classList.add('squish');
    }
    el.addEventListener('click', play);
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
  });
})();
