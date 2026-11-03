(() => {
  'use strict';
  const projects = window.HAKO_PROJECTS || [];
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const safeUrl = value => {
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
  };
  // Optional local banner images; no remote dependencies required.
  const safeImage = value => typeof value === 'string' && /^img\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..') ? value : null;

  /* ── Motion preference check (safe for non-browser/VM environments) ── */
  const prefersMotion = (typeof window !== 'undefined' && typeof window.matchMedia === 'function')
    ? window.matchMedia('(prefers-reduced-motion: no-preference)')
    : { matches: true, addEventListener: () => {} };

  const gallery = document.querySelector('#banners');
  if (gallery) {
    projects.forEach(project => {
      const banner = el('a', 'project-banner banner-' + project.id);
      banner.href = project.page;
      const image = safeImage(project.banner);
      if (image) { const img = el('img', 'banner-image'); img.src = image; img.alt = project.bannerAlt || project.title; img.loading = project.id === projects[0].id ? 'eager' : 'lazy'; img.decoding = 'async'; banner.append(img); }
      const content = el('div', 'banner-content');
      content.append(el('span', 'banner-category', project.category), el('h2', '', project.title), el('span', 'banner-japanese', project.japanese));
      if (project.age) content.append(el('span', 'banner-age', project.age));
      banner.append(content, el('span', 'banner-open', 'Xem dự án →'));
      gallery.append(banner);
    });

    /* ── Interactive features for homepage ── */
    initScrollAnimations();
    initScrollProgress();
    initNavScroll();
    initCursorGlow();

    return;
  }

  /* ════════════════════════════════════════════════════════════
     Detail page logic — project info, screenshots, downloads
     ════════════════════════════════════════════════════════════ */
  const currentProject = document.body && document.body.dataset ? document.body.dataset.project : null;
  const selected = projects.filter(project => project.id === currentProject);
  selected.forEach(project => {
    const article = el('article', 'project'); article.id = project.id;
    const layout = el('div', 'project-layout');
    const body = el('div', 'project-summary');
    body.append(el('h4', '', 'Tóm tắt'), el('p', 'description', project.description), el('h4', '', 'Lưu ý'), el('p', '', project.note));
    const download = el('a', 'text-link', 'Đến phần tải xuống ↓'); download.href = `#download-${project.id}`; body.append(download);
    const sidebar = el('aside', 'side-bar');
    const panel = el('div', 'data-content'); panel.append(el('h4', 'data-title', 'Thông tin'));
    const meta = el('dl', 'metadata');
    [['Tiếng Nhật', project.japanese], ['Thể loại', project.category], ['Phát triển', project.developer], ['Phiên bản dự án', project.version], ...(project.age ? [['Độ tuổi', project.age]] : [])].forEach(([label, value]) => {
      const pair = el('div'); pair.append(el('dt', '', label), el('dd', '', value)); meta.append(pair);
    });
    panel.append(meta); sidebar.append(panel);
    const source = safeUrl(project.sourceUrl);
    if (source) {
      sidebar.append(el('h4', 'article-morelink', 'Các đường dẫn liên quan'));
      const link = el('a', 'source-link', `${project.sourceLabel} ↗`); link.href = source; link.target = '_blank'; link.rel = 'noopener noreferrer'; sidebar.append(link);
    }
    layout.append(body, sidebar); article.append(layout);
    const pList = document.querySelector('#project-list');
    if (pList) pList.append(article);

    const screenshotList = document.querySelector('#screenshot-list');
    const screenshots = (project.screenshots || []).filter(shot => safeImage(shot.src));
    const viewer = document.querySelector('#image-viewer');
    let activeIndex = 0;

    /* ── Feature 7: Image viewer with smooth fluid transition ── */
    const showImage = index => {
      activeIndex = (index + screenshots.length) % screenshots.length;
      const shot = screenshots[activeIndex];
      const image = document.querySelector('#viewer-image');
      if (image) {
        image.src = shot.src;
        image.alt = project.title + ' — ' + shot.caption;
        if (image.classList && prefersMotion.matches) {
          image.classList.remove('viewer-fade-in');
          void image.offsetWidth; // trigger reflow for smooth animation replay
          image.classList.add('viewer-fade-in');
        }
      }
      const caption = document.querySelector('#viewer-caption');
      if (caption) caption.textContent = shot.caption;
      const count = document.querySelector('#viewer-count');
      if (count) count.textContent = (activeIndex + 1) + ' / ' + screenshots.length;
    };

    if (screenshotList) {
      if (!screenshots.length) screenshotList.append(el('p', 'gallery-empty', 'Ảnh chụp trong game sẽ được cập nhật.'));
      screenshots.forEach((shot, index) => {
        const figure = el('figure', 'screenshot-card');
        const link = el('a', 'screenshot-link');
        link.href = shot.src;
        link.setAttribute('aria-label', 'Phóng to: ' + shot.caption);
        const image = el('img'); image.src = shot.src; image.alt = project.title + ' — ' + shot.caption; image.loading = 'lazy'; image.decoding = 'async';
        link.append(image, el('span', 'screenshot-zoom', 'Phóng to ↗'));
        link.addEventListener('click', event => {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !viewer || typeof viewer.showModal !== 'function') return;
          event.preventDefault(); showImage(index); viewer.showModal();
        });
        figure.append(link, el('figcaption', '', shot.caption)); screenshotList.append(figure);
      });
    }
    if (viewer) {
      const vClose = document.querySelector('#viewer-close');
      if (vClose) vClose.addEventListener('click', () => viewer.close());
      const vPrev = document.querySelector('#viewer-prev');
      if (vPrev) vPrev.addEventListener('click', () => showImage(activeIndex - 1));
      const vNext = document.querySelector('#viewer-next');
      if (vNext) vNext.addEventListener('click', () => showImage(activeIndex + 1));
      viewer.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showImage(activeIndex + (event.key === 'ArrowLeft' ? -1 : 1)); }
      });
      viewer.addEventListener('click', event => {
        if (event.target === viewer && typeof viewer.getBoundingClientRect === 'function') {
          const bounds = viewer.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
        }
      });
    }
    const card = el('article', 'download-card'); card.id = `download-${project.id}`;
    card.append(el('p', 'download-project-name', project.title));
    const links = el('div', 'download-links');
    project.downloads.forEach(item => {
      const url = safeUrl(item.url);
      if (url) { const link = el('a', 'download-button', `${item.label} ↗`); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; links.append(link); }
      else { links.append(el('span', 'pending', `${item.label} — Chưa có liên kết`)); }
    });
    const notes = el('div', 'patch-info-content'); notes.append(el('h4', '', 'Thông tin bản phát hành'), el('p', '', `Phiên bản: ${project.version}`), el('p', '', project.releaseNotes));
    (project.changelog || []).forEach(entry => {
      const block = el('section', 'changelog-entry');
      block.append(el('h5', '', entry.title));
      const list = el('ul'); entry.items.forEach(item => list.append(el('li', '', item)));
      block.append(list); notes.append(block);
    });
    const guide = document.querySelector('#project-guide-content');
    if (guide) {
      (project.installation || []).forEach(instruction => {
        const block = el('div', 'installation-step');
        block.append(el('h3', '', instruction.title), el('p', '', instruction.text));
        const url = safeUrl(instruction.url);
        if (url) { const link = el('a', 'text-link', instruction.linkLabel); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; block.append(link); }
        guide.append(block);
      });
      if (project.controls?.length) {
        guide.append(el('h3', 'controls-title', 'Điều khiển mặc định — SRPG Studio'));
        const wrapper = el('div', 'controls-wrapper');
        const table = el('table', 'controls-table');
        const caption = el('caption', '', 'Bàn phím mặc định của engine SRPG');
        const head = el('thead'); const header = el('tr');
        ['Thiết lập', 'Thao tác', 'Phím'].forEach(label => { const cell = el('th', '', label); cell.scope = 'col'; header.append(cell); }); head.append(header);
        const body = el('tbody');
        project.controls.forEach(([setting, action, keys]) => {
          const row = el('tr'); const keyCell = el('td'); keyCell.append(el('kbd', '', keys));
          row.append(el('td', 'control-setting', setting), el('td', '', action), keyCell); body.append(row);
        });
        table.append(caption, head, body); wrapper.append(table); guide.append(wrapper);
      }
    }
    card.append(links, notes);
    const dList = document.querySelector('#download-list');
    if (dList) dList.append(card);
  });

  /* ── Detail-page interactive features ── */
  initScrollAnimations();
  initScrollProgress();
  initNavScroll();
  initHeroParallax();
  initTypingEffect();
  initFaqSmoothToggle();

  /* ══════════════════════════════════════════════════════════════
     MODERN INTERACTION FUNCTIONS
     ══════════════════════════════════════════════════════════════ */

  /**
   * Feature 1 — Scroll-triggered reveal animations via IntersectionObserver.
   */
  function initScrollAnimations() {
    if (typeof document.querySelectorAll !== 'function') return;
    const selectors = [
      '.project-banner',
      '.article',
      '.screenshot-card',
      '.download-card',
      '.data-content',
      '.installation-step',
      '.changelog-entry',
      '.questions details'
    ];

    const targets = document.querySelectorAll(selectors.join(', '));
    if (!targets || !targets.length) return;

    targets.forEach(node => {
      if (typeof node.setAttribute === 'function') node.setAttribute('data-animate', '');
    });

    const banners = document.querySelectorAll('.project-banner');
    if (banners && banners.forEach) {
      banners.forEach((banner, i) => {
        if (banner.classList) banner.classList.add(`stagger-${i + 1}`);
      });
    }

    if (typeof IntersectionObserver !== 'function') {
      targets.forEach(node => {
        if (node.classList) node.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (entry.target.classList) entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(node => observer.observe(node));
  }

  /**
   * Feature 2 — Scroll progress bar.
   */
  function initScrollProgress() {
    if (!document.body || typeof document.body.prepend !== 'function') return;
    const bar = el('div', 'scroll-progress');
    document.body.prepend(bar);

    let ticking = false;
    const update = () => {
      const scrollTop = typeof window !== 'undefined' ? (window.scrollY || 0) : 0;
      const docHeight = (document.documentElement ? document.documentElement.scrollHeight : 0) - (typeof window !== 'undefined' ? (window.innerHeight || 0) : 0);
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      if (document.documentElement && document.documentElement.style) {
        document.documentElement.style.setProperty('--scroll', progress);
      }
      if (bar.style) {
        bar.style.width = `${(progress * 100).toFixed(2)}%`;
      }
      ticking = false;
    };

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('scroll', () => {
        if (!ticking) {
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(update);
          } else {
            update();
          }
          ticking = true;
        }
      }, { passive: true });
    }

    update();
  }

  /**
   * Feature 3 — Smooth parallax on hero artwork.
   */
  function initHeroParallax() {
    if (!prefersMotion || !prefersMotion.matches) return;
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

    const heroImg = document.querySelector('.hero-artwork img');
    if (!heroImg || !heroImg.style) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            const offset = (window.scrollY || 0) * 0.12;
            heroImg.style.transform = `translateY(${offset}px)`;
            ticking = false;
          });
        } else {
          heroImg.style.transform = `translateY(${((window.scrollY || 0) * 0.12)}px)`;
          ticking = false;
        }
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    if (typeof prefersMotion.addEventListener === 'function') {
      prefersMotion.addEventListener('change', e => {
        if (!e.matches) {
          window.removeEventListener('scroll', onScroll);
          heroImg.style.transform = '';
        }
      });
    }
  }

  /**
   * Feature 4 — Nav background transition on scroll.
   */
  function initNavScroll() {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    const nav = document.querySelector('.header-nav');
    if (!nav || !nav.classList) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            nav.classList.toggle('nav-scrolled', (window.scrollY || 0) > 80);
            ticking = false;
          });
        } else {
          nav.classList.toggle('nav-scrolled', (window.scrollY || 0) > 80);
          ticking = false;
        }
        ticking = true;
      }
    }, { passive: true });

    nav.classList.toggle('nav-scrolled', (window.scrollY || 0) > 80);
  }

  /**
   * Feature 5 — Smooth reveal for FAQ <details> elements.
   */
  function initFaqSmoothToggle() {
    if (typeof document.querySelectorAll !== 'function') return;
    const allDetails = document.querySelectorAll('.questions details');
    if (!allDetails || !allDetails.length) return;

    allDetails.forEach(details => {
      if (typeof details.querySelector !== 'function') return;
      const summary = details.querySelector('summary');
      if (!summary) return;

      const wrapper = el('div', 'faq-content-wrapper');
      const inner = el('div', 'faq-content-inner');

      while (summary.nextSibling) {
        inner.append(summary.nextSibling);
      }
      wrapper.append(inner);
      details.append(wrapper);

      if (typeof summary.addEventListener === 'function') {
        summary.addEventListener('click', e => {
          if (typeof e.preventDefault === 'function') e.preventDefault();

          if (details.open) {
            if (details.classList) details.classList.add('faq-closing');
            const onEnd = () => {
              if (typeof wrapper.removeEventListener === 'function') wrapper.removeEventListener('transitionend', onEnd);
              details.open = false;
              if (details.classList) details.classList.remove('faq-closing');
            };
            if (typeof wrapper.addEventListener === 'function') {
              wrapper.addEventListener('transitionend', onEnd);
              setTimeout(onEnd, 380); // reliable fallback
            } else {
              onEnd();
            }
          } else {
            details.open = true;
          }
        });
      }
    });
  }

  /**
   * Feature 6 — Cursor glow effect on homepage banners.
   */
  function initCursorGlow() {
    if (typeof document.querySelectorAll !== 'function') return;
    const banners = document.querySelectorAll('.project-banner');
    if (!banners || !banners.forEach) return;

    banners.forEach(banner => {
      if (typeof banner.addEventListener !== 'function') return;
      banner.addEventListener('mousemove', e => {
        if (typeof banner.getBoundingClientRect !== 'function' || !banner.style) return;
        const rect = banner.getBoundingClientRect();
        banner.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        banner.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });

      banner.addEventListener('mouseleave', () => {
        if (!banner.style) return;
        banner.style.removeProperty('--mouse-x');
        banner.style.removeProperty('--mouse-y');
      });
    });
  }

  /**
   * Feature 8 — Typing effect on the hero <h1> (detail pages only).
   */
  function initTypingEffect() {
    if (!prefersMotion || !prefersMotion.matches) return;
    if (typeof document.querySelector !== 'function') return;

    const hero = document.querySelector('.hero h1, .hero-content h1');
    if (!hero || !hero.classList || !hero.textContent) return;

    const fullText = hero.textContent;
    hero.textContent = '';
    hero.classList.add('typing-active');

    let i = 0;
    const speed = 40; // ms per character

    const type = () => {
      if (i < fullText.length) {
        hero.textContent += fullText.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        hero.classList.remove('typing-active');
        hero.classList.add('typing-done');
      }
    };

    setTimeout(type, 280);

    if (typeof prefersMotion.addEventListener === 'function') {
      prefersMotion.addEventListener('change', e => {
        if (!e.matches) {
          hero.textContent = fullText;
          hero.classList.remove('typing-active');
          hero.classList.add('typing-done');
        }
      });
    }
  }
})();
