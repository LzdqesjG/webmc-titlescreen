(function() {
  'use strict';

  var base = document.getElementById('sfx-click');
  if (!base) return;

  if (base.__sfxBound) return;
  base.__sfxBound = true;

  /* 注意：不含 .mc-slider —— 滑块音效在 slider.js 里 release 时播 */
  var SFX_SELECTOR = '.mcbtn, .world-entry, .world-join, .world-alert, .mc-lock-btn, .mc-checkbox';

  var lastPlayTime = 0;
  var MIN_INTERVAL = 40;

  function play() {
    var now = Date.now();
    if (now - lastPlayTime < MIN_INTERVAL) return;
    lastPlayTime = now;
    var a = base.cloneNode();
    a.volume = 0.7;
    a.play().catch(function(){});
  }

  /* 源码：AbstractWidget.mouseClicked 里，onClick 之前 playDownSound
     对应 mousedown / touchstart */
  document.addEventListener('mousedown', function(e) {
    if (!e.target || !e.target.closest) return;
    if (!e.target.closest(SFX_SELECTOR)) return;
    play();
  }, true);

  document.addEventListener('touchstart', function(e) {
    if (!e.target || !e.target.closest) return;
    if (!e.target.closest(SFX_SELECTOR)) return;
    play();
  }, true);

  /* 输入框聚焦音效 */
  document.addEventListener('focusin', function(e) {
    if (!e.target || !e.target.matches) return;
    if (e.target.matches('.mc-input')) play();
  }, true);

  /* lock / checkbox 状态变化（键盘触发时） */
  document.addEventListener('lockchange', function() { play(); }, true);
  document.addEventListener('checkchange', function() { play(); }, true);

  base.load();
})();