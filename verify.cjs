const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
class Element {
  constructor(tag) { this.tag = tag; this.children = []; }
  append(...nodes) { this.children.push(...nodes); }
  setAttribute(key, value) { this[key] = value; }
  addEventListener(type, handler) { (this.events ||= {})[type] = handler; }
  showModal() { this.open = true; }
  close() { this.open = false; }
}
const flatten = node => [node, ...node.children.flatMap(flatten)];
function render(id) {
  const roots = id ? { '#project-list': new Element('div'), '#download-list': new Element('div'), '#project-guide-content': new Element('div'), '#screenshot-list': new Element('div'), '#image-viewer': new Element('dialog'), '#viewer-image': new Element('img'), '#viewer-caption': new Element('p'), '#viewer-count': new Element('span'), '#viewer-close': new Element('button'), '#viewer-prev': new Element('button'), '#viewer-next': new Element('button') } : { '#banners': new Element('main') };
  const context = { window: {}, URL, document: { body: { dataset: { project: id } }, createElement: tag => new Element(tag), querySelector: selector => roots[selector] || null } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('projects.js','utf8'),context);
  vm.runInContext(fs.readFileSync('app.js','utf8'),context);
  return { roots, context };
}
const home = render();
assert.equal(home.roots['#banners'].children.length,3);
const homepage = fs.readFileSync('index.html','utf8');
assert(!homepage.includes('id="downloads"'));
assert(!homepage.includes('id="project-list"'));
for (const project of home.context.window.HAKO_PROJECTS) {
  assert(fs.existsSync(project.page));
  assert(home.roots['#banners'].children.some(node=>node.href===project.page));
  const { roots } = render(project.id);
  assert.equal(roots['#project-list'].children.length,1);
  assert.equal(roots['#download-list'].children.length,1);
  assert.equal(roots['#project-list'].children[0].id,project.id);
  assert.equal(flatten(roots['#download-list']).filter(node=>node.className==='pending').length,project.downloads.filter(item=>!item.url).length);
  const html=fs.readFileSync(project.page,'utf8');
  assert(html.includes(`data-project="${project.id}"`));
  assert(html.includes(`<title>${project.title} — Hako</title>`));
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match=>match[1]));
  for(const root of Object.values(roots)) for(const node of flatten(root)) if(node.id) { assert(!ids.has(node.id)); ids.add(node.id); }
  for(const match of html.matchAll(/href="#([^"]+)"/g)) assert(ids.has(match[1]));
  for(const root of Object.values(roots)) for(const node of flatten(root)) if(node.href?.startsWith('#')) assert(ids.has(node.href.slice(1)));
  assert(html.includes('href="index.html"'));
}
for(const file of ['index.html','vestaria-saga-i-plus.html','kichikuou-rance.html','renalith-saga.html','style.css','app.js','projects.js']) assert(fs.readFileSync(file).equals(fs.readFileSync('dist/'+file)));
console.log('PASS: banners-only homepage, three separate project URLs, isolated content and downloads, page titles, return links, anchors and deployment copies.');
for (const project of home.context.window.HAKO_PROJECTS) {
  assert(project.banner.startsWith('img/'));
  const bytes=fs.readFileSync(project.banner);
  assert(bytes.length>1000);
  assert.equal(bytes[0],255); assert.equal(bytes[1],216);
  assert(bytes.equals(fs.readFileSync('dist/'+project.banner)));
  const html=fs.readFileSync(project.page,'utf8');
  assert(html.includes(`src="${project.banner}"`));
  assert(!html.includes('img/ava.png'));
  assert(!html.includes('header-img-background.jpg'));
  assert(html.includes(project.artworkSource));
}
console.log('PASS: three real local JPEG assets, detail-page images and artwork credits, no unrelated template art, matching deployed images.');

for (const [id, count] of [['vestaria',3],['rance',4],['renalith',0]]) {
  const { roots, context }=render(id);
  const project=context.window.HAKO_PROJECTS.find(p=>p.id===id);
  const cards=roots['#screenshot-list'].children.filter(node=>node.tag==='figure');
  assert.equal(cards.length,count);
  for(const shot of project.screenshots) {
    assert(fs.existsSync(shot.src));
    assert(fs.readFileSync(shot.src).equals(fs.readFileSync('dist/'+shot.src)));
  }
  if (count) {
    let prevented=false;
    cards[0].children[0].events.click({preventDefault(){prevented=true;}});
    assert(prevented); assert(roots['#image-viewer'].open);
    assert.equal(roots['#viewer-image'].src,project.screenshots[0].src);
    roots['#viewer-prev'].events.click();
    assert.equal(roots['#viewer-image'].src,project.screenshots[count-1].src);
    roots['#image-viewer'].events.keydown({key:'ArrowRight',preventDefault(){}});
    assert.equal(roots['#viewer-image'].src,project.screenshots[0].src);
    roots['#viewer-close'].events.click(); assert.equal(roots['#image-viewer'].open,false);
    prevented=false;
    cards[0].children[0].events.click({ctrlKey:true,preventDefault(){prevented=true;}});
    assert.equal(prevented,false);
  } else assert(roots['#screenshot-list'].children.some(node=>node.className==='gallery-empty'));
}
console.log('PASS: 3 Vestaria and 4 Rance screenshots, Renalith empty state, image files, enlarged viewer, previous/next wrap, arrow keys, close and normal new-tab behavior.');

for (const [id, version, fileId] of [['rance','0.8','1A9xwXcG9QFZh2xG1RnI9h0Xfey_6zR2W'],['vestaria','1.0','1FccgbILy9kiOHPJW_T_xcpESbPp9FjqF']]) {
  const { roots, context } = render(id);
  const project = context.window.HAKO_PROJECTS.find(item=>item.id===id);
  assert.equal(project.version,version);
  const nodes=flatten(roots['#download-list']);
  assert(nodes.some(node=>node.tag==='a' && node.href.includes(fileId)));
  assert.equal(nodes.filter(node=>node.className==='changelog-entry').length,project.changelog.length);
  const guide=flatten(roots['#project-guide-content']);
  if(id==='vestaria') {
    assert.equal(guide.filter(node=>node.tag==='kbd').length,15);
    assert(guide.some(node=>node.textContent==='14:51 · 21/10/2026 — Phiên bản 1.0')===false);
  } else {
    assert(guide.some(node=>node.href==='https://github.com/kichikuou/xsystem35-sdl2/releases'));
    assert(guide.some(node=>node.textContent?.includes('xsystem35.exe')));
  }
}
console.log('PASS: verified Drive mapping, release versions, changelog entries, 15 Vestaria controls and Rance PC/Android guide.');
