(function() {
  'use strict';

  var STORE_PREFIX = 'mc_option.';
  var listeners = {};   /* key → [fn, ...] */

  function fullKey(key) { return STORE_PREFIX + key; }

  function get(key, fallback) {
    try {
      var raw = localStorage.getItem(fullKey(key));
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }

  function set(key, value) {
    try {
      localStorage.setItem(fullKey(key), JSON.stringify(value));
    } catch (e) {}

    /* 通知监听者 */
    var fns = listeners[key];
    if (fns) {
      for (var i = 0; i < fns.length; i++) {
        try { fns[i](value); } catch (e) { console.error('[mcOptions]', e); }
      }
    }

    /* 派发全局事件 */
    try {
      document.dispatchEvent(new CustomEvent('mc-option-change', {
        detail: { key: key, value: value }
      }));
    } catch (e) {}
  }

  function on(key, fn) {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(fn);
  }

  window.mcOptions = { get: get, set: set, on: on };
})();