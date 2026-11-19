/**
 * Lightweight Academic Homepage Runtime (assets/js/main.js)
 * Zero dependencies: handles dark/light/system theme with circular View Transition,
 * synchronous pre-paint DOM rendering from SITE_DATA, accessible "+N more authors" toggle,
 * BibSearch filtering, native <dialog> lightbox with top-layer animation fallbacks, & scroll UI.
 */
(function () {
  "use strict";

  const THEME_ICONS = {
    system: "fa-solid fa-circle-half-stroke",
    dark: "fa-solid fa-moon",
    light: "fa-solid fa-sun",
  };

  function prefersReducedMotion() {
    return Boolean(
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem("theme") || "system";
    } catch (_) {
      return "system";
    }
  }

  function setStoredTheme(setting) {
    try {
      if (setting === "system") {
        localStorage.removeItem("theme");
      } else {
        localStorage.setItem("theme", setting);
      }
    } catch (_) {
      // Ignore storage restrictions (e.g. private browsing)
    }
  }

  function resolveEffectiveTheme(setting) {
    if (setting === "dark" || setting === "light") return setting;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyThemeState(setting) {
    const html = document.documentElement;
    const effective = resolveEffectiveTheme(setting);
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.content = setting === "dark" || setting === "light" ? setting : "light dark";
    }
    html.setAttribute("data-theme", effective);
    html.setAttribute("data-theme-setting", setting);

    const iconEl = document.getElementById("theme-icon");
    const btnEl = document.getElementById("light-toggle");
    if (iconEl) iconEl.className = THEME_ICONS[setting] || THEME_ICONS.system;
    if (btnEl) {
      const label = `Theme: ${setting} (click to switch)`;
      btnEl.title = label;
      btnEl.setAttribute("aria-label", label);
    }
    return effective;
  }

  function transitionTheme(nextSetting, originEvent) {
    const html = document.documentElement;
    const prevEffective = html.getAttribute("data-theme") || resolveEffectiveTheme(getStoredTheme());
    const nextEffective = resolveEffectiveTheme(nextSetting);

    if (
      prevEffective === nextEffective ||
      !document.startViewTransition ||
      prefersReducedMotion()
    ) {
      applyThemeState(nextSetting);
      return;
    }

    const btn = document.getElementById("light-toggle");
    let x = window.innerWidth / 2;
    let y = 28;
    if (originEvent && originEvent.detail > 0) {
      x = originEvent.clientX;
      y = originEvent.clientY;
    } else if (btn) {
      const rect = btn.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    html.setAttribute("data-theme-transition", "circle");
    const transition = document.startViewTransition(() => {
      applyThemeState(nextSetting);
    });

    transition.ready
      .then(() => {
        html.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 460,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {});

    transition.finished.finally(() => {
      html.removeAttribute("data-theme-transition");
    });
  }

  function initThemeControls() {
    let setting = getStoredTheme();
    applyThemeState(setting);

    const btn = document.getElementById("light-toggle");
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = "true";
      btn.addEventListener("click", (event) => {
        const order = ["system", "dark", "light"];
        setting = order[(order.indexOf(setting) + 1) % order.length];
        setStoredTheme(setting);
        transitionTheme(setting, event);
      });
    }

    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (getStoredTheme() === "system") {
          applyThemeState("system");
        }
      });
    }

    window.addEventListener("storage", (e) => {
      if (e.key === "theme" || e.key === null) {
        setting = getStoredTheme();
        applyThemeState(setting);
      }
    });
  }

  let supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS?.supports?.("transition-behavior", "allow-discrete") || !document.body) {
      return false;
    }
    const probe = document.createElement("div");
    probe.style.cssText = "transition: display 1s allow-discrete !important; display: block;";
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = "none";
    supportsDisplayTransition = getComputedStyle(probe).display === "block";
    probe.remove();
    return supportsDisplayTransition;
  }

  function supportsTopLayerExit() {
    return Boolean(window.CSS?.supports?.("overlay", "auto") && canTransitionDisplay());
  }

  async function closeTopLayer(dialog) {
    if (!dialog || !dialog.open || dialog.hasAttribute("data-closing")) return;
    if (!supportsTopLayerExit() && !prefersReducedMotion()) {
      dialog.setAttribute("data-closing", "");
      const animations = dialog.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((r) => setTimeout(r, 600)),
        ]);
      }
      if (!dialog.hasAttribute("data-closing")) return;
      dialog.removeAttribute("data-closing");
    }
    if (dialog.open) dialog.close();
  }

  function initNavbarAndScroll() {
    const toggler = document.getElementById("navbar-toggler");
    const collapse = document.getElementById("navbar-collapse");

    async function setMenuOpen(open) {
      if (!toggler || !collapse) return;
      toggler.setAttribute("aria-expanded", String(open));
      if (open) {
        collapse.removeAttribute("data-closing");
        collapse.classList.add("open");
        return;
      }
      if (!collapse.classList.contains("open")) return;
      if (!canTransitionDisplay() && !prefersReducedMotion()) {
        collapse.setAttribute("data-closing", "");
        const animations = collapse.getAnimations();
        if (animations.length > 0) {
          await Promise.race([
            Promise.allSettled(animations.map((a) => a.finished)),
            new Promise((r) => setTimeout(r, 400)),
          ]);
        }
        if (!collapse.hasAttribute("data-closing")) return;
        collapse.removeAttribute("data-closing");
      }
      collapse.classList.remove("open");
    }

    if (toggler && collapse) {
      toggler.addEventListener("click", () => {
        setMenuOpen(!collapse.classList.contains("open"));
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && collapse.classList.contains("open")) {
          setMenuOpen(false);
          toggler.focus();
        }
      });

      document.addEventListener("click", (e) => {
        if (
          collapse.classList.contains("open") &&
          !collapse.contains(e.target) &&
          !toggler.contains(e.target)
        ) {
          setMenuOpen(false);
        }
      });
    }

    const progressBar = document.getElementById("progress-bar");
    const backToTop = document.getElementById("back-to-top");
    const hasNativeScrollTimeline = Boolean(
      window.CSS?.supports?.("animation-timeline", "scroll()")
    );

    function onScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (progressBar && !hasNativeScrollTimeline && !prefersReducedMotion()) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
        progressBar.style.transform = `scaleX(${ratio})`;
      }
      if (backToTop) {
        backToTop.classList.toggle("visible", scrollTop > 260);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      });
    }
  }

  function initLightbox() {
    let dialog = document.getElementById("lightbox-dialog");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "lightbox-dialog";
      dialog.className = "lightbox-dialog";
      dialog.setAttribute("closedby", "any");
      dialog.setAttribute("aria-label", "Publication preview");
      dialog.innerHTML =
        '<button type="button" class="lightbox-close" aria-label="Close preview"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button><img id="lightbox-img" alt="">';
      document.body.appendChild(dialog);
    }

    const closeBtn = dialog.querySelector(".lightbox-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => closeTopLayer(dialog));
    }

    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeTopLayer(dialog);
    });

    if (!("closedBy" in HTMLDialogElement.prototype)) {
      const isOutside = (e) => {
        const r = dialog.getBoundingClientRect();
        return (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        );
      };
      let pressedOutside = false;
      dialog.addEventListener("pointerdown", (e) => {
        pressedOutside = e.target === dialog && isOutside(e);
      });
      dialog.addEventListener("pointerup", (e) => {
        if (pressedOutside && e.target === dialog && isOutside(e)) {
          closeTopLayer(dialog);
        }
        pressedOutside = false;
      });
    }

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-zoomable]");
      if (!trigger) return;
      const sourceImg = trigger.tagName === "IMG" ? trigger : trigger.querySelector("img");
      if (!sourceImg) return;

      const lightboxImg = document.getElementById("lightbox-img");
      if (!lightboxImg) return;

      lightboxImg.src = sourceImg.currentSrc || sourceImg.src;
      lightboxImg.alt = sourceImg.alt || "Publication preview";
      dialog.setAttribute(
        "aria-label",
        sourceImg.alt ? `Preview: ${sourceImg.alt}` : "Publication preview"
      );
      dialog.removeAttribute("data-closing");
      if (!dialog.open) {
        dialog.showModal();
      }
    });
  }

  function initScrollRevealFallback() {
    if (
      prefersReducedMotion() ||
      window.CSS?.supports?.("(animation-timeline: view()) and (animation-range: entry)") ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const items = document.querySelectorAll(".pub-item");
    if (!items.length) return;

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            entry.target.classList.remove("reveal-pending");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top > viewportHeight * 0.96) {
        item.classList.add("reveal-pending");
        observer.observe(item);
      }
    });
  }

  function escapeAttr(str) {
    return String(str || "").replace(/"/g, "&quot;");
  }

  function formatAuthorHtml(name, selfName) {
    return name === selfName ? `<em class="self-author">${name}</em>` : name;
  }

  function renderPublicationItem(pub, data) {
    const limit = data.maxAuthorLimit || 3;
    const selfName = data.selfName || "";
    const shownAuthors = pub.authors.slice(0, limit);
    const hiddenAuthors = pub.authors.slice(limit);

    let authorsHtml = "";
    if (hiddenAuthors.length === 0) {
      if (shownAuthors.length === 1) {
        authorsHtml = formatAuthorHtml(shownAuthors[0], selfName);
      } else if (shownAuthors.length === 2) {
        authorsHtml = `${formatAuthorHtml(shownAuthors[0], selfName)} and ${formatAuthorHtml(shownAuthors[1], selfName)}`;
      } else {
        authorsHtml =
          shownAuthors
            .slice(0, -1)
            .map((a) => formatAuthorHtml(a, selfName))
            .join(", ") + `, and ${formatAuthorHtml(shownAuthors[shownAuthors.length - 1], selfName)}`;
      }
    } else {
      const labelCollapsed = `${hiddenAuthors.length} more author${hiddenAuthors.length > 1 ? "s" : ""}`;
      const labelExpanded =
        hiddenAuthors.length === 1
          ? hiddenAuthors[0]
          : `${hiddenAuthors.slice(0, -1).join(", ")}, and ${hiddenAuthors[hiddenAuthors.length - 1]}`;
      const expandedPrefix = hiddenAuthors.length === 1 ? ", and " : ", ";
      authorsHtml =
        shownAuthors.map((a) => formatAuthorHtml(a, selfName)).join(", ") +
        `<span class="more-authors-prefix">, and </span><span class="more-authors" role="button" tabindex="0" aria-expanded="false" title="Click to view ${escapeAttr(labelCollapsed)}" data-collapsed="${escapeAttr(labelCollapsed)}" data-expanded="${escapeAttr(labelExpanded)}" data-prefix-expanded="${escapeAttr(expandedPrefix)}">${labelCollapsed}</span>`;
    }

    const linksHtml = (pub.links || [])
      .map(
        (l) =>
          `<a href="${l.url}" class="pub-btn" target="_blank" rel="noopener noreferrer">${l.label}</a>`
      )
      .join("");

    const searchBlob = escapeAttr(
      [
        pub.title,
        pub.authors.join(" "),
        pub.venue,
        pub.date,
        pub.abbr,
        String(pub.year || ""),
      ]
        .join(" ")
        .toLowerCase()
    );

    const previewDimensions =
      pub.previewWidth && pub.previewHeight
        ? ` width="${pub.previewWidth}" height="${pub.previewHeight}"`
        : "";

    return `
      <li class="pub-item" data-year="${pub.year}" data-search="${searchBlob}">
        <div class="pub-row">
          <div class="pub-abbr-col">
            ${pub.abbr ? `<abbr class="pub-badge">${pub.abbr}</abbr>` : ""}
            ${
              pub.preview
                ? `<button type="button" class="pub-preview-btn" data-zoomable aria-label="Zoom figure for ${escapeAttr(pub.title)}"><img src="${pub.preview}" alt="${escapeAttr(pub.title)}" class="pub-preview"${previewDimensions} loading="lazy" decoding="async"></button>`
                : ""
            }
          </div>
          <div id="${pub.id}" class="pub-main-col">
            <div class="pub-title">${pub.title}</div>
            <div class="pub-authors">${authorsHtml}</div>
            <div class="pub-periodical"><em>${pub.venue}</em>${pub.date ? `, ${pub.date}` : ""}</div>
            ${linksHtml ? `<div class="pub-links">${linksHtml}</div>` : ""}
          </div>
        </div>
      </li>
    `;
  }

  function toggleMoreAuthors(el) {
    if (el._timer) {
      clearInterval(el._timer);
      el._timer = null;
    }

    const isExpanded = el.getAttribute("aria-expanded") === "true";
    const nextExpanded = !isExpanded;
    const collapsed = el.getAttribute("data-collapsed") || "";
    const expanded = el.getAttribute("data-expanded") || "";
    const targetText = nextExpanded ? expanded : collapsed;
    const prefixEl = el.previousElementSibling;
    if (prefixEl && prefixEl.classList.contains("more-authors-prefix")) {
      prefixEl.textContent = nextExpanded
        ? el.getAttribute("data-prefix-expanded") || ", "
        : ", and ";
    }
    el.setAttribute("aria-expanded", String(nextExpanded));
    el.removeAttribute("title");

    if (prefersReducedMotion()) {
      el.textContent = targetText;
      return;
    }

    let pos = 0;
    el.textContent = "";
    el._timer = setInterval(() => {
      pos += 1;
      el.textContent = targetText.slice(0, pos);
      if (pos >= targetText.length) {
        clearInterval(el._timer);
        el._timer = null;
      }
    }, 10);
  }

  function bindMoreAuthorsAnimation(container) {
    container.addEventListener("click", (e) => {
      const el = e.target.closest(".more-authors");
      if (el) toggleMoreAuthors(el);
    });

    container.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = e.target.closest(".more-authors");
      if (!el) return;
      e.preventDefault();
      toggleMoreAuthors(el);
    });
  }

  function renderNewsTable(items, scrollable) {
    if (!items || items.length === 0) {
      return "<p>No news so far...</p>";
    }
    const rows = items
      .map(
        (n) => `
        <tr>
          <th scope="row">${n.date}</th>
          <td>${n.content}</td>
        </tr>`
      )
      .join("");
    return `
      <div class="news-scroll${scrollable && items.length > 4 ? " scrollable" : ""}"${scrollable && items.length > 4 ? ' tabindex="0" role="region" aria-label="Recent news"' : ""}>
        <table class="news-table">
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderHomePage(data) {
    const root = document.getElementById("about-root");
    if (!root) return;

    const socialsHtml = (data.profile.socials || [])
      .filter((s) => s.url)
      .map(
        (s) =>
          `<a href="${s.url}" title="${escapeAttr(s.title)}" aria-label="${escapeAttr(s.title)}" ${
            s.external ? 'target="_blank" rel="noopener noreferrer"' : ""
          }><i class="${s.icon}" aria-hidden="true"></i></a>`
      )
      .join("");

    const bioHtml = (data.bioParagraphs || []).map((p) => `<p>${p}</p>`).join("");
    const questionsHtml = (data.researchQuestions || []).map((q) => `<li>${q}</li>`).join("");
    const closingHtml = (data.bioClosing || []).map((p) => `<p>${p}</p>`).join("");

    const githubSymbol =
      '<symbol id="icon-github-mark" viewBox="0 0 16 15.6"><path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></symbol>';

    const interestingHtml = (data.interestingItems || [])
      .map((item, idx) => {
        const iconDims =
          item.iconWidth && item.iconHeight
            ? ` width="${item.iconWidth}" height="${item.iconHeight}"`
            : ' width="24" height="24"';
        const ghSvgInner =
          idx === 0
            ? `${githubSymbol}<use href="#icon-github-mark"></use>`
            : '<use href="#icon-github-mark"></use>';
        return `
        <li>
          <img src="${item.icon}" alt="" class="interesting-icon"${iconDims} loading="lazy" decoding="async">
          <strong><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.name}</a>:</strong>
          ${item.description}
          <a href="${item.url}" class="gh-link" target="_blank" rel="noopener noreferrer" aria-label="${escapeAttr(item.name)} GitHub repository"><svg class="gh-icon" width="18" height="17" aria-hidden="true" focusable="false">${ghSvgInner}</svg></a>
        </li>`;
      })
      .join("");

    const newsSlice = data.homeNewsLimit
      ? (data.news || []).slice(0, data.homeNewsLimit)
      : data.news || [];

    const selectedPubs = (data.publications || []).filter((p) => p.selected);
    const avatarDims =
      data.profile.avatarWidth && data.profile.avatarHeight
        ? ` width="${data.profile.avatarWidth}" height="${data.profile.avatarHeight}"`
        : ' width="800" height="600"';

    root.innerHTML = `
      <header class="post-header">
        <h1 class="post-title">
          <span class="brand-morph"><span class="font-weight-bold">${data.profile.firstName}</span> ${data.profile.lastName}</span>
        </h1>
      </header>

      <article>
        <div class="profile float-right">
          <figure>
            <picture>
              <source srcset="${data.profile.avatarWebp480} 480w, ${data.profile.avatarWebp800} 800w" type="image/webp" sizes="(min-width: 930px) 300px, (min-width: 576px) 34vw, 95vw">
              <img src="${data.profile.avatarFallback}" alt="${escapeAttr(data.profile.firstName + " " + data.profile.lastName)}"${avatarDims} fetchpriority="high" decoding="async">
            </picture>
          </figure>
          <div class="social">
            <div class="contact-icons">${socialsHtml}</div>
            ${data.profile.contactNote ? `<div class="contact-note">${data.profile.contactNote}</div>` : ""}
          </div>
        </div>

        <div class="clearfix">
          ${bioHtml}
          <ul>${questionsHtml}</ul>
          ${closingHtml}

          <h2 id="something-interesting">Something Interesting</h2>
          <p>${data.interestingIntro}</p>
          <ul>${interestingHtml}</ul>

          <h2 id="misc">Misc.</h2>
          <p>${data.misc}</p>
        </div>

        <h2 id="news"><a href="/news/" class="section-heading-link">News</a></h2>
        ${renderNewsTable(newsSlice, true)}

        <h2 id="selected-publications"><a href="/publications/" class="section-heading-link">Selected publications</a></h2>
        <div class="publications">
          <ol class="bibliography">
            ${selectedPubs.map((pub) => renderPublicationItem(pub, data)).join("")}
          </ol>
        </div>
      </article>
    `;

    bindMoreAuthorsAnimation(root);
  }

  function renderPublicationsPage(data) {
    const root = document.getElementById("publications-root");
    if (!root) return;

    const pubs = data.publications || [];
    const years = [...new Set(pubs.map((p) => p.year))].sort((a, b) => b - a);

    const groupsHtml = years
      .map((yr) => {
        const items = pubs
          .filter((p) => p.year === yr)
          .map((p) => renderPublicationItem(p, data))
          .join("");
        return `
          <div class="pub-year-group" data-year-group="${yr}">
            <h2 class="bibliography-year">${yr}</h2>
            <ol class="bibliography">${items}</ol>
          </div>
        `;
      })
      .join("");

    root.innerHTML = `${groupsHtml}<p id="bibsearch-empty" class="bibsearch-empty" hidden>No matching publications found.</p>`;
    bindMoreAuthorsAnimation(root);

    const searchInput = document.getElementById("bibsearch");
    const emptyMsg = document.getElementById("bibsearch-empty");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim().toLowerCase();
        const groups = root.querySelectorAll(".pub-year-group");
        let totalVisible = 0;
        groups.forEach((group) => {
          let visibleCount = 0;
          group.querySelectorAll(".pub-item").forEach((item) => {
            const match = !q || item.getAttribute("data-search").includes(q);
            item.hidden = !match;
            if (match) visibleCount += 1;
          });
          group.hidden = visibleCount === 0;
          totalVisible += visibleCount;
        });
        if (emptyMsg) emptyMsg.hidden = totalVisible > 0;
      });
    }
  }

  function renderNewsPage(data) {
    const root = document.getElementById("news-root");
    if (!root) return;
    root.innerHTML = renderNewsTable(data.news || [], false);
  }

  function renderFooter(data) {
    const footerEl = document.getElementById("footer-text");
    if (footerEl && data && data.footerHtml) {
      footerEl.innerHTML = data.footerHtml;
    }
  }

  // Render above-the-fold content synchronously before #view-ready is parsed
  // so Cross-Document View Transitions snapshot stable, populated DOM.
  initThemeControls();
  const data = window.SITE_DATA;
  if (data) {
    renderHomePage(data);
    renderPublicationsPage(data);
    renderNewsPage(data);
    renderFooter(data);
  }

  function onDomReady() {
    renderFooter(window.SITE_DATA);
    initNavbarAndScroll();
    initLightbox();
    initScrollRevealFallback();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDomReady, { once: true });
  } else {
    onDomReady();
  }
})();
