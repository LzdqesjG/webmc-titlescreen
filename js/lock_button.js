(function() {
  'use strict';

  /* ==========================================================
     Lock Button
     点击切换 data-state（unlocked ↔ locked）
     派发 'lockchange' 事件，detail.locked = boolean
     ========================================================== */
  document.addEventListener('click', function(e) {
    var btn = e.target && e.target.closest && e.target.closest('.mc-lock-btn');
    if (!btn || btn.disabled) return;

    var locked = btn.dataset.state === 'locked';
    btn.dataset.state = locked ? 'unlocked' : 'locked';

    btn.dispatchEvent(new CustomEvent('lockchange', {
      bubbles: true,
      detail: { locked: !locked }
    }));
  }, true);

  /* ==========================================================
     工具：查询 / 设置状态（合并到全局 mcWidgets）
     ========================================================== */
  window.mcWidgets = window.mcWidgets || {};

  window.mcWidgets.isLocked = function(el) {
    return !!(el && el.dataset.state === 'locked');
  };

  window.mcWidgets.setLocked = function(el, locked) {
    if (el) el.dataset.state = locked ? 'locked' : 'unlocked';
  };
})();