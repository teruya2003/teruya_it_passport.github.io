(function () {
  "use strict";

  function shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function probeImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function applyRandomSupportImages() {
    const targets = Array.from(document.querySelectorAll(".support-random"));
    if (!targets.length) return;

    const supportDir = "%E3%82%B5%E3%83%9D%E3%83%BC%E3%83%88%E9%A2%A8%E6%99%AF";
    const base = `./images/lp-202603/${supportDir}/`;
    const exts = ["png", "jpg", "jpeg", "webp"];
    const candidates = [];

    for (let i = 1; i <= 60; i += 1) {
      exts.forEach((ext) => {
        candidates.push(`${base}${i}.${ext}`);
      });
    }

    for (let i = 1; i <= 20; i += 1) {
      const pad = String(i).padStart(2, "0");
      exts.forEach((ext) => {
        candidates.push(`${base}scene-${pad}.${ext}`);
      });
    }

    const checked = await Promise.all(candidates.map((src) => probeImage(src)));
    const available = checked.filter(Boolean);
    if (!available.length) return;

    const randomized = shuffle(available);
    targets.forEach((img, index) => {
      const selected = randomized[index % randomized.length];
      img.src = selected;
      img.onerror = () => {
        const fallback = img.dataset.fallback;
        if (fallback) img.src = fallback;
      };
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal-target, .offer-wrap, .plan-current").forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });

  applyRandomSupportImages();
})();
