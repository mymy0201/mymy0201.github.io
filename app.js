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
    return;
  }
  const currentProject = document.body.dataset.project;
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
    layout.append(body, sidebar); article.append(layout); document.querySelector('#project-list').append(article);
    const screenshotList = document.querySelector('#screenshot-list');
    const screenshots = (project.screenshots || []).filter(shot => safeImage(shot.src));
    const viewer = document.querySelector('#image-viewer');
    let activeIndex = 0;
    const showImage = index => {
      activeIndex = (index + screenshots.length) % screenshots.length;
      const shot = screenshots[activeIndex];
      const image = document.querySelector('#viewer-image');
      image.src = shot.src;
      image.alt = project.title + ' — ' + shot.caption;
      document.querySelector('#viewer-caption').textContent = shot.caption;
      document.querySelector('#viewer-count').textContent = (activeIndex + 1) + ' / ' + screenshots.length;
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
      document.querySelector('#viewer-close').addEventListener('click', () => viewer.close());
      document.querySelector('#viewer-prev').addEventListener('click', () => showImage(activeIndex - 1));
      document.querySelector('#viewer-next').addEventListener('click', () => showImage(activeIndex + 1));
      viewer.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showImage(activeIndex + (event.key === 'ArrowLeft' ? -1 : 1)); }
      });
      viewer.addEventListener('click', event => { if (event.target === viewer) { const bounds = viewer.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close(); } });
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
    card.append(links, notes); document.querySelector('#download-list').append(card);
  });
})();
