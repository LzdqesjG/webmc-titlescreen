(function() {
  'use strict';

  var SPLASH_URL = 'assets/texts/splashes.txt';
  var EXCLUDED_HASH = 125780783;
  var USERNAME_COOKIE = 'username';   /* ← 用户名 cookie 名，按需改 */

  var splashEl = document.getElementById('splash');
  if (!splashEl) return;

  var textEl = splashEl.querySelector('.splash-text');

  function show(text) {
    if (!text) return;
    if (textEl) textEl.textContent = text;
    splashEl.classList.add('visible');
  }

  function hide() {
    splashEl.classList.remove('visible');
  }

  function getCookie(name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m[2]) : '';
  }

  /* 复刻 Java String.hashCode */
  function javaHashCode(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) | 0;
    }
    return h;
  }

  /* ============ 节日特殊标语 ============ */
  var CHRISTMAS = 'Merry X-mas!';
  var NEW_YEAR  = 'Happy new year!';
  var HALLOWEEN = 'OOoooOOOoooo! Spooky!';

  function getHolidaySplash() {
    var d = new Date();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    /* 只 12/24 是圣诞；25、26 走正常随机 */
    if (m === 12 && day === 24) return CHRISTMAS;
    if (m === 1  && day === 1)  return NEW_YEAR;
    if (m === 10 && day === 31) return HALLOWEEN;
    return null;
  }

  /* 1. 节日优先 */
  var holiday = getHolidaySplash();
  if (holiday) {
    show(holiday);
    return;
  }

  /* 2. 加载 splashes.txt */
  fetch(SPLASH_URL)
    .then(function(r) {
      if (!r.ok) throw new Error('fetch failed');
      return r.text();
    })
    .then(function(text) {
      var lines = text.split('\n')
        .map(function(s) { return s.trim(); })
        .filter(function(s) { return s.length > 0; })
        .filter(function(s) { return javaHashCode(s) !== EXCLUDED_HASH; });

      if (lines.length === 0) {
        hide();
        return;
      }

      /* 3. 用户名彩蛋：登录 + 首次随机索引 == 42 */
      var username = getCookie(USERNAME_COOKIE);
      var firstIndex = Math.floor(Math.random() * lines.length);

      if (username && firstIndex === 42) {
        show(username.toUpperCase() + ' IS YOU');
        return;
      }

      /* 4. 普通随机（和源码一样，重新随机一次） */
      var pick = Math.floor(Math.random() * lines.length);
      show(lines[pick]);
    })
    .catch(function() {
      /* fetch 失败保留 HTML 默认值 allow javascript! */
    });
})();