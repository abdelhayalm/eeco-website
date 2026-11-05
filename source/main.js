'use strict';
const copy = __COPY__;
const media = window.matchMedia('(max-width: 760px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const tabs = [...document.querySelectorAll('[data-service]')];
const navigationLinks = [...document.querySelectorAll('.main-nav a, .mobile-dock a')];
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
  const frames = variant === 'unfold'
    ? [{opacity: 0, transform: 'translateY(22px) scale(.97)', clipPath: 'inset(4% 0 0 0 round 16px)'}, {opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0 round 16px)'}]
    : [{opacity: 0, transform: 'translateY(22px)'}, {opacity: 1, transform: 'none'}];
  const animation = element.animate(frames, {duration: variant === 'unfold' ? 480 : 420, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
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
    const progress = reducedMotion.matches ? 1 : Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / (window.innerHeight * .65)));
    growth.style.setProperty('--growth-progress', String(progress));
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

// One quiet brand gesture, only while the hero is visible. Never a perpetual loop.
const heroVisual = document.querySelector('.hero-visual');
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
if (heroVisual) {
  heroVisual.addEventListener('pointerenter', () => {
    if (!precisePointer.matches || reducedMotion.matches) return;
    const emblem = heroVisual.querySelector('.hero-emblem');
    const animation = emblem.animate([
      {transform:'translateY(0) rotate(0deg)'},
      {transform:'translateY(-8px) rotate(-3deg)'},
      {transform:'translateY(0) rotate(0deg)'}
    ], {duration:1100,easing:'cubic-bezier(.22,1,.36,1)'});
    runningAnimations.add(animation);
    animation.finished.then(() => runningAnimations.delete(animation)).catch(() => runningAnimations.delete(animation));
  });
}
