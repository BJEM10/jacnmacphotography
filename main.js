/* Jac&Mac Photography — main.js
   Classic script (no modules), one IIFE, every init isolated with safe(). */
(function () {
  "use strict";

  /* -----------------------------------------------------------------
     CALENDLY — the ONLY place to change the booking link.
     TODO: replace with the client's own Calendly URL before launch.
     ----------------------------------------------------------------- */
  var CALENDLY_URL = "https://calendly.com/besquivel1998";
  var CALENDLY_SCRIPT = "https://assets.calendly.com/assets/external/widget.js";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[" + name + "]", e); } }

  /* Header: solid + compact after scrolling ------------------------ */
  function initHeader() {
    var h = $(".site-header");
    if (!h) return;
    var solidAlways = h.hasAttribute("data-solid");
    var ticking = false;
    function update() {
      var y = window.scrollY || window.pageYOffset;
      h.classList.toggle("is-solid", solidAlways || y > 40);
      h.classList.toggle("is-compact", y > 140);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* Mobile full-screen menu --------------------------------------- */
  function initMenu() {
    var btn = $(".burger"), menu = $("#menu");
    if (!btn || !menu) return;
    function set(open) {
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("menu-open", open);
      $(".site-header").classList.toggle("is-solid", open || (window.scrollY > 40));
      if (open) { var first = $("a", menu); if (first) setTimeout(function () { first.focus(); }, 80); }
      else btn.focus();
    }
    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) set(false);
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { if (menu.classList.contains("is-open")) set(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 960 && menu.classList.contains("is-open")) set(false); });
  }

  /* Services dropdown: keyboard + touch friendly -------------------- */
  function initSubnav() {
    $$(".has-sub").forEach(function (li) {
      var t = $("button", li);
      if (!t) return;
      t.addEventListener("click", function () {
        var open = !li.classList.contains("is-open");
        li.classList.toggle("is-open", open);
        t.setAttribute("aria-expanded", String(open));
      });
      li.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { li.classList.remove("is-open"); t.setAttribute("aria-expanded", "false"); t.focus(); }
      });
      document.addEventListener("click", function (e) {
        if (!li.contains(e.target)) { li.classList.remove("is-open"); t.setAttribute("aria-expanded", "false"); }
      });
    });
  }

  /* Reveal on scroll (fade-up + image masks), staggered ------------ */
  function initReveals() {
    var els = $$(".rv, .rv-mask, .step");
    if (!els.length) return;
    // stagger siblings that share a [data-stagger] parent
    $$("[data-stagger]").forEach(function (p) {
      var step = parseInt(p.getAttribute("data-stagger"), 10) || 110;
      $$(".rv, .rv-mask, .step", p).forEach(function (el, i) { el.style.setProperty("--d", (i * step) + "ms"); });
    });
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
    // safety net: nothing stays hidden if the observer misbehaves
    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains("in") && el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
      });
    }, 5000);
  }

  /* Animated counters ---------------------------------------------- */
  function initCounters() {
    var nums = $$("[data-count]");
    if (!nums.length) return;
    function run(el) {
      var end = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (reduced) { el.textContent = end; return; }
      var t0 = null, dur = 1600;
      function tick(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 4); // easeOutQuart
        el.textContent = Math.round(end * e);
        if (p < 1) requestAnimationFrame(tick);
      }
      el.textContent = "0";
      requestAnimationFrame(tick);
    }
    if (!("IntersectionObserver" in window)) { nums.forEach(function (n) { n.textContent = n.getAttribute("data-count"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.3 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* Review carousel: dots + arrows over native scroll-snap ---------- */
  function initCarousels() {
    $$("[data-carousel]").forEach(function (root) {
      var track = $(".rev-track", root);
      var cards = $$(".review", track);
      var dotsBox = $(".dots", root);
      if (!track || !cards.length) return;
      var dots = [];
      if (dotsBox) {
        cards.forEach(function (c, i) {
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute("aria-label", "Show review " + (i + 1) + " of " + cards.length);
          b.addEventListener("click", function () { go(i); });
          dotsBox.appendChild(b); dots.push(b);
        });
      }
      // Own easing: native smooth scrollTo fights scroll-snap in some browsers.
      var anim = 0;
      function scrollToX(x) {
        x = Math.max(0, Math.min(track.scrollWidth - track.clientWidth, x));
        cancelAnimationFrame(anim);
        if (reduced) { track.scrollLeft = x; mark(); return; }
        var from = track.scrollLeft, dist = x - from, t0 = null, dur = 700;
        track.style.scrollSnapType = "none";
        function tick(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          track.scrollLeft = from + dist * e;
          if (p < 1) anim = requestAnimationFrame(tick);
          else { track.style.scrollSnapType = ""; mark(); }
        }
        anim = requestAnimationFrame(tick);
      }
      function posOf(i) { return cards[i].offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft); }
      function go(i) { scrollToX(posOf(Math.max(0, Math.min(cards.length - 1, i)))); }
      function current() {
        var x = track.scrollLeft, best = 0, d = Infinity;
        cards.forEach(function (c, i) {
          var dd = Math.abs(c.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft) - x);
          if (dd < d) { d = dd; best = i; }
        });
        return best;
      }
      function mark() {
        var c = current();
        // at the very end, highlight the last dot
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) c = cards.length - 1;
        dots.forEach(function (b, i) { b.setAttribute("aria-current", i === c ? "true" : "false"); });
      }
      function step(dir) { go(current() + dir); }
      var prev = $(".car-prev", root), next = $(".car-next", root);
      if (prev) prev.addEventListener("click", function () { step(-1); });
      if (next) next.addEventListener("click", function () { step(1); });
      var raf = 0;
      track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(mark); }, { passive: true });
      mark();
    });
  }

  /* Lightbox for [data-gallery] (vanilla, <dialog>) ------------------ */
  function initLightbox() {
    var groups = $$("[data-gallery]");
    if (!groups.length) return;
    var dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.setAttribute("aria-label", "Photo viewer");
    dlg.innerHTML =
      '<div class="lb-bar"><span class="lb-count" aria-live="polite"></span>' +
      '<button class="lb-btn lb-close" type="button" aria-label="Close photo viewer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>' +
      '<div class="lb-stage"><button class="lb-btn lb-prev" type="button" aria-label="Previous photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<img alt="">' +
      '<button class="lb-btn lb-next" type="button" aria-label="Next photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div>' +
      '<p class="lb-cap"></p>';
    document.body.appendChild(dlg);
    var img = $("img", dlg), cap = $(".lb-cap", dlg), count = $(".lb-count", dlg);
    var items = [], idx = 0;
    function show(i) {
      idx = (i + items.length) % items.length;
      var a = items[idx], thumb = $("img", a);
      img.src = a.getAttribute("href");
      img.alt = thumb ? thumb.alt : "";
      cap.textContent = thumb ? thumb.alt : "";
      count.textContent = (idx + 1) + " / " + items.length;
      // re-trigger the fade
      img.style.animation = "none"; void img.offsetWidth; img.style.animation = "";
    }
    groups.forEach(function (g) {
      var links = $$("a", g);
      links.forEach(function (a, i) {
        a.addEventListener("click", function (e) {
          if (typeof dlg.showModal !== "function") return; // old browser: open the file
          e.preventDefault();
          items = links; show(i);
          dlg.showModal();
          document.body.classList.add("menu-open");
        });
      });
    });
    $(".lb-close", dlg).addEventListener("click", function () { dlg.close(); });
    $(".lb-prev", dlg).addEventListener("click", function () { show(idx - 1); });
    $(".lb-next", dlg).addEventListener("click", function () { show(idx + 1); });
    dlg.addEventListener("close", function () { document.body.classList.remove("menu-open"); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.classList.contains("lb-stage")) dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
    // swipe on touch
    var sx = null;
    dlg.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* Calendly: set the URL, load the script only near the viewport ---- */
  function initCalendly() {
    var widgets = $$(".calendly-inline-widget");
    if (!widgets.length) return;
    widgets.forEach(function (w) { w.setAttribute("data-url", CALENDLY_URL); });
    var loaded = false;
    function load() {
      if (loaded) return; loaded = true;
      var s = document.createElement("script");
      s.src = CALENDLY_SCRIPT; s.async = true;
      s.onload = function () {
        widgets.forEach(function (w) {
          var shell = w.closest(".cal-shell");
          // widget.js auto-initialises on load; ensure it for late injection
          if (!w.querySelector("iframe") && window.Calendly && Calendly.initInlineWidget) {
            Calendly.initInlineWidget({ url: CALENDLY_URL, parentElement: w });
          }
          if (shell) setTimeout(function () { shell.classList.add("is-loaded"); }, 600);
        });
      };
      s.onerror = function () {
        widgets.forEach(function (w) {
          var shell = w.closest(".cal-shell");
          var l = shell && $(".cal-loading", shell);
          if (l) l.innerHTML = 'The calendar could not load.<br><a class="link" href="' + CALENDLY_URL + '" target="_blank" rel="noopener">Open the booking page</a>';
        });
      };
      document.body.appendChild(s);
    }
    if (!("IntersectionObserver" in window)) { load(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { load(); io.disconnect(); }
    }, { rootMargin: "900px 0px" });
    widgets.forEach(function (w) { io.observe(w); });
  }

  /* Contact form → mailto (TODO: connect to Formspree or similar) ---- */
  function initContactForm() {
    var f = $("[data-mailto-form]");
    if (!f) return;
    f.addEventListener("submit", function (e) {
      if (f.getAttribute("action") && f.getAttribute("action").indexOf("mailto:") !== 0) return; // real endpoint configured
      e.preventDefault();
      if (!f.reportValidity()) return;
      var d = new FormData(f), lines = [];
      d.forEach(function (v, k) { if (String(v).trim()) lines.push(k + ": " + v); });
      var subject = "Consultation request — " + (d.get("Session type") || "Photography");
      location.href = "mailto:info@jacnmacphotography.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      var ok = $(".form-note", f);
      if (ok) ok.textContent = "Your email app should open with your request. If it doesn't, write to info@jacnmacphotography.com or call 757.502.3737.";
    });
  }

  function boot() {
    safe(initHeader, "initHeader");
    safe(initMenu, "initMenu");
    safe(initSubnav, "initSubnav");
    safe(initReveals, "initReveals");
    safe(initCounters, "initCounters");
    safe(initCarousels, "initCarousels");
    safe(initLightbox, "initLightbox");
    safe(initCalendly, "initCalendly");
    safe(initContactForm, "initContactForm");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
