(function() {
  'use strict';

  var STORAGE_KEY = 'mc_lang';
  var DEFAULT_LANG = 'en_us';
  var SUPPORTED = ['en_us', 'zh_cn'];

  /* "zh-CN" / "en-US" → "zh_cn" / "en_us" */
  function normalizeLang(code) {
    if (!code) return DEFAULT_LANG;
    return code.toLowerCase().replace(/-/g, '_').split('_').slice(0, 2).join('_');
  }

  function getSavedLang() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function saveLang(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
  }

  /* 检测默认语言：cookie → UA → fallback */
  function detectDefault() {
    var saved = getSavedLang();
    if (saved && SUPPORTED.indexOf(saved) >= 0) return saved;

    var ua = navigator.language || navigator.userLanguage || DEFAULT_LANG;
    var norm = normalizeLang(ua);

    if (SUPPORTED.indexOf(norm) >= 0) return norm;
    if (norm.indexOf('zh') === 0) return 'zh_cn';
    if (norm.indexOf('en') === 0) return 'en_us';
    return DEFAULT_LANG;
  }

  var currentLang = detectDefault();
  var dict = {};
  var ready = false;
  var pending = [];

  function applyTranslations() {
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].dataset.i18n;
      if (dict[key] != null) nodes[i].textContent = dict[key];
    }
    var nodes2 = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < nodes2.length; j++) {
      var key2 = nodes2[j].dataset.i18nPlaceholder;
      if (dict[key2] != null) nodes2[j].placeholder = dict[key2];
    }
    document.documentElement.setAttribute('lang', currentLang.replace('_', '-'));
    try {
      document.dispatchEvent(new CustomEvent('i18n-ready', { detail: { lang: currentLang } }));
    } catch (e) {}
  }

  function load(lang) {
    return fetch('assets/lang/' + lang + '.json')
      .then(function(r) {
        if (!r.ok) throw new Error('not found: ' + lang);
        return r.json();
      })
      .then(function(json) { dict = json; });
  }

  function init() {
    load(currentLang)
      .catch(function() {
        currentLang = DEFAULT_LANG;
        return load(DEFAULT_LANG).catch(function() { dict = {}; });
      })
      .then(function() {
        ready = true;
        applyTranslations();
        pending.forEach(function(fn) { fn(); });
        pending = [];
      });
  }

  window.i18n = {
    t: function(key) {
      return dict[key] != null ? dict[key] : key;
    },
    getLang: function() { return currentLang; },
    setLang: function(code) {
      currentLang = code;
      saveLang(code);
      return load(code).then(function() { applyTranslations(); });
    },
    ready: function(fn) {
      if (ready) fn();
      else pending.push(fn);
    },
    detectDefault: detectDefault,
    normalizeLang: normalizeLang,
    SUPPORTED: SUPPORTED
  };

  init();
})();