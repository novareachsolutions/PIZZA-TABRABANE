// Pizza carousel — vertical slide swap every 2s, with manual arrow control.
(() => {
  const track = document.getElementById("pizzaTrack");
  if (!track) return;

  const slides = Array.from(track.querySelectorAll(".pizza-slide"));
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  let current = slides.findIndex((s) => s.classList.contains("is-active"));
  if (current < 0) current = 0;

  const AUTOPLAY_MS = 2000;
  let timer = null;

  const goTo = (next) => {
    if (next === current) return;
    const cur = slides[current];
    const nxt = slides[next];

    cur.classList.remove("is-active");
    cur.classList.add("is-leaving");

    // small delay so the leaving transform applies cleanly before the new one rises
    requestAnimationFrame(() => {
      nxt.classList.remove("is-leaving");
      nxt.classList.add("is-active");
    });

    // clean up the leaving slide's class after its transition finishes
    setTimeout(() => {
      cur.classList.remove("is-leaving");
    }, 900);

    current = next;
  };

  const next = () => goTo((current + 1) % slides.length);
  const prev = () => goTo((current - 1 + slides.length) % slides.length);

  const startAutoplay = () => {
    stopAutoplay();
    timer = setInterval(next, AUTOPLAY_MS);
  };
  const stopAutoplay = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  nextBtn?.addEventListener("click", () => {
    next();
    startAutoplay(); // reset cadence after manual interaction
  });
  prevBtn?.addEventListener("click", () => {
    prev();
    startAutoplay();
  });

  // pause when tab is hidden so the page doesn't churn in the background
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  startAutoplay();
})();

// Reveal-on-scroll for elements with .reveal
(() => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.18 }
  );
  items.forEach((el) => io.observe(el));
})();

// About section: tap-to-play video
(() => {
  const btn = document.querySelector(".about-play-btn");
  const video = document.querySelector(".about-video-el");
  if (!btn || !video) return;

  btn.addEventListener("click", () => {
    if (!video.querySelector("source")?.src) {
      btn.classList.add("is-hidden");
      return;
    }
    video.controls = true;
    video.muted = false;
    video.play().catch(() => {});
    btn.classList.add("is-hidden");
  });
})();

// Stats counter — animates from 0 to data-target when in view
(() => {
  const counters = document.querySelectorAll(".counter");
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.target || "0");
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = target * eased;
      el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animate);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => io.observe(el));
})();

// Testimonials slider
(() => {
  const slider = document.getElementById("testimonialsSlider");
  if (!slider) return;
  const cards = Array.from(slider.querySelectorAll(".t-card"));
  const prev = slider.querySelector(".t-prev");
  const next = slider.querySelector(".t-next");
  const dotsWrap = document.getElementById("testimonialsDots");

  let current = cards.findIndex((c) => c.classList.contains("is-active"));
  if (current < 0) current = 0;

  // build dots
  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "t-dot" + (i === current ? " is-active" : "");
    dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
    dot.addEventListener("click", () => {
      goTo(i);
      restart();
    });
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  const goTo = (idx) => {
    if (idx === current) return;
    cards[current].classList.remove("is-active");
    cards[current].classList.add("is-leaving");
    cards[idx].classList.remove("is-leaving");
    cards[idx].classList.add("is-active");
    dots[current]?.classList.remove("is-active");
    dots[idx]?.classList.add("is-active");
    setTimeout(() => cards[(idx - 1 + cards.length) % cards.length]?.classList.remove("is-leaving"), 600);
    current = idx;
  };

  const goNext = () => goTo((current + 1) % cards.length);
  const goPrev = () => goTo((current - 1 + cards.length) % cards.length);

  let timer = null;
  const start = () => {
    stop();
    timer = setInterval(goNext, 5500);
  };
  const stop = () => {
    if (timer) { clearInterval(timer); timer = null; }
  };
  const restart = () => start();

  next?.addEventListener("click", () => { goNext(); restart(); });
  prev?.addEventListener("click", () => { goPrev(); restart(); });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  start();
})();

// Navbar shadow on scroll
(() => {
  const nav = document.querySelector(".navbar");
  if (!nav) return;
  const onScroll = () => {
    if (window.scrollY > 8) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
