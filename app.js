/* ══════════════════════════════════════════════════════════
   花韵数核 / FLOWERKERNEL — interaction layer
   Vanilla JS. No frameworks, no templates.
   ══════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const doc = document;
  const html = doc.documentElement;
  const $ = (sel, ctx = doc) => ctx.querySelector(sel);
  const $$ = (sel, ctx = doc) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Gate the scroll-reveal initial state: without this script everything stays visible.
  html.classList.add("app-ready");

  /* ────────────────────────────────────────────────────────
     Header · progress bar
     ──────────────────────────────────────────────────────── */
  const header = $("#siteHeader");
  const progressBar = $("#progressBar");
  let scrollTick = false;

  function onScroll() {
    const y = window.scrollY || 0;

    if (header) header.classList.toggle("is-scrolled", y > 12);

    if (progressBar) {
      const max = doc.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    }

    scrollTick = false;
  }

  window.addEventListener("scroll", () => {
    if (!scrollTick) {
      scrollTick = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  onScroll();

  /* ────────────────────────────────────────────────────────
     Mobile menu
     ──────────────────────────────────────────────────────── */
  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");

  function setMenu(open, returnFocus) {
    html.classList.toggle("menu-open", open);
    if (menuBtn) menuBtn.setAttribute("aria-expanded", String(open));
    if (mobileMenu) mobileMenu.setAttribute("aria-hidden", String(!open));
    if (menuBtn) menuBtn.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");

    if (open) {
      const first = mobileMenu && $("a", mobileMenu);
      if (first) window.setTimeout(() => first.focus({ preventScroll: true }), 260);
    } else if (returnFocus && menuBtn) {
      menuBtn.focus({ preventScroll: true });
    }
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      setMenu(!html.classList.contains("menu-open"), false);
    });

    $$("a", mobileMenu).forEach((link) => {
      link.addEventListener("click", () => setMenu(false, false));
    });

    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && html.classList.contains("menu-open")) {
        setMenu(false, true);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960 && html.classList.contains("menu-open")) {
        setMenu(false, false);
      }
    });
  }

  /* ────────────────────────────────────────────────────────
     Hero intro
     ──────────────────────────────────────────────────────── */
  const hero = $(".hero");
  if (hero) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => hero.classList.add("is-ready"));
    });
  }

  /* ────────────────────────────────────────────────────────
     Scroll reveal
     ──────────────────────────────────────────────────────── */
  const revealEls = $$("[data-reveal]");

  function revealAll() {
    revealEls.forEach((el) => el.classList.add("is-revealed"));
  }

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      const group = parent ? $$("[data-reveal]", parent) : [];
      const index = group.indexOf(el);
      if (index > 0) {
        el.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
      }
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ────────────────────────────────────────────────────────
     Count-up stats
     ──────────────────────────────────────────────────────── */
  const counters = $$("[data-count]");

  function runCounter(el) {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    const duration = 1300;
    const start = performance.now();

    const tick = (now) => {
      const p = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (p < 1) window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  }

  if (counters.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      counters.forEach((el) => {
        el.textContent = `${el.dataset.count}${el.dataset.suffix || ""}`;
      });
    } else {
      const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.6 });

      counters.forEach((el) => countObserver.observe(el));
    }
  }

  /* ────────────────────────────────────────────────────────
     Product tabs
     ──────────────────────────────────────────────────────── */
  const tabs = $$(".tab");
  const shotTitle = $("#shotTitle");
  const shotStage = $("#shotStage");
  const shots = $$(".shot__img, .shot__phones");

  function activateShot(key) {
    if (shotStage) shotStage.classList.toggle("is-phone", key === "h5");

    tabs.forEach((tab) => {
      const active = tab.dataset.shot === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && shotTitle) shotTitle.textContent = tab.textContent.trim();
    });

    shots.forEach((shot) => {
      shot.classList.toggle("is-active", shot.dataset.shot === key);
    });
  }

  const initialTab = tabs.find((tab) => tab.classList.contains("is-active"));
  if (initialTab) activateShot(initialTab.dataset.shot);

  tabs.forEach((tab, index) => {
    tab.tabIndex = tab.classList.contains("is-active") ? 0 : -1;

    tab.addEventListener("click", () => activateShot(tab.dataset.shot));

    tab.addEventListener("keydown", (e) => {
      let next = null;

      if (e.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];

      if (next) {
        e.preventDefault();
        next.focus();
        activateShot(next.dataset.shot);
      }
    });
  });

  // Warm the remaining screenshots once the page is idle.
  window.addEventListener("load", () => {
    const sources = new Set();
    shots.forEach((shot) => {
      if (shot.tagName === "IMG") sources.add(shot.src);
      else $$("img", shot).forEach((img) => sources.add(img.src));
    });
    const warm = () => sources.forEach((src) => { const img = new Image(); img.src = src; });
    if ("requestIdleCallback" in window) window.requestIdleCallback(warm, { timeout: 2500 });
    else window.setTimeout(warm, 1200);
  });

  /* ────────────────────────────────────────────────────────
     Browser tilt
     ──────────────────────────────────────────────────────── */
  const browser = $(".browser");
  const visual = $(".hero__visual");

  if (browser && visual && finePointer && !reducedMotion) {
    visual.addEventListener("pointermove", (e) => {
      const rect = visual.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      browser.style.transform =
        `perspective(1400px) rotateY(${(-4 + nx * 5).toFixed(2)}deg) ` +
        `rotateX(${(2 - ny * 4).toFixed(2)}deg) translate3d(${(nx * 7).toFixed(1)}px, ${(ny * 7).toFixed(1)}px, 0)`;
    });

    visual.addEventListener("pointerleave", () => {
      browser.style.transform = "";
    });
  }

  /* ────────────────────────────────────────────────────────
     Copy phone / WeChat
     ──────────────────────────────────────────────────────── */
  const copyBtn = $("[data-copy]");

  function fallbackCopy(text) {
    const area = doc.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    doc.body.appendChild(area);
    area.select();
    try {
      doc.execCommand("copy");
    } catch (err) {
      /* ignore */
    }
    doc.body.removeChild(area);
  }

  if (copyBtn) {
    const original = copyBtn.textContent.trim();
    let resetTimer = 0;

    copyBtn.addEventListener("click", async () => {
      const text = copyBtn.dataset.copy || "";
      let ok = false;

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch (err) {
          ok = false;
        }
      }

      if (!ok) {
        fallbackCopy(text);
        ok = true;
      }

      if (ok) {
        copyBtn.classList.add("is-copied");
        copyBtn.textContent = "已复制";
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          copyBtn.classList.remove("is-copied");
          copyBtn.textContent = original;
        }, 1800);
      }
    });
  }

  /* ────────────────────────────────────────────────────────
     Ambient particle field
     ──────────────────────────────────────────────────────── */
  function initField() {
    const canvas = $("#fxCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const palette = ["111,227,255", "91,157,255", "167,139,255", "238,243,255"];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let rafId = 0;
    let running = false;
    let last = 0;
    let time = 0;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;

    const build = () => {
      const target = Math.round(clamp((width * height) / 24000, 26, 82));
      particles = [];
      for (let i = 0; i < target; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.5 + 0.55,
          alpha: Math.random() * 0.4 + 0.15,
          seed: Math.random() * Math.PI * 2,
          depth: Math.random() * 0.7 + 0.3,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (reducedMotion) draw(0);
    };

    const draw = (dt) => {
      ctx.clearRect(0, 0, width, height);

      const linkDist = Math.min(140, Math.max(96, width * 0.09));

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];

        if (!reducedMotion) {
          a.x += a.vx * dt * 0.06;
          a.y += a.vy * dt * 0.06;

          if (a.x < -20) a.x = width + 20;
          if (a.x > width + 20) a.x = -20;
          if (a.y < -20) a.y = height + 20;
          if (a.y > height + 20) a.y = -20;
        }

        const ax = a.x + px * 14 * a.depth;
        const ay = a.y + py * 14 * a.depth;

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const bx = b.x + px * 14 * b.depth;
          const by = b.y + py * 14 * b.depth;
          const dx = ax - bx;
          const dy = ay - by;
          const dist = Math.hypot(dx, dy);

          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.1;
            ctx.strokeStyle = `rgba(111,227,255,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const x = p.x + px * 14 * p.depth;
        const y = p.y + py * 14 * p.depth;
        const twinkle = reducedMotion ? 1 : 0.62 + 0.38 * Math.sin(time * 0.0007 + p.seed);
        const alpha = clamp(p.alpha * twinkle, 0, 1);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${p.color})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    const loop = (now) => {
      if (!running) return;
      const dt = Math.min(now - last || 16, 48);
      last = now;
      time += dt;

      px += (tx - px) * 0.04;
      py += (ty - py) * 0.04;

      draw(dt);
      rafId = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reducedMotion) return;
      running = true;
      last = performance.now();
      rafId = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(rafId);
    };

    resize();
    if (reducedMotion) {
      draw(0);
    } else {
      start();
    }

    window.addEventListener("resize", resize, { passive: true });

    if (finePointer && !reducedMotion) {
      window.addEventListener("pointermove", (e) => {
        tx = (e.clientX / window.innerWidth) * 2 - 1;
        ty = (e.clientY / window.innerHeight) * 2 - 1;
      }, { passive: true });
    }

    if ("IntersectionObserver" in window && !reducedMotion) {
      const fieldObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !doc.hidden) start();
        else stop();
      }, { threshold: 0 });
      fieldObserver.observe(canvas);
    }

    doc.addEventListener("visibilitychange", () => {
      if (doc.hidden) stop();
      else start();
    });

    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(() => {
        resize();
      });
    }
  }

  try {
    initField();
  } catch (err) {
    // Decorative only — never break the page.
    console.warn("FLOWERKERNEL field unavailable:", err);
  }
})();
