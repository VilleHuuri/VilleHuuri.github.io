(function () {
  const galleryLinks = Array.from(document.querySelectorAll("[data-lightbox]"));
  if (!galleryLinks.length) return;

  const items = galleryLinks.map((a) => ({
    fullJpg: a.getAttribute("href"),
    fullWebp: a.dataset.fullWebp || "",
    alt: (a.querySelector("img") && a.querySelector("img").alt) || "",
    caption: a.dataset.caption || "",
    el: a,
  }));

  const root = document.createElement("div");
  root.className = "lightbox";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Kuvan katselu");
  root.innerHTML = [
    '<button type="button" class="lb-btn lb-close" aria-label="Sulje">&times;</button>',
    '<button type="button" class="lb-btn lb-prev" aria-label="Edellinen kuva">&#8592;</button>',
    '<button type="button" class="lb-btn lb-next" aria-label="Seuraava kuva">&#8594;</button>',
    '<picture><source class="lb-webp" type="image/webp"><img class="lb-img" alt=""></picture>',
    '<p class="lightbox-caption"></p>',
  ].join("");
  document.body.appendChild(root);

  const img = root.querySelector(".lb-img");
  const webp = root.querySelector(".lb-webp");
  const caption = root.querySelector(".lightbox-caption");
  const btnClose = root.querySelector(".lb-close");
  const btnPrev = root.querySelector(".lb-prev");
  const btnNext = root.querySelector(".lb-next");

  let index = 0;
  let lastFocus = null;
  let touchX = null;

  function show(i) {
    index = (i + items.length) % items.length;
    const item = items[index];
    if (item.fullWebp) webp.srcset = item.fullWebp;
    else webp.removeAttribute("srcset");
    img.src = item.fullJpg;
    img.alt = item.alt;
    caption.textContent =
      item.caption + " · " + (index + 1) + " / " + items.length;
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    root.classList.add("is-open");
    document.body.classList.add("lb-open");
    btnClose.focus();
  }

  function close() {
    root.classList.remove("is-open");
    document.body.classList.remove("lb-open");
    img.removeAttribute("src");
    webp.removeAttribute("srcset");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  galleryLinks.forEach((a, i) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      open(i);
    });
  });

  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", () => show(index - 1));
  btnNext.addEventListener("click", () => show(index + 1));

  root.addEventListener("click", (e) => {
    if (e.target === root) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!root.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "Tab") {
      const focusables = [btnClose, btnPrev, btnNext];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  root.addEventListener(
    "touchstart",
    (e) => {
      if (e.changedTouches[0]) touchX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );

  root.addEventListener(
    "touchend",
    (e) => {
      if (touchX == null || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) < 40) return;
      if (dx < 0) show(index + 1);
      else show(index - 1);
    },
    { passive: true }
  );
})();
