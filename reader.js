import { PageFlip } from '/vendor/page-flip/page-flip.module.js';
import * as pdfjs from '/vendor/pdfjs/pdf.min.mjs';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const id = params.get('id') || '';
const kind = params.get('kind') === 'folheto' ? 'folhetos' : 'revista';
const title = params.get('title') || 'Publicação Coopercica';
const validId = /^[a-zA-Z0-9-]{1,80}$/.test(id);
const pdfUrl = `/api/publications/${encodeURIComponent(id)}/pdf`;
const shareBase = new URL(`/${kind}/${encodeURIComponent(id)}/folhear`, location.origin);
$('title').textContent = title;
document.title = `${title} — Folhear`;
$('back').href = `/${kind}`;
$('open-pdf').href = pdfUrl;
$('download').href = `${pdfUrl}?download=1`;
pdfjs.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.mjs';
let pdf, flip, current = 0, total = 0, ratio = 1.414, zoom = 1, sound = false, audio;
let disposed = false, renderQueue = Promise.resolve(), firstFlip = true;
const rendered = new Map(), renderedAt = new Map(), pending = new Set(), pageElements = [], thumbImages = [];
let pageCssWidth = 600, renderTimer;
const notice = (text) => { $('notice').textContent = text; };
const start = Math.max(0, Number(params.get('page') || 1) - 1);

function shareUrl() { const url = new URL(shareBase); url.hash = `p=${current + 1}`; return url.href; }
function updateShare() {
  const url = shareUrl();
  $('share-url').value = url;
  $('whatsapp').href = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  $('facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
function fit() {
  if (!flip) return;
  const narrow = $('reader').clientWidth < 700;
  const width = $('scroller').clientWidth - 12, height = $('scroller').clientHeight - 12;
  const bookWidth = Math.max(150, Math.min(width, height / ratio * (narrow ? 1 : 2)));
  flip.getSettings().minWidth = narrow ? 100000 : 1;
  $('book-wrap').style.width = `${bookWidth * zoom}px`;
  pageCssWidth = bookWidth * zoom / (narrow ? 1 : 2);
  flip.getUI().update();
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => { if (!disposed && flip) ensurePages(); }, 250);
}
// Resolução alvo acompanha o tamanho real da página (inclui zoom), com teto para não estourar memória.
function targetWidth() { return Math.round(Math.min(2000, Math.max(900, pageCssWidth * Math.min(devicePixelRatio || 1, 2)))); }
function keepRadius() { return targetWidth() > 1600 ? 4 : 8; }
async function renderPage(index, width) {
  const page = await pdf.getPage(index + 1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: Math.min(width / base.width, 2800 / base.height) });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
  await page.render({ canvas, viewport }).promise;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
  canvas.width = canvas.height = 0;
  page.cleanup();
  if (!blob) throw new Error('Falha ao renderizar a página.');
  return URL.createObjectURL(blob);
}
function ensurePages() {
  const want = targetWidth(), keep = keepRadius(), needed = [];
  for (let i = Math.max(0, current - 2); i < Math.min(total, current + 4); i++) {
    if (pending.has(i)) continue;
    const have = renderedAt.get(i);
    // Renderiza o que falta e refaz páginas cuja resolução ficou baixa (zoom) ou alta demais (memória).
    if (!rendered.has(i) || have < want * .85 || have > want * 1.6) needed.push(i);
  }
  // A small working set avoids decoding an entire large magazine into full-size images.
  for (const [i, url] of rendered) if (Math.abs(i - current) > keep) { URL.revokeObjectURL(url); pageElements[i].querySelector('img')?.remove(); rendered.delete(i); renderedAt.delete(i); }
  needed.sort((a, b) => Math.abs(a - current) - Math.abs(b - current));
  for (const index of needed) {
    pending.add(index);
    renderQueue = renderQueue.then(async () => {
      if (disposed || Math.abs(index - current) > keepRadius()) return;
      const width = targetWidth();
      const url = await renderPage(index, width);
      if (disposed) { URL.revokeObjectURL(url); return; }
      let img = pageElements[index].querySelector('img');
      if (!img) { img = document.createElement('img'); img.alt = `Página ${index + 1} de ${title}`; pageElements[index].append(img); }
      const old = rendered.get(index);
      img.src = url;
      if (old) URL.revokeObjectURL(old);
      rendered.set(index, url); renderedAt.set(index, width);
    }).catch(() => { if (!disposed) notice('Não foi possível mostrar uma página. Você pode abrir o PDF original.'); }).finally(() => pending.delete(index));
  }
}
function update() {
  current = flip.getCurrentPageIndex();
  const spread = flip.getOrientation() === 'landscape' && current > 0 && current < total - 1;
  $('count').textContent = spread ? `Páginas ${current + 1} e ${Math.min(total, current + 2)} de ${total}` : `Página ${current + 1} de ${total}`;
  $('previous').disabled = current === 0;
  $('next').disabled = current + (spread ? 2 : 1) >= total;
  for (const button of $('thumbs').querySelectorAll('button')) {
    const active = Number(button.dataset.page) === current || (spread && Number(button.dataset.page) === current + 1);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  }
  parent.postMessage({ type: 'coopercica-reader-page', id, page: current + 1 }, location.origin);
  updateShare(); ensurePages();
  if (!firstFlip) playSound(); firstFlip = false;
}
function playSound() {
  if (!sound) return;
  try {
    audio ||= new AudioContext(); void audio.resume();
    const buffer = audio.createBuffer(1, audio.sampleRate * 0.2, audio.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i++) channel[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / channel.length) * 0.06;
    const source = audio.createBufferSource(); source.buffer = buffer; source.connect(audio.destination); source.start();
  } catch { /* Reading remains available without audio. */ }
}
async function thumbnails() {
  for (let index = 0; index < total; index++) {
    if (disposed || $('thumbs').hidden) break;
    if (thumbImages[index]) continue;
    try {
      const url = await renderPage(index, 130);
      if (disposed) { URL.revokeObjectURL(url); return; }
      thumbImages[index] = url;
      const img = document.createElement('img'); img.src = url; img.alt = '';
      $('thumbs').children[index].prepend(img);
    } catch { /* Numbered buttons remain usable if a thumbnail fails. */ }
  }
}
async function init() {
  if (!validId) throw new Error('Publicação inválida.');
  pdf = await pdfjs.getDocument({ url: pdfUrl, cMapUrl: '/vendor/pdfjs/cmaps/', cMapPacked: true, standardFontDataUrl: '/vendor/pdfjs/standard_fonts/', wasmUrl: '/vendor/pdfjs/wasm/', isEvalSupported: false }).promise;
  total = pdf.numPages;
  const first = await pdf.getPage(1), viewport = first.getViewport({ scale: 1 });
  ratio = viewport.height / viewport.width;
  for (let i = 0; i < total; i++) {
    const page = document.createElement('div'); page.className = 'pdf-page';
    const label = document.createElement('span'); label.textContent = `Página ${i + 1}`; page.append(label);
    pageElements.push(page); $('book').append(page);
    const thumb = document.createElement('button'); thumb.type = 'button'; thumb.textContent = `Página ${i + 1}`; thumb.dataset.page = String(i);
    thumb.addEventListener('click', () => flip.flip(i)); $('thumbs').append(thumb);
  }
  current = Math.min(total - 1, Number.isFinite(start) ? start : 0);
  flip = new PageFlip($('book'), { width: 420, height: Math.round(420 * ratio), size: 'stretch', minWidth: 1, maxWidth: 6000, minHeight: 100, maxHeight: 9000, showCover: true, usePortrait: true, autoSize: true, startPage: current, drawShadow: true, maxShadowOpacity: .35, flippingTime: matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 700, mobileScrollSupport: true, swipeDistance: 25 });
  flip.on('init', () => { $('loading').hidden = true; fit(); update(); });
  flip.on('flip', update); flip.on('changeOrientation', () => { if (flip.getPageCount()) update(); });
  flip.loadFromHTML(pageElements);
  fit(); update();
  new ResizeObserver(fit).observe($('scroller'));
}
$('previous').onclick = () => flip?.flipPrev(); $('next').onclick = () => flip?.flipNext();
function setZoom(value) { zoom = Math.max(1, Math.min(3, value)); $('zoom').textContent = `${zoom * 100}%`; $('zoom-out').disabled = zoom === 1; $('zoom-in').disabled = zoom === 3; fit(); }
$('zoom-out').onclick = () => setZoom(zoom - .5); $('zoom-in').onclick = () => setZoom(zoom + .5);
$('thumbs-toggle').onclick = () => { $('thumbs').hidden = !$('thumbs').hidden; $('thumbs-toggle').setAttribute('aria-expanded', String(!$('thumbs').hidden)); fit(); if (!$('thumbs').hidden) void thumbnails(); };
$('sound').onclick = () => { sound = !sound; $('sound').setAttribute('aria-pressed', String(sound)); playSound(); };
$('share').onclick = () => { updateShare(); $('share-menu').hidden = !$('share-menu').hidden; $('share').setAttribute('aria-expanded', String(!$('share-menu').hidden)); };
$('copy').onclick = async () => { try { await navigator.clipboard.writeText(shareUrl()); notice('Link copiado.'); } catch { $('share-url').focus(); $('share-url').select(); notice('Selecione e copie o link exibido.'); } };
$('fullscreen').onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await $('reader').requestFullscreen(); } catch { notice('Tela cheia indisponível neste navegador.'); } };
document.addEventListener('fullscreenchange', () => { $('fullscreen').textContent = document.fullscreenElement ? 'Sair da tela cheia' : 'Tela cheia'; fit(); });
document.addEventListener('keydown', (event) => {
  if (event.target.closest('input,textarea,select') || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); flip?.flipPrev(); }
  if (event.key === 'ArrowRight') { event.preventDefault(); flip?.flipNext(); }
  if (event.key === '+' || event.key === '=') setZoom(zoom + .5);
  if (event.key === '-') setZoom(zoom - .5);
  if (event.key === '0') setZoom(1);
  if (event.key === 'Escape') { $('share-menu').hidden = true; $('share').setAttribute('aria-expanded', 'false'); }
});
window.addEventListener('pagehide', () => { disposed = true; flip?.destroy(); void pdf?.destroy(); void audio?.close(); for (const url of [...rendered.values(), ...thumbImages]) if (url) URL.revokeObjectURL(url); });
init().catch(() => { $('loading').textContent = 'Não foi possível abrir o PDF. Tente atualizar ou use “Abrir PDF”.'; });
