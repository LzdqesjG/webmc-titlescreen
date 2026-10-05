(function() {
  'use strict';

  /* ==========================================================
     Checkbox
     点击切换 data-checked（'true' ↔ 'false'）
     派发 'checkchange' 事件，detail.checked = boolean
     ========================================================== */
  document.addEventListener('click', function(e) {
    /* 点整行或直接点 checkbox 都生效 */
    var box = e.target && e.target.closest && e.target.closest('.mc-checkbox-row, .mc-checkbox');
    if (!box) return;

    /* 找到真正的 .mc-checkbox */
    var cb = box.classList.contains('mc-checkbox') ? box : box.querySelector('.mc-checkbox');
    if (!cb || cb.disabled) return;

    var checked = cb.dataset.checked === 'true';
    cb.dataset.checked = checked ? 'false' : 'true';

    cb.dispatchEvent(new CustomEvent('checkchange', {
      bubbles: true,
      detail: { checked: !checked }
    }));
  }, true);

  /* ==========================================================
     工具：查询 / 设置状态（合并到全局 mcWidgets）
     ========================================================== */
  window.mcWidgets = window.mcWidgets || {};

  window.mcWidgets.isChecked = function(el) {
    return !!(el && el.dataset.checked === 'true');
  };

  window.mcWidgets.setChecked = function(el, checked) {
    if (el) el.dataset.checked = checked ? 'true' : 'false';
  };
})();