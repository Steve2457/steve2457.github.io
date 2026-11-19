/**
 * Lightweight Academic Homepage Runtime (assets/js/main.js)
 * Zero dependencies: handles dark/light/system theme, DOM rendering from SITE_DATA,
 * "+N more authors" typewriter animation, BibSearch filtering, image lightbox, & scroll UI.
 */
(function () {
  "use strict";

  const THEME_ICONS = {
    system: "fa-solid fa-circle-half-stroke",
    dark: "fa-solid fa-moon",
    light: "fa-solid fa-sun",
  };

  function resolveEffectiveTheme(setting) {
    if (setting === "dark" || setting === "light") return setting;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(setting, animate) {
    const html = document.documentElement;
    if (animate) {
      html.classList.add("theme-transition");
      setTimeout(() => html.classList.remove("theme-transition"), 400);
    }
    const effective = resolveEffectiveTheme(setting);
    html.setAttribute("data-theme", effective);
    html.setAttribute("data-theme-setting", setting);

    const iconEl = document.getElementById("theme-icon");
    const btnEl = document.getElementById("light-toggle");
    if (iconEl) iconEl.className = THEME_ICONS[setting] || THEME_ICONS.system;
    if (btnEl) btnEl.title = `Theme: ${setting} (click to switch)`;
  }

  function initThemeControls() {
    let setting = localStorage.getItem("theme") || "system";
    applyTheme(setting, false);

    const btn = document.getElementById("light-toggle");
    if (btn) {
      btn.addEventListener("click", () => {
        const order = ["system", "dark", "light"];
        setting = order[(order.indexOf(setting) + 1) % order.length];
        localStorage.setItem("theme", setting);
        applyTheme(setting, true);
      });
    }

    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if ((localStorage.getItem("theme") || "system") === "system") {
          applyTheme("system", true);
        }
      });
    }
  }

  function initNavbarAndScroll() {
    const toggler = document.getElementById("navbar-toggler");
    const collapse = document.getElementById("navbar-collapse");
    if (toggler && collapse) {
      toggler.addEventListener("click", () => {
        collapse.classList.toggle("open");
      });
    }

    const progressBar = document.getElementById("progress-bar");
    const backToTop = document.getElementById("back-to-top");

    function onScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (progressBar) {
        const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
        progressBar.style.width = `${pct}%`;
      }
      if (backToTop) {
        backToTop.classList.toggle("visible", scrollTop > 260);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function initLightbox() {
    let overlay = document.getElementById("lightbox-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "lightbox-overlay";
      overlay.className = "lightbox-overlay";
      overlay.innerHTML = '<img id="lightbox-img" alt="Preview">';
      document.body.appendChild(overlay);
      overlay.addEventListener("click", () => overlay.classList.remove("active"));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") overlay.classList.remove("active");
      });
    }

    document.addEventListener("click", (e) => {
      const target = e.target.closest("[data-zoomable]");
      if (!target) return;
      const img = document.getElementById("lightbox-img");
      img.src = target.src;
      img.alt = target.alt || "Publication preview";
      overlay.classList.add("active");
    });
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
      const labelExpanded = hiddenAuthors.join(", ");
      authorsHtml =
        shownAuthors.map((a) => formatAuthorHtml(a, selfName)).join(", ") +
        `, and <span class="more-authors" title="Click to view ${labelCollapsed}" data-collapsed="${labelCollapsed}" data-expanded="${labelExpanded}">${labelCollapsed}</span>`;
    }

    const linksHtml = (pub.links || [])
      .map(
        (l) =>
          `<a href="${l.url}" class="pub-btn" target="_blank" rel="noopener noreferrer">${l.label}</a>`
      )
      .join("");

    const searchBlob = [
      pub.title,
      pub.authors.join(" "),
      pub.venue,
      pub.date,
      pub.abbr,
      String(pub.year || ""),
    ]
      .join(" ")
      .toLowerCase()
      .replace(/"/g, "&quot;");

    return `
      <li class="pub-item" data-year="${pub.year}" data-search="${searchBlob}">
        <div class="pub-row">
          <div class="pub-abbr-col">
            ${pub.abbr ? `<abbr class="pub-badge">${pub.abbr}</abbr>` : ""}
            ${
              pub.preview
                ? `<img src="${pub.preview}" alt="${pub.title}" class="pub-preview" data-zoomable loading="lazy">`
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

  function bindMoreAuthorsAnimation(container) {
    container.addEventListener("click", (e) => {
      const el = e.target.closest(".more-authors");
      if (!el) return;
      if (el._timer) clearInterval(el._timer);

      const collapsed = el.getAttribute("data-collapsed");
      const expanded = el.getAttribute("data-expanded");
      const targetText = el.textContent === collapsed ? expanded : collapsed;
      el.removeAttribute("title");

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
      <div class="news-scroll${scrollable && items.length > 4 ? " scrollable" : ""}">
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
          `<a href="${s.url}" title="${s.title}" ${
            s.external ? 'target="_blank" rel="noopener noreferrer"' : ""
          }><i class="${s.icon}"></i></a>`
      )
      .join("");

    const bioHtml = (data.bioParagraphs || []).map((p) => `<p>${p}</p>`).join("");
    const questionsHtml = (data.researchQuestions || []).map((q) => `<li>${q}</li>`).join("");
    const closingHtml = (data.bioClosing || []).map((p) => `<p>${p}</p>`).join("");

    const interestingHtml = (data.interestingItems || [])
      .map(
        (item) => `
        <li>
          <img src="${item.icon}" alt="${item.name}" class="interesting-icon">
          <strong><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.name}</a>:</strong>
          ${item.description}
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="${item.name} GitHub"><i class="fa-brands fa-github gh-icon"></i></a>
        </li>`
      )
      .join("");

    const newsSlice = data.homeNewsLimit
      ? (data.news || []).slice(0, data.homeNewsLimit)
      : data.news || [];

    const selectedPubs = (data.publications || []).filter((p) => p.selected);

    root.innerHTML = `
      <header class="post-header">
        <h1 class="post-title">
          <span class="font-weight-bold">${data.profile.firstName}</span> ${data.profile.lastName}
        </h1>
      </header>

      <article>
        <div class="profile float-right">
          <figure>
            <picture>
              <source srcset="${data.profile.avatarWebp480} 480w, ${data.profile.avatarWebp800} 800w" type="image/webp" sizes="(min-width: 930px) 300px, (min-width: 576px) 34vw, 95vw">
              <img src="${data.profile.avatarFallback}" alt="${data.profile.firstName} ${data.profile.lastName}">
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

        <h2><a href="/news/" class="section-heading-link">News</a></h2>
        ${renderNewsTable(newsSlice, true)}

        <h2><a href="/publications/" class="section-heading-link">Selected publications</a></h2>
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

    root.innerHTML = groupsHtml;
    bindMoreAuthorsAnimation(root);

    const searchInput = document.getElementById("bibsearch");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim().toLowerCase();
        const groups = root.querySelectorAll(".pub-year-group");
        groups.forEach((group) => {
          let visibleCount = 0;
          group.querySelectorAll(".pub-item").forEach((item) => {
            const match = !q || item.getAttribute("data-search").includes(q);
            item.style.display = match ? "" : "none";
            if (match) visibleCount += 1;
          });
          group.style.display = visibleCount > 0 ? "" : "none";
        });
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
    if (footerEl && data.footerHtml) {
      footerEl.innerHTML = data.footerHtml;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initThemeControls();
    initNavbarAndScroll();
    initLightbox();

    const data = window.SITE_DATA;
    if (!data) return;

    renderHomePage(data);
    renderPublicationsPage(data);
    renderNewsPage(data);
    renderFooter(data);
  });
})();
