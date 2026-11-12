'use strict';
const copy = __COPY__;
const media = window.matchMedia('(max-width: 760px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const tabs = [...document.querySelectorAll('[data-service]')];
const navigationLinks = [...document.querySelectorAll('.main-nav a')];
const pageSections = [...document.querySelectorAll('main > section[id]')];
const runningAnimations = new Set();
let currentLanguage = 'en';
let scrollFramePending = false;
const panelAnimations = new WeakMap();

function animateIn(element, variant = 'rise', delay = 0) {
  const previous = panelAnimations.get(element);
  if (previous) previous.cancel();
  if (reducedMotion.matches || typeof element.animate !== 'function') return;
  // Motion enhances already-readable content; no class ever hides the page.
  let frames = [{opacity: 0, transform: 'translateY(22px)'}, {opacity: 1, transform: 'none'}];
  let duration = 420;
  if (variant === 'unfold') {
    frames = [
      {opacity: 0, transform: 'translateY(22px) scale(.97)', clipPath: 'inset(4% 0 0 0 round 16px)'},
      {opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0 round 16px)'}
    ];
    duration = 480;
  } else if (variant === 'wings') {
    frames = [{opacity: .32, transform: 'scaleX(.6)'}, {opacity: 1, transform: 'none'}];
    duration = 680;
  }
  const animation = element.animate(frames, {duration, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
  panelAnimations.set(element, animation);
  runningAnimations.add(animation);
  animation.finished.then(() => runningAnimations.delete(animation)).catch(() => runningAnimations.delete(animation));
}

function setLanguage(lang) {
  currentLanguage = Object.hasOwn(copy, lang) ? lang : 'en';
  const text = copy[currentLanguage];
  document.documentElement.lang = currentLanguage === 'pt' ? 'pt-BR' : currentLanguage;
  document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i]').forEach(element => { element.innerHTML = text[element.dataset.i]; });
  document.querySelectorAll('[data-aria]').forEach(element => { element.setAttribute('aria-label', text[element.dataset.aria]); });
  document.querySelectorAll('[data-lang]').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.lang === currentLanguage)); });
  document.querySelector('.language-select').value = currentLanguage;
  document.title = text.pageTitle;
  document.querySelector('meta[name="description"]').content = text.metaDescription;
  document.querySelector('meta[property="og:title"]').content = text.pageTitle;
  document.querySelector('meta[property="og:description"]').content = text.metaDescription;
  try { localStorage.setItem('eeco-language', currentLanguage); } catch (_) { /* Language also works without storage. */ }
  queueScrollUpdate();
}

function selectService(tab, focus = false) {
  tabs.forEach(button => {
    const selected = button === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    panel.hidden = !selected;
    if (selected && !focus) animateIn(panel.querySelector('.service-detail'), 'rise');
  });
  if (focus) tab.focus();
  queueScrollUpdate();
}

function updateScrollState() {
  scrollFramePending = false;
  const root = document.documentElement;
  const distance = root.scrollHeight - root.clientHeight;
  const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
  root.style.setProperty('--page-progress', String(progress));
  const growth = document.querySelector('.growth-stages');
  if (growth) {
    const bounds = growth.getBoundingClientRect();
    const travel = (window.innerHeight * .55 - bounds.top) / bounds.height;
    const journeyProgress = reducedMotion.matches ? 1 : Math.max(0, Math.min(1, travel));
    growth.style.setProperty('--growth-progress', String(journeyProgress));
  }
  const threshold = Math.min(window.innerHeight * .4, 260);
  let sectionId = '';
  pageSections.forEach(section => { if (section.getBoundingClientRect().top <= threshold) sectionId = section.id; });
  if (sectionId === 'vision') sectionId = 'approach';
  navigationLinks.forEach(link => {
    if (link.hash === '#' + sectionId) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function queueScrollUpdate() {
  if (scrollFramePending) return;
  scrollFramePending = true;
  requestAnimationFrame(updateScrollState);
}
function setOrientation() {
  document.querySelector('.service-tabs').setAttribute('aria-orientation', 'horizontal');
  queueScrollUpdate();
}

document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
document.querySelector('.language-select').addEventListener('change', event => setLanguage(event.target.value));
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectService(tab));
  tab.addEventListener('keydown', event => {
    let next = index;
    const rtl = currentLanguage === 'ar';
    if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) next = (index + 1) % tabs.length;
    else if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectService(tabs[next], true);
  });
});
window.addEventListener('scroll', queueScrollUpdate, {passive: true});
window.addEventListener('resize', queueScrollUpdate);
window.addEventListener('load', queueScrollUpdate);
media.addEventListener('change', setOrientation);
if ('ResizeObserver' in window) new ResizeObserver(queueScrollUpdate).observe(document.body);
reducedMotion.addEventListener('change', event => { if (event.matches) runningAnimations.forEach(animation => animation.finish()); queueScrollUpdate(); });
document.addEventListener('focusin', () => runningAnimations.forEach(animation => {
  if (animation.effect?.target?.contains(document.activeElement)) animation.finish();
}));
setOrientation();
let savedLanguage = 'en';
try { savedLanguage = localStorage.getItem('eeco-language') || 'en'; } catch (_) { /* English is the default. */ }
setLanguage(savedLanguage);

if ('IntersectionObserver' in window) {
  const reveals = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      element.dataset.revealed = 'true';
      const siblings = [...element.parentElement.children].filter(child => child.hasAttribute('data-reveal'));
      const delay = Math.min(siblings.indexOf(element), 2) * 70;
      animateIn(element, element.dataset.reveal, Math.max(0, delay));
      reveals.unobserve(element);
    });
  }, {threshold: .12, rootMargin: '0px 0px -4% 0px'});
  document.querySelectorAll('[data-reveal]').forEach(element => reveals.observe(element));
}

// Native dialogs provide keyboard dismissal, focus containment and focus return.
const serviceDialog = document.getElementById('service-dialog');
const materialsDialog = document.getElementById('materials-dialog');
const carmenDialog = document.getElementById('carmen-dialog');
let quickServiceIndex = 0;
const serviceKeys = ['strategyItem1','strategyItem2','strategyItem3','brandItem1','brandItem2','brandItem3','digitalItem1','digitalItem2','digitalItem3'];
const whatsappNumber = '5511910088410';
function whatsappUrl(message) {
  return 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message);
}
function updateQuickCard() {
  const words = copy[currentLanguage];
  const title = words[serviceKeys[quickServiceIndex]];
  document.getElementById('quick-title').textContent = title;
  document.getElementById('quick-description').textContent = words.serviceDetails[quickServiceIndex][0];
  document.getElementById('quick-deliverable').textContent = words.serviceDetails[quickServiceIndex][1];
  document.getElementById('quick-contact').href = whatsappUrl(words.contactCta + ' — ' + title);
}
document.querySelectorAll('[data-quick]').forEach(button => button.addEventListener('click', () => {
  quickServiceIndex = Number(button.dataset.quick);
  document.getElementById('quick-icon').replaceChildren(button.querySelector('svg').cloneNode(true));
  updateQuickCard();
  serviceDialog.showModal();
}));
document.querySelectorAll('[data-open-materials]').forEach(button => button.addEventListener('click', () => materialsDialog.showModal()));
document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
[serviceDialog, materialsDialog, carmenDialog].forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
}));
const materialForm = document.getElementById('materials-form');
function updateRequest() {
  const data = new FormData(materialForm);
  const words = copy[currentLanguage];
  const fields = [['customer','fieldName'],['business','fieldBusiness'],['material','fieldMaterial'],['quantity','fieldQuantity'],['printing','fieldPrinting'],['artwork','fieldArtwork'],['location','fieldLocation'],['deadline','fieldDeadline'],['notes','fieldNotes']];
  const lines = fields.map(([name,key]) => {
    const control = materialForm.elements.namedItem(name);
    const value = control.tagName === 'SELECT' && control.value ? control.selectedOptions[0].textContent : String(data.get(name) || '').trim();
    return value ? words[key].replace(' *','') + ': ' + value : '';
  }).filter(Boolean);
  materialForm.dataset.whatsapp = whatsappUrl('eeco materials\n\n' + lines.join('\n'));
}
materialForm.addEventListener('input', updateRequest);
materialForm.addEventListener('change', updateRequest);
materialForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!materialForm.reportValidity()) return;
  updateRequest();
  window.open(materialForm.dataset.whatsapp, '_blank', 'noopener,noreferrer');
});
function updateNewContent() {
  document.querySelectorAll('[data-placeholder]').forEach(element => {element.placeholder = copy[currentLanguage][element.dataset.placeholder];});
  document.querySelectorAll('.agency-contact').forEach(link => { link.href = whatsappUrl(copy[currentLanguage].contactCta); });
  updateQuickCard();
  updateRequest();
}
// Refresh dynamic content alongside the existing language controls.
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', updateNewContent));
document.querySelector('.language-select').addEventListener('change', updateNewContent);
updateNewContent();
const heroVisual = document.querySelector('.hero-visual');
const orbitObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  entry.target.classList.toggle('is-visible', entry.isIntersecting);
}), {threshold:.2});
orbitObserver.observe(heroVisual);

// Native touch scrolling and mouse dragging share one scroll-snap gallery.
const lampTrack = document.getElementById('lamp-track');
const lampSlides = [...lampTrack.querySelectorAll('.lamp-slide')];
const lampThumbs = [...document.querySelectorAll('[data-lamp-index]')];
const lampPrevious = document.querySelector('[data-lamp-step="-1"]');
const lampNext = document.querySelector('[data-lamp-step="1"]');
const lampCaption = document.getElementById('lamp-caption');
const lampCount = document.getElementById('lamp-count');
let lampIndex = 0;
let lampDrag = null;
let lampScrollTimer;

function updateLampGallery() {
  const words = copy[currentLanguage];
  document.querySelectorAll('[data-lamp-alt]').forEach(image => {
    image.alt = words.lampPhotos[Number(image.dataset.lampAlt)];
  });
  lampSlides.forEach((slide, index) => slide.setAttribute('aria-hidden', String(index !== lampIndex)));
  lampThumbs.forEach((button, index) => {
    button.setAttribute('aria-label', words.lampThumbnailLabel + words.lampPhotos[index]);
    if (index === lampIndex) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  const position = String(lampIndex + 1).padStart(2, '0') + ' / ' + lampSlides.length;
  if (lampCount.textContent !== position) lampCount.textContent = position;
  lampCount.setAttribute('aria-label', words.lampCountLabel.replace('{current}', String(lampIndex + 1)).replace('{total}', String(lampSlides.length)));
  lampCaption.textContent = words.lampPhotos[lampIndex];
  lampPrevious.disabled = lampIndex === 0;
  lampNext.disabled = lampIndex === lampSlides.length - 1;
  document.querySelector('.lamp-contact').href = whatsappUrl(words.lampEnquiry + '\n\n' + words.lampSelected + words.lampPhotos[lampIndex]);
  [lampIndex - 1, lampIndex, lampIndex + 1].forEach(index => {
    if (lampSlides[index] && carmenDialog.open) lampSlides[index].querySelector('img').loading = 'eager';
  });
}

function selectLamp(index, smooth = true) {
  lampIndex = Math.max(0, Math.min(lampSlides.length - 1, index));
  lampTrack.scrollTo({left: lampIndex * lampTrack.clientWidth, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant'});
  updateLampGallery();
  const thumb = lampThumbs[lampIndex];
  const strip = thumb.parentElement;
  if (thumb.offsetLeft < strip.scrollLeft || thumb.offsetLeft + thumb.offsetWidth > strip.scrollLeft + strip.clientWidth) {
    strip.scrollTo({left: Math.max(0, thumb.offsetLeft - strip.clientWidth / 2 + thumb.offsetWidth / 2), behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  }
}

document.querySelectorAll('[data-open-carmen]').forEach(button => button.addEventListener('click', () => {
  carmenDialog.showModal();
  selectLamp(lampIndex, false);
}));
document.querySelectorAll('[data-lamp-step]').forEach(button => button.addEventListener('click', () => selectLamp(lampIndex + Number(button.dataset.lampStep))));
lampThumbs.forEach(button => button.addEventListener('click', () => selectLamp(Number(button.dataset.lampIndex))));
lampTrack.addEventListener('keydown', event => {
  let next;
  if (event.key === 'ArrowRight') next = lampIndex + 1;
  else if (event.key === 'ArrowLeft') next = lampIndex - 1;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = lampSlides.length - 1;
  else return;
  event.preventDefault();
  selectLamp(next);
});
lampTrack.addEventListener('scroll', () => {
  clearTimeout(lampScrollTimer);
  lampScrollTimer = setTimeout(() => {
    if (lampDrag || !carmenDialog.open || !lampTrack.clientWidth) return;
    const nearest = Math.round(lampTrack.scrollLeft / lampTrack.clientWidth);
    if (nearest !== lampIndex) {
      lampIndex = Math.max(0, Math.min(lampSlides.length - 1, nearest));
      updateLampGallery();
    }
  }, 110);
}, {passive: true});
lampTrack.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  lampDrag = {id: event.pointerId, x: event.clientX, scroll: lampTrack.scrollLeft};
  lampTrack.classList.add('is-dragging');
  lampTrack.setPointerCapture(event.pointerId);
  event.preventDefault();
});
lampTrack.addEventListener('pointermove', event => {
  if (!lampDrag || event.pointerId !== lampDrag.id) return;
  lampTrack.scrollLeft = lampDrag.scroll - (event.clientX - lampDrag.x);
});
function finishLampDrag(event) {
  if (!lampDrag || event.pointerId !== lampDrag.id) return;
  const nearest = Math.round(lampTrack.scrollLeft / lampTrack.clientWidth);
  lampDrag = null;
  lampTrack.classList.remove('is-dragging');
  if (lampTrack.hasPointerCapture(event.pointerId)) lampTrack.releasePointerCapture(event.pointerId);
  selectLamp(nearest);
}
lampTrack.addEventListener('pointerup', finishLampDrag);
lampTrack.addEventListener('pointercancel', finishLampDrag);
lampTrack.addEventListener('lostpointercapture', event => { if (lampDrag) finishLampDrag(event); });
if ('ResizeObserver' in window) new ResizeObserver(() => {
  if (carmenDialog.open && !lampDrag) selectLamp(lampIndex, false);
}).observe(lampTrack);
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', updateLampGallery));
document.querySelector('.language-select').addEventListener('change', updateLampGallery);
updateLampGallery();

carmenDialog.addEventListener('close', () => {
  clearTimeout(lampScrollTimer);
  lampDrag = null;
  lampTrack.classList.remove('is-dragging');
});
