(function(){
  var ID='G-5LL3J79NRG',KEY='dh-analytics-consent';
  function load(){
    if(window.gtag)return;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments)};
    window.gtag('js',new Date());
    window.gtag('config',ID,{anonymize_ip:true});
    var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.appendChild(s);
  }
  function ev(n,p){if(typeof window.gtag==='function')window.gtag('event',n,p)}
  var c=null;try{c=localStorage.getItem(KEY)}catch(e){}
  if(c==='yes')load();
  var b=document.querySelector('[data-analytics-banner]');
  if(b){
    if(c!=='yes'&&c!=='no')b.hidden=false;
    b.addEventListener('click',function(e){
      var v=e.target&&e.target.getAttribute&&e.target.getAttribute('data-consent');
      if(v!=='yes'&&v!=='no')return;
      try{localStorage.setItem(KEY,v)}catch(e){}
      b.hidden=true;if(v==='yes')load();
    });
  }
  document.addEventListener('submit',function(e){
    var f=e.target;if(!(f instanceof HTMLFormElement))return;
    var err=f.querySelector('.err'),bad=null;
    f.querySelectorAll('[required]').forEach(function(i){if(!bad&&!i.checkValidity())bad=i});
    if(bad){
      e.preventDefault();
      if(err){err.hidden=false;err.textContent=bad.getAttribute('data-msg')||'Please fill in this field.';}
      bad.setAttribute('aria-invalid','true');bad.focus();return;
    }
    ev('form_submit',{form:f.getAttribute('data-form')||'form'});
  });
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a,button'):null;if(!a)return;
    if(a.hasAttribute('data-cta'))ev('cta_click',{cta:a.getAttribute('data-cta'),label:(a.textContent||'').trim()});
    if(a.hasAttribute('data-download'))ev('file_download',{file_name:'start-with-one-offer.pdf',link_url:a.href});
    if(a.tagName==='A'&&a.href){try{var u=new URL(a.href,location.origin);if(u.origin!==location.origin&&u.protocol.indexOf('http')===0)ev('outbound_click',{url:u.href,link_text:(a.textContent||'').trim()})}catch(_){}}
  });
})();

/* v6 motion: reveals, counters, tilt/parallax, progress rails, read bar,
   grid parallax, off-screen pausing, Pause motion toggle. Transform/opacity only. */
(function () {
  var root = document.documentElement;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function still() { return mqReduce.matches || root.classList.contains('still'); }

  /* ---- Pause motion (WCAG 2.2.2) ---- */
  var toggle = document.querySelector('[data-motion-toggle]');
  function syncToggle() {
    if (!toggle) return;
    var off = root.classList.contains('still');
    toggle.setAttribute('aria-pressed', off ? 'true' : 'false');
    toggle.textContent = off ? 'Play motion' : 'Pause motion';
  }
  if (toggle) {
    syncToggle();
    toggle.addEventListener('click', function () {
      root.classList.toggle('still');
      try { localStorage.setItem('dh-motion', root.classList.contains('still') ? 'off' : 'on'); } catch (e) {}
      syncToggle();
    });
  }

  /* ---- Reveals: groups stagger via --i, single items reveal alone ---- */
  var targets = [].slice.call(document.querySelectorAll('[data-reveal-group], [data-reveal]:not([data-reveal-group] [data-reveal]), .pb, [data-reveal-group] [data-reveal]'));
  function show(el) { el.classList.add('is-in'); if (el.hasAttribute('data-count')) count(el); el.querySelectorAll && [].forEach.call(el.querySelectorAll('[data-count]'), count); }
  if (!('IntersectionObserver' in window) || mqReduce.matches) {
    root.classList.add('no-io');
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- Counters: final text is in the HTML; we only animate toward it ---- */
  function count(el) {
    if (el.dataset.counted) return; el.dataset.counted = '1';
    var end = parseFloat(el.dataset.count), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    var fmt = function (n) { return pre + Math.round(n).toLocaleString('en-US') + suf; };
    if (still()) { el.textContent = fmt(end); return; }
    var t0 = null, dur = 1400;
    function tick(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(2, -10 * k);
      el.textContent = fmt(k >= 1 ? end : end * e);
      if (k < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---- Scroll-linked work, one rAF loop, eased with lerp ---- */
  var progress = [].slice.call(document.querySelectorAll('[data-progress]'));
  var readbar = document.querySelector('[data-readbar]');
  var article = document.querySelector('.article__body');
  var grid = document.querySelector('.atmos__grid');
  var stages = [].slice.call(document.querySelectorAll('[data-stage]')).map(function (st) {
    return { el: st, tilt: st.querySelector('[data-tilt]'), spot: st.querySelector('[data-spot]'), tx: 0, ty: 0, cx: 0, cy: 0, on: true };
  });
    var pointer = null;
  if (fine) window.addEventListener('pointermove', function (e) { pointer = { x: e.clientX, y: e.clientY }; }, { passive: true });

  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight, sy = window.scrollY, moving = !still(), again = false;

    progress.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = (vh * 0.62 - r.top) / Math.max(r.height, 1);
      el.style.setProperty('--p', still() ? 1 : Math.max(0, Math.min(1, p)).toFixed(3));
    });

    if (readbar && article) {
      var a = article.getBoundingClientRect();
      var rp = (vh * 0.5 - a.top) / Math.max(a.height, 1);
      readbar.style.setProperty('--read', Math.max(0, Math.min(1, rp)).toFixed(4));
      readbar.parentNode.style.setProperty('--read', Math.max(0, Math.min(1, rp)).toFixed(4));
    }

    if (grid && moving) grid.style.setProperty('--grid-y', (-(sy * 0.12) % 56).toFixed(1) + 'px');

    stages.forEach(function (s) {
      if (!s.tilt || !s.on) return;
      var r = s.el.getBoundingClientRect();
      var book = s.tilt.classList.contains('book-tilt');
      if (!moving) { s.tx = s.ty = 0; }
      else if (pointer) {
        var nx = (pointer.x - (r.left + r.width / 2)) / window.innerWidth;
        var ny = (pointer.y - (r.top + r.height / 2)) / vh;
        s.tx = Math.max(-1, Math.min(1, nx * 2)); s.ty = Math.max(-1, Math.min(1, ny * 2));
      } else {
        var c = (r.top + r.height / 2 - vh / 2) / vh;            // -1..1 through the viewport
        s.tx = book ? c * -0.6 : 0; s.ty = Math.max(-1, Math.min(1, c));
      }
      s.cx += (s.tx - s.cx) * 0.08; s.cy += (s.ty - s.cy) * 0.08;
      if (Math.abs(s.tx - s.cx) > 0.002 || Math.abs(s.ty - s.cy) > 0.002) again = true;
      if (s.tilt.getAttribute('data-tilt-mode') === 'flat') {
        s.tilt.style.setProperty('--tx', (s.cx * -8).toFixed(2) + 'px');
        s.tilt.style.setProperty('--ty', (s.cy * -10).toFixed(2) + 'px');
      } else {
        s.tilt.style.setProperty('--ry', (s.cx * 10).toFixed(2) + 'deg');
        s.tilt.style.setProperty('--rx', (s.cy * -7).toFixed(2) + 'deg');
      }
      if (s.spot) { s.spot.style.setProperty('--sx', (s.cx * 18).toFixed(1) + 'px'); s.spot.style.setProperty('--sy', (s.cy * 14).toFixed(1) + 'px'); }
    });
    if (again) request();
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  if (fine) window.addEventListener('pointermove', request, { passive: true });
  request();

  /* ---- Pause ambient loops when their stage is off screen ---- */
  if ('IntersectionObserver' in window) {
    var off = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle('is-off', !e.isIntersecting);
        stages.forEach(function (s) { if (s.el === e.target) s.on = e.isIntersecting; });
      });
    }, { rootMargin: '120px 0px' });
    stages.forEach(function (s) { off.observe(s.el); });
  }
  /* ---- Mobile sticky dock & chrome height (LP root) ---- */
  var dock = document.querySelector('[data-dock]');
  var consentBanner = document.querySelector('[data-analytics-banner]');
  function setChrome() {
    var ch = 0, dh = 0;
    if (consentBanner && !consentBanner.hidden) ch = consentBanner.getBoundingClientRect().height;
    if (dock && !dock.hidden) dh = dock.getBoundingClientRect().height;
    root.style.setProperty('--consent-h', ch + 'px');
    root.style.setProperty('--dock-h', dh + 'px');
  }
  if (consentBanner) consentBanner.addEventListener('click', function () { setTimeout(setChrome, 0); });
  var lpSubmit = document.querySelector('#playbook .submit');
  if (dock && lpSubmit && 'IntersectionObserver' in window) {
    var dio = new IntersectionObserver(function (entries) {
      var visible = entries[0] && entries[0].isIntersecting;
      var wide = window.matchMedia('(min-width:900px)').matches;
      dock.hidden = wide || visible;
      setChrome();
    }, { threshold: 0.6 });
    dio.observe(lpSubmit);
    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width:900px)').matches) { dock.hidden = true; setChrome(); }
    });
  }
  if (dock || document.body.classList.contains('pg-lp')) {
    setChrome();
    window.addEventListener('resize', setChrome);
  }

})();
