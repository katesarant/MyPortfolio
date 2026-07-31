const state = {
  lang: 'en',
  theme: 'light',
};

const iconMoon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79Z" /></svg>';
const iconSun = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m9-6.5V4m0 16v-1.5m5.5-5.5H19m-14 0H3.5m11.5-5.5L14.5 5.5m-5 13L9.5 18.5m8-8l-1.5-1.5m-8 0L6.5 10.5m8 8l-1.5 1.5m-8 0L6.5 13.5" /></svg>';
const fallbackTranslations = {
  en: {
    meta: { title: 'Katerina Sarantopoulou | Full Stack Developer' },
    nav: { languageLabel: 'Switch language' },
  },
  el: {
    meta: { title: 'Κaterina Sarantopoulou | Full Stack Developer' },
    nav: { languageLabel: 'Αλλαγή γλώσσας' },
  },
};

async function loadTranslations() {
  const savedLang = localStorage.getItem('portfolio-lang');
  const browserLang = navigator.language?.toLowerCase().startsWith('el') ? 'el' : 'en';
  state.lang = savedLang || browserLang;

  try {
    const response = await fetch(`./locales/${state.lang}.json`);
    if (!response.ok) {
      throw new Error('Unable to load translations');
    }
    const translations = await response.json();
    applyTranslations(translations);
  } catch (error) {
    console.warn('Using fallback translations', error);
    applyTranslations(fallbackTranslations[state.lang] || fallbackTranslations.en);
  }
}

function applyTranslations(translations) {
  document.documentElement.lang = state.lang;
  document.title = translations.meta?.title || document.title;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const value = key.split('.').reduce((acc, part) => acc?.[part], translations);
    if (typeof value === 'string') {
      element.textContent = value;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    const value = key.split('.').reduce((acc, part) => acc?.[part], translations);
    if (typeof value === 'string') {
      element.setAttribute('placeholder', value);
    }
  });

  const langButton = document.getElementById('langToggle');
  if (langButton) {
    langButton.textContent = state.lang === 'el' ? 'EL / EN' : 'EN / EL';
    langButton.setAttribute('aria-label', translations.nav?.languageLabel || 'Switch language');
  }
}

function initTheme() {
  const storedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  state.theme = storedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', state.theme === 'dark');
  updateThemeButton();
}

function updateThemeButton() {
  const button = document.getElementById('themeToggle');
  if (!button) {
    return;
  }
  button.innerHTML = state.theme === 'dark' ? iconSun : iconMoon;
  button.setAttribute('aria-label', state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark', state.theme === 'dark');
  localStorage.setItem('portfolio-theme', state.theme);
  updateThemeButton();
}

function toggleMenu() {
  const panel = document.getElementById('mobileMenu');
  const button = document.getElementById('menuToggle');
  if (!panel || !button) {
    return;
  }
  const isOpen = panel.classList.toggle('hidden');
  button.setAttribute('aria-expanded', String(!isOpen));
}

function switchLanguage() {
  state.lang = state.lang === 'en' ? 'el' : 'en';
  localStorage.setItem('portfolio-lang', state.lang);
  loadTranslations();
}

async function init() {
  initTheme();
  await loadTranslations();

  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('langToggle')?.addEventListener('click', switchLanguage);
  document.getElementById('menuToggle')?.addEventListener('click', toggleMenu);
  document.querySelectorAll('#mobileMenu a').forEach((link) => link.addEventListener('click', () => {
    document.getElementById('mobileMenu')?.classList.add('hidden');
    document.getElementById('menuToggle')?.setAttribute('aria-expanded', 'false');
  }));
}

document.addEventListener('DOMContentLoaded', init);
