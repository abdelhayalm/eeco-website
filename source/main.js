'use strict';
const copy = __COPY__;
const nav = document.getElementById('navigation');
const menu = document.querySelector('.menu-toggle');
const media = window.matchMedia('(max-width: 760px)');
const tabs = [...document.querySelectorAll('[data-service]')];
let currentLanguage = 'en';
function closeMenu(restoreFocus = false) {
  nav.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
  if (restoreFocus) menu.focus();
}
function setLanguage(lang) {
  currentLanguage = Object.hasOwn(copy, lang) ? lang : 'en';
  const text = copy[currentLanguage];
  document.documentElement.lang = currentLanguage === 'pt' ? 'pt-BR' : currentLanguage;
  document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i]').forEach(element => { element.innerHTML = text[element.dataset.i]; });
  document.querySelectorAll('[data-aria]').forEach(element => { element.setAttribute('aria-label', text[element.dataset.aria]); });
  document.querySelectorAll('[data-lang]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === currentLanguage));
  });
  document.title = text.pageTitle;
  document.querySelector('meta[name="description"]').content = text.metaDescription;
  document.querySelector('meta[property="og:title"]').content = text.pageTitle;
  document.querySelector('meta[property="og:description"]').content = text.metaDescription;
  try { localStorage.setItem('eeco-language', currentLanguage); } catch (_) { /* Page works without storage. */ }
}
function selectService(tab, focus = false) {
  tabs.forEach(button => {
    const selected = button === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    panel.hidden = !selected;
    panel.classList.toggle('content-reveal', selected);
  });
  if (focus) tab.focus();
}
function setOrientation() {
  document.querySelector('.service-tabs').setAttribute('aria-orientation', media.matches ? 'vertical' : 'horizontal');
  if (!media.matches) closeMenu();
}
menu.addEventListener('click', () => {
  const opened = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!opened));
  nav.classList.toggle('is-open', !opened);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectService(tab));
  tab.addEventListener('keydown', event => {
    let next = index;
    const rtl = currentLanguage === 'ar';
    if ((media.matches && event.key === 'ArrowDown') || (!media.matches && event.key === (rtl ? 'ArrowLeft' : 'ArrowRight'))) next = (index + 1) % tabs.length;
    else if ((media.matches && event.key === 'ArrowUp') || (!media.matches && event.key === (rtl ? 'ArrowRight' : 'ArrowLeft'))) next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectService(tabs[next], true);
  });
});
media.addEventListener('change', setOrientation);
setOrientation();
let savedLanguage = 'en';
try { savedLanguage = localStorage.getItem('eeco-language') || 'en'; } catch (_) { /* English is the default. */ }
setLanguage(savedLanguage);
