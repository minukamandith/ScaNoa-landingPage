// ScaNoa landing page interactions
(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Loading screen ----------
     Shows the ScaNoa logo every time the site opens. It stays until the page has fully
     loaded AND the logo animation has played (about 2 seconds), then fades into the site. */
  const intro = document.querySelector(".intro");
  const MIN_SHOW = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 600 : 2000;
  const started = performance.now();
  let introGone = !intro;
  const afterIntro = [];
  function hideIntro() {
    if (introGone) return;
    introGone = true;
    intro.classList.add("is-out");
    document.body.classList.remove("is-loading");
    afterIntro.forEach((fn) => fn());
    setTimeout(() => intro.remove(), 800);
  }
  if (intro) {
    document.body.classList.add("is-loading");
    const onLoaded = () => setTimeout(hideIntro, Math.max(0, MIN_SHOW - (performance.now() - started)));
    if (document.readyState === "complete") onLoaded();
    else window.addEventListener("load", onLoaded, { once: true });
    setTimeout(hideIntro, 6000); // never keep visitors waiting longer than this
  }

  /* ---------- Nav: scrolled state, mobile menu, active link ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("mobile-menu");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    menu.classList.toggle("is-open", !open);
  });
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    })
  );

  const links = [...document.querySelectorAll(".nav__links a")];
  if ("IntersectionObserver" in window) {
    const sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + e.target.id));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((l) => {
      const s = document.querySelector(l.getAttribute("href"));
      if (s) sectionObs.observe(s);
    });

    /* ---------- Reveal on scroll ---------- */
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 90 + "ms";
      if (el.closest(".hero") && !introGone) afterIntro.push(() => revealObs.observe(el));
      else revealObs.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Fit demo ----------
     Sample garment data (finished garment measurements, cm).
     "good" = acceptable ease range (garment minus body) for each zone. */
  const GARMENTS = {
    shirt: {
      name: "Linen shirt",
      sizes: {
        S: { chest: 100, waist: 94, shoulder: 43 },
        M: { chest: 106, waist: 100, shoulder: 45 },
        L: { chest: 112, waist: 106, shoulder: 47 },
        XL: { chest: 118, waist: 112, shoulder: 49 },
      },
      good: { chest: [4, 14], waist: [4, 18], shoulder: [-1, 2.5] },
    },
    tee: {
      name: "Slim T-shirt",
      sizes: {
        S: { chest: 92, waist: 86, shoulder: 42 },
        M: { chest: 98, waist: 92, shoulder: 44 },
        L: { chest: 104, waist: 98, shoulder: 46 },
        XL: { chest: 110, waist: 104, shoulder: 48 },
      },
      good: { chest: [0, 8], waist: [0, 12], shoulder: [-1.5, 2] },
    },
  };
  const ZONES = [
    ["chest", "Chest"],
    ["waist", "Waist"],
    ["shoulder", "Shoulder"],
  ];

  const state = { garment: "shirt", size: "M" };
  const inputs = {
    chest: document.getElementById("chest"),
    waist: document.getElementById("waist"),
    shoulder: document.getElementById("shoulder"),
  };
  const sizeSeg = document.getElementById("sizeSeg");
  const garmentSeg = document.getElementById("garmentSeg");
  const zonesEl = document.getElementById("zones");
  const recoEl = document.getElementById("reco");
  const overallEl = document.getElementById("overall");
  const selItem = document.getElementById("selItem");

  function body() {
    return {
      chest: +inputs.chest.value,
      waist: +inputs.waist.value,
      shoulder: +inputs.shoulder.value,
    };
  }

  function assess(gKey, size, b) {
    const g = GARMENTS[gKey];
    const m = g.sizes[size];
    return ZONES.map(([k, label]) => {
      const ease = m[k] - b[k];
      const [lo, hi] = g.good[k];
      const status = ease < lo ? "tight" : ease > hi ? "loose" : "good";
      const pos = Math.max(3, Math.min(97, 28 + ((ease - lo) / (hi - lo)) * 44));
      return { k, label, ease, status, pos };
    });
  }

  function overall(res) {
    if (res.some((r) => r.status === "tight")) return "tight";
    if (res.some((r) => r.status === "loose")) return "loose";
    return "good";
  }

  function bestSize(gKey, b) {
    let best = null;
    Object.keys(GARMENTS[gKey].sizes).forEach((s) => {
      const res = assess(gKey, s, b);
      const score = res.reduce((n, r) => n + (r.status === "tight" ? 3 : r.status === "loose" ? 1 : 0), 0);
      if (!best || score < best.score) best = { size: s, score };
    });
    return best;
  }

  const LABEL = { good: "Good fit", tight: "Runs tight", loose: "Runs loose" };

  function renderSizes() {
    sizeSeg.innerHTML = "";
    Object.keys(GARMENTS[state.garment].sizes).forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(s === state.size));
      b.dataset.size = s;
      b.textContent = s;
      sizeSeg.appendChild(b);
    });
  }

  function render() {
    const b = body();
    Object.entries(inputs).forEach(([k, el]) => {
      document.getElementById(k + "Out").textContent = el.value;
      el.style.setProperty("--p", ((el.value - el.min) / (el.max - el.min)) * 100 + "%");
    });

    const g = GARMENTS[state.garment];
    const res = assess(state.garment, state.size, b);
    const ov = overall(res);
    selItem.textContent = g.name + " · " + state.size;
    overallEl.className = "pill pill--" + ov;
    overallEl.textContent = LABEL[ov];

    zonesEl.innerHTML = res
      .map(
        (r) => `
      <li>
        <div class="zone__row"><b>${r.label}</b>
          <span><span class="zone__ease">${r.ease > 0 ? "+" : ""}${r.ease} cm</span>
          &nbsp;<span class="pill pill--${r.status}">${LABEL[r.status]}</span></span>
        </div>
        <div class="bar"><span class="bar__dot" style="left:${r.pos}%"></span></div>
      </li>`
      )
      .join("");

    const best = bestSize(state.garment, b);
    if (ov === "good") {
      recoEl.innerHTML = `<b>Size ${state.size} looks right.</b> Comfortable room across chest, waist and shoulders — skip the extra sizes and the queue.`;
    } else if (best.size !== state.size && best.score === 0) {
      recoEl.innerHTML = `<b>Try size ${best.size} instead.</b> Size ${state.size} ${ov === "tight" ? "is likely to feel tight" : "will probably look loose"}; ${best.size} fits well in every area.`;
    } else if (best.size !== state.size) {
      recoEl.innerHTML = `<b>Closest match: size ${best.size}.</b> No size is perfect for these measurements in this cut — you might prefer a different style.`;
    } else {
      recoEl.innerHTML = `<b>${state.size} is the closest size</b>, but this cut isn't ideal for these measurements — you might prefer a different style.`;
    }
  }

  garmentSeg.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    state.garment = btn.dataset.garment;
    garmentSeg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
    renderSizes();
    render();
  });
  sizeSeg.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    state.size = btn.dataset.size;
    sizeSeg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
    render();
  });
  Object.values(inputs).forEach((el) => el.addEventListener("input", render));

  renderSizes();
  render();

  /* ---------- YouTube video (loads only when clicked) ---------- */
  document.querySelectorAll(".video").forEach((box) => {
    const id = (box.dataset.youtubeId || "").trim();
    const btn = box.querySelector(".video__poster");
    if (!id) return; // no video ID set yet: the poster just stays as a visual
    // Use the video's own thumbnail as the poster
    const img = btn.querySelector("img");
    img.src = `https://i.ytimg.com/vi/${encodeURIComponent(id)}/maxresdefault.jpg`;
    img.onerror = () => { img.src = `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`; img.onerror = null; };
    btn.addEventListener("click", () => {
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      f.title = "ScaNoa video";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.allowFullscreen = true;
      box.replaceChildren(f);
    });
  });

  /* ---------- Contact form ----------
     Set data-endpoint on #contactForm (e.g. a Formspree URL) to receive messages directly.
     Without one, submitting opens the visitor's email app with the details pre-filled. */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form__status";
    let ok = true;
    form.querySelectorAll("[required]").forEach((f) => {
      const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value.trim()));
      f.classList.toggle("is-invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      status.textContent = "Please add your name and a valid email.";
      status.classList.add("err");
      return;
    }

    const data = new FormData(form);
    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      const body = [...data.entries()].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
      window.location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent("ScaNoa enquiry")}&body=${encodeURIComponent(body)}`;
      status.textContent = "Opening your email app…";
      status.classList.add("ok");
      return;
    }

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.textContent = "Sending…";
    try {
      const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error();
      form.reset();
      status.textContent = "Thanks! We'll be in touch soon.";
      status.classList.add("ok");
    } catch {
      status.textContent = "Something went wrong. Please email us at " + form.dataset.mailto;
      status.classList.add("err");
    } finally {
      btn.disabled = false;
    }
  });
})();
