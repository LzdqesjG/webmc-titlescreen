(function() {
  'use strict';

  var base = document.getElementById('sfx-click');
  if (!base) return;

  if (base.__sfxBound) return;
  base.__sfxBound = true;

  var SFX_SELECTOR = '.mcbtn, .world-entry, .world-join, .world-alert, .mc-lock-btn, .mc-checkbox, .mc-slider';

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

  /* click 类元素：捕获阶段 */
  document.addEventListener('click', function(e) {
    if (!e.target || !e.target.closest) return;
    if (!e.target.closest(SFX_SELECTOR)) return;
    play();
  }, true);

  /* 输入框聚焦 */
  document.addEventListener('focusin', function(e) {
    if (!e.target || !e.target.matches) return;
    if (e.target.matches('.mc-input')) play();
  }, true);



  /* lock / checkbox 状态变化 */
  document.addEventListener('lockchange', function() { play(); }, true);
  document.addEventListener('checkchange', function() { play(); }, true);

  base.load();
})();