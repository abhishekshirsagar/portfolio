import { getDocument, GlobalWorkerOptions, TouchManager } from '../assets/resume/pdfjs/build/pdf.mjs';
import { EventBus, PDFLinkService, PDFViewer } from '../assets/resume/pdfjs/web/pdf_viewer.mjs';

const assets = new URL('../assets/resume/pdfjs/', import.meta.url);
GlobalWorkerOptions.workerSrc = new URL('build/pdf.worker.mjs', assets).href;

const container = document.getElementById('viewer-container');
const status = document.getElementById('document-status');
const main = document.querySelector('.resume-main');
const zoomIn = document.getElementById('zoom-in');
const zoomOut = document.getElementById('zoom-out');
const fitPage = document.getElementById('fit-page');
const zoomLevel = document.getElementById('zoom-level');
const eventBus = new EventBus();
const linkService = new PDFLinkService({ eventBus, externalLinkTarget: 2 });
const viewer = new PDFViewer({
  container,
  viewer: document.getElementById('viewer'),
  eventBus,
  linkService,
  imageResourcesPath: new URL('web/images/', assets).href,
  maxCanvasPixels: 8 * 1024 * 1024,
});
linkService.setViewer(viewer);

let ready = false;
let fitMode = true;
const minimumZoom = 0.25;
const maximumZoom = 3;

function updateControls() {
  const scale = viewer.currentScale;
  zoomLevel.value = ready ? `${Math.round(scale * 100)}%` : '\u2014';
  zoomIn.disabled = !ready || scale >= maximumZoom;
  zoomOut.disabled = !ready || scale <= minimumZoom;
  fitPage.disabled = !ready;
  fitPage.setAttribute('aria-pressed', String(fitMode));
}

function showError() {
  status.hidden = false;
  status.dataset.error = 'true';
  document.getElementById('status-message').textContent = 'The resume could not be loaded.';
  document.getElementById('fallback-download').hidden = false;
  main.setAttribute('aria-busy', 'false');
  ready = false;
  updateControls();
}

function changeZoom(factor, origin, pan) {
  if (!ready) return;
  fitMode = false;
  const scale = Math.min(maximumZoom, Math.max(minimumZoom, viewer.currentScale * factor));
  if (origin) viewer.updateScale({ scaleFactor: scale / viewer.currentScale, origin, pan, drawingDelay: 100 });
  else viewer.currentScale = scale;
  updateControls();
}

document.addEventListener('wheel', event => {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault();
  if (!container.contains(event.target)) return;
  const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16
    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? container.clientHeight : 1;
  changeZoom(Math.exp(-event.deltaY * unit / 100), [event.clientX, event.clientY]);
}, { passive: false });

if ('GestureEvent' in window) {
  let gestureInDocument = false;
  let previousScale = 1;
  document.addEventListener('gesturestart', event => {
    event.preventDefault();
    gestureInDocument = container.contains(event.target);
    previousScale = event.scale || 1;
  }, { passive: false });
  document.addEventListener('gesturechange', event => {
    event.preventDefault();
    if (!gestureInDocument || !(event.scale > 0)) return;
    const bounds = container.getBoundingClientRect();
    const origin = [
      Number.isFinite(event.clientX) ? event.clientX : bounds.left + bounds.width / 2,
      Number.isFinite(event.clientY) ? event.clientY : bounds.top + bounds.height / 2,
    ];
    changeZoom(event.scale / previousScale, origin);
    previousScale = event.scale;
  }, { passive: false });
  document.addEventListener('gestureend', event => {
    event.preventDefault();
    gestureInDocument = false;
  }, { passive: false });
} else {
  new TouchManager({
    container,
    signal: new AbortController().signal,
    isPinchingDisabled: () => !ready,
    onPinching: (origin, previousDistance, distance, deltaX, deltaY) => {
      changeZoom(distance / previousDistance, origin, [deltaX, deltaY]);
    },
    onPanning: (deltaX, deltaY) => {
      container.scrollLeft -= deltaX;
      container.scrollTop -= deltaY;
    },
  });
}

zoomIn.addEventListener('click', () => changeZoom(1.25));
zoomOut.addEventListener('click', () => changeZoom(1 / 1.25));
fitPage.addEventListener('click', () => {
  fitMode = true;
  viewer.currentScaleValue = 'page-fit';
  updateControls();
});

eventBus.on('pagesinit', () => {
  ready = true;
  viewer.currentScaleValue = 'page-fit';
  updateControls();
});
eventBus.on('scalechanging', updateControls);
eventBus.on('pagerendered', ({ error }) => {
  if (error) return showError();
  status.hidden = true;
  main.setAttribute('aria-busy', 'false');
});

new ResizeObserver(() => {
  if (!ready) return;
  if (fitMode) viewer.currentScaleValue = 'page-fit';
  viewer.update();
}).observe(container);

try {
  const document = await getDocument({
    url: new URL('resume_abhishekshirsagar.pdf', import.meta.url).href,
    cMapUrl: new URL('cmaps/', assets).href,
    cMapPacked: true,
    standardFontDataUrl: new URL('standard_fonts/', assets).href,
    wasmUrl: new URL('wasm/', assets).href,
    isEvalSupported: false,
  }).promise;
  linkService.setDocument(document);
  viewer.setDocument(document);
} catch {
  showError();
}