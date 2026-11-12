'use strict';
const copy = __COPY__;
const media = window.matchMedia('(max-width: 760px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const tabs = [...document.querySelectorAll('[data-service]')];
const navigationLinks = [...document.querySelectorAll('.main-nav a')];
const pageSections = [...document.querySelectorAll('main > section[id]')];
const runningAnimations = new Set();
const scrollAnimations = new Set();
const revealElements = [...document.querySelectorAll('[data-reveal]')];
const progressBar = document.querySelector('.reading-progress');
const growthStages = document.querySelector('.growth-stages');
let currentLanguage = 'en';
let scrollFramePending = false;
const panelAnimations = new WeakMap();
let revealObserver;
let lastScrollTop = window.scrollY;
let lastScrollAt = performance.now();
let skipEntrancesUntil = 0;
let lastPageProgress = -1;
let lastGrowthProgress = -1;
let activeSectionId = null;

function animateIn(element, variant = 'rise', delay = 0) {
  if (!element) return;
  if (reducedMotion.matches || typeof element.animate !== 'function' || element.contains(document.activeElement)) return;
  // Entrances begin before viewport entry; translate leaves hover and SVG transforms intact.
  const illustration = element.namespaceURI === 'http://www.w3.org/2000/svg';
  const lift = illustration ? 8 : variant === 'unfold' ? 22 : variant === 'panel' ? 8 : 16;
  let frames = [{opacity: .78, translate: `0 ${lift}px`}, {opacity: 1, translate: '0 0'}];
  let duration = 620;
  if (variant === 'unfold') {
    frames[0].opacity = .84;
    duration = 680;
  } else if (variant === 'intro') {
    frames[0].opacity = .72;
    duration = 700;
  } else if (variant === 'panel') {
    duration = 300;
  } else if (variant === 'art') {
    frames = [{opacity: .8, scale: '.95', translate: '0 6px'}, {opacity: 1, scale: '1', translate: '0 0'}];
    duration = 500;
  } else if (variant === 'caption') {
    frames = [{opacity: .8, translate: '0 3px'}, {opacity: 1, translate: '0 0'}];
    duration = 180;
  } else if (variant === 'wings') {
    frames = [{opacity: .86, scale: '.9 1', translate: '0 6px'}, {opacity: 1, scale: '1 1', translate: '0 0'}];
    duration = 780;
  }
  const interaction = ['panel', 'art', 'caption'].includes(variant);
  const animation = playMotion(element, frames, {duration, delay, easing: 'cubic-bezier(.22,1,.36,1)'}, interaction ? 'eeco-detail-transition' : 'eeco-scroll-entrance', !interaction);
  if (animation) element.dataset.entering = 'true';
  return animation;
}

function playMotion(element, frames, timing, id, scroll = false) {
  const previous = panelAnimations.get(element);
  if (previous) previous.cancel();
  if (reducedMotion.matches || typeof element.animate !== 'function') return null;
  const animation = element.animate(frames, {fill: 'none', ...timing});
  animation.id = id;
  panelAnimations.set(element, animation);
  runningAnimations.add(animation);
  if (scroll) scrollAnimations.add(animation);
  const cleanUp = () => {
    runningAnimations.delete(animation);
    scrollAnimations.delete(animation);
    if (panelAnimations.get(element) === animation) {
      panelAnimations.delete(element);
      delete element.dataset.entering;
    }
  };
  animation.finished.then(cleanUp, cleanUp);
  return animation;
}

function finishScrollAnimations() {
  scrollAnimations.forEach(animation => animation.finish());
}

function finishMotionAt(target) {
  if (!(target instanceof Element)) return;
  runningAnimations.forEach(animation => {
    if (animation.effect?.target?.contains(target)) animation.finish();
  });
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
  if (tab.getAttribute('aria-selected') === 'true') {
    if (focus) tab.focus();
    return;
  }
  tabs.forEach(button => {
    const selected = button === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    panel.hidden = !selected;
    if (selected && !focus) {
      animateIn(panel.querySelector('.service-detail'), 'panel');
      animateIn(panel.querySelector('.service-art > :first-child'), 'art', 30);
    }
  });
  if (focus) tab.focus();
  queueScrollUpdate();
}

function updateScrollState() {
  scrollFramePending = false;
  const root = document.documentElement;
  const distance = root.scrollHeight - root.clientHeight;
  const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
  const bounds = growthStages?.getBoundingClientRect();
  const journeyProgress = reducedMotion.matches ? 1 : bounds?.height ? Math.max(0, Math.min(1, (window.innerHeight * .55 - bounds.top) / bounds.height)) : 0;
  const threshold = Math.min(window.innerHeight * .4, 260);
  let sectionId = '';
  pageSections.forEach(section => { if (section.getBoundingClientRect().top <= threshold) sectionId = section.id; });
  if (sectionId === 'vision') sectionId = 'approach';
  // Read geometry first; local writes avoid invalidating the whole page on every frame.
  if (progressBar && progress !== lastPageProgress) {
    progressBar.style.setProperty('--page-progress', String(progress));
    lastPageProgress = progress;
  }
  if (growthStages && journeyProgress !== lastGrowthProgress) {
    growthStages.style.setProperty('--growth-progress', String(journeyProgress));
    lastGrowthProgress = journeyProgress;
  }
  if (sectionId !== activeSectionId) {
    navigationLinks.forEach(link => {
      if (link.hash === '#' + sectionId) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    activeSectionId = sectionId;
  }
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

function handleScroll() {
  const now = performance.now();
  const distance = Math.abs(window.scrollY - lastScrollTop);
  const elapsed = Math.max(16, now - lastScrollAt);
  if (distance > Math.max(160, window.innerHeight * .28) || distance / elapsed > 2.4) {
    skipEntrancesUntil = now + 180;
    finishScrollAnimations();
  }
  lastScrollTop = window.scrollY;
  lastScrollAt = now;
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
window.addEventListener('scroll', handleScroll, {passive: true});
window.addEventListener('resize', queueScrollUpdate);
window.addEventListener('load', queueScrollUpdate);
media.addEventListener('change', setOrientation);
if ('ResizeObserver' in window) new ResizeObserver(queueScrollUpdate).observe(document.body);
reducedMotion.addEventListener('change', event => {
  if (event.matches) {
    runningAnimations.forEach(animation => animation.finish());
    revealObserver?.disconnect();
    revealElements.forEach(element => { element.dataset.revealed = 'true'; });
  }
  queueScrollUpdate();
});
document.addEventListener('focusin', event => finishMotionAt(event.target));
document.addEventListener('pointerdown', event => finishMotionAt(event.target), {capture: true, passive: true});
setOrientation();
let savedLanguage = 'en';
try { savedLanguage = localStorage.getItem('eeco-language') || 'en'; } catch (_) { /* English is the default. */ }
setLanguage(savedLanguage);

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  revealObserver = new IntersectionObserver(entries => {
    const entering = entries.filter(entry => entry.isIntersecting && entry.target.dataset.revealed !== 'true');
    const viewportHeight = window.innerHeight;
    const skip = reducedMotion.matches || performance.now() < skipEntrancesUntil;
    entering.forEach(entry => {
      const element = entry.target;
      const bounds = element.getBoundingClientRect();
      element.dataset.revealed = 'true';
      revealObserver.unobserve(element);
      // Deep links, fast jumps and already-visible content settle immediately.
      if (skip || bounds.top < viewportHeight * .72 || bounds.bottom <= 0) return;
      let delay = 0;
      if (!media.matches && element.classList.contains('project')) {
        const siblings = [...element.parentElement.children];
        const sameRowBefore = siblings.slice(0, siblings.indexOf(element))
          .filter(sibling => Math.abs(sibling.getBoundingClientRect().top - bounds.top) < 20).length;
        delay = Math.min(sameRowBefore, 2) * 65;
      }
      animateIn(element, element.dataset.reveal, delay);
    });
  }, {threshold: 0, rootMargin: '0px 0px 72px 0px'});
  revealElements.forEach(element => {
    if (element.getBoundingClientRect().top < window.innerHeight) element.dataset.revealed = 'true';
    else revealObserver.observe(element);
  });
} else {
  revealElements.forEach(element => { element.dataset.revealed = 'true'; });
}

// Native dialogs provide keyboard dismissal, focus containment and focus return.
const serviceDialog = document.getElementById('service-dialog');
const materialsDialog = document.getElementById('materials-dialog');
const carmenDialog = document.getElementById('carmen-dialog');
function openDialog(dialog) {
  if (dialog.open) return;
  dialog.showModal();
  playMotion(dialog, [{opacity: .8, translate: '0 14px', scale: '.99'}, {opacity: 1, translate: '0 0', scale: '1'}], {duration: 320, easing: 'cubic-bezier(.22,1,.36,1)'}, 'eeco-dialog-open');
}
function closeDialog(dialog) {
  if (!dialog.open || dialog.dataset.closing === 'true') return;
  const animation = playMotion(dialog, [{opacity: 1, translate: '0 0'}, {opacity: 0, translate: '0 8px'}], {duration: 150, easing: 'ease-in', fill: 'forwards'}, 'eeco-dialog-close');
  if (!animation) {
    dialog.close();
    return;
  }
  dialog.dataset.closing = 'true';
  animation.finished.then(() => {
    dialog.close();
    animation.cancel();
    delete dialog.dataset.closing;
  }, () => { delete dialog.dataset.closing; });
}
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
  openDialog(serviceDialog);
}));
document.querySelectorAll('[data-open-materials]').forEach(button => button.addEventListener('click', () => openDialog(materialsDialog)));
document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
[serviceDialog, materialsDialog, carmenDialog].forEach(dialog => {
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeDialog(dialog);
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(dialog);
  });
});
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
if (heroVisual && 'IntersectionObserver' in window) {
  const orbitObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.classList.toggle('is-visible', entry.isIntersecting && !document.hidden);
  }), {threshold:.2});
  orbitObserver.observe(heroVisual);
}
// A short welcome sequence; section links and restored scroll positions stay immediate.
if (window.scrollY < 12 && (!location.hash || location.hash === '#home')) {
  document.querySelectorAll('.hero-copy > *').forEach((element, index) => animateIn(element, 'intro', index * 55));
  animateIn(heroVisual, 'unfold', 80);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    runningAnimations.forEach(animation => animation.finish());
    heroVisual?.classList.remove('is-visible');
  } else if (heroVisual) {
    const bounds = heroVisual.getBoundingClientRect();
    heroVisual.classList.toggle('is-visible', bounds.bottom > 0 && bounds.top < window.innerHeight);
  }
});

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
  const caption = words.lampPhotos[lampIndex];
  if (lampCaption.textContent !== caption) {
    lampCaption.textContent = caption;
    if (carmenDialog.open) animateIn(lampCaption, 'caption');
  }
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
  openDialog(carmenDialog);
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
