(function() {
  'use strict';

  /* ==========================================================
     跳转链 —— 用 URL 参数 fromurl 传递栈
     ...（同上）
     ========================================================== */

  var PARAM = 'fromurl';

  function currentPage() {
    var p = location.pathname.split('/').pop() || 'index.html';
    return p;
  }

  function safeFilename(s) {
    return /^[a-z0-9_\-]+\.html$/i.test(String(s));
  }

  function readStack() {
    try {
      var params = new URLSearchParams(location.search);
      var raw = params.get(PARAM);
      if (!raw) return [];
      raw = raw.replace(/-/g, '+').replace(/_/g, '/');
      while (raw.length % 4) raw += '=';
      var arr = JSON.parse(atob(raw));
      if (!Array.isArray(arr)) return [];
      var out = [];
      for (var i = 0; i < arr.length; i++) {
        if (safeFilename(arr[i])) out.push(arr[i]);
      }
      return out;
    } catch (e) {
      return [];
    }
  }

  function encodeStack(stack) {
    if (!stack || stack.length === 0) return '';
    var s = JSON.stringify(stack);
    var b = btoa(s);
    return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function buildUrl(base, stack) {
    var enc = encodeStack(stack);
    if (!enc) return base;
    var sep = base.indexOf('?') >= 0 ? '&' : '?';
    return base + sep + PARAM + '=' + enc;
  }

  function shouldAttachFrom(href) {
    if (!href) return false;
    if (href.charAt(0) === '#') return false;
    if (/^https?:\/\//i.test(href)) return false;
    if (/^\/\//.test(href)) return false;
    if (/^mailto:/i.test(href)) return false;
    if (/^tel:/i.test(href)) return false;
    if (/^javascript:/i.test(href)) return false;
    return /\.html([?#]|$)/i.test(href);
  }

  function stripQuery(href) {
    var q = href.indexOf('?');
    var h = href.indexOf('#');
    var cut = -1;
    if (q >= 0) cut = q;
    if (h >= 0 && (cut < 0 || h < cut)) cut = h;
    return cut >= 0 ? href.substring(0, cut) : href;
  }

  /* ==========================================================
     核心：back() —— 从栈里 pop 上一页并跳转
     返回值：
       true  → 已经在跳转（栈里有上一页）
       false → 栈为空，什么都没做（调用方自己处理默认跳转）
     ========================================================== */
  function back(fallbackUrl) {
    var stack = readStack();

    if (stack.length === 0) {
      if (fallbackUrl) {
        location.href = fallbackUrl;
        return true;
      }
      return false;
    }

    var target = stack.pop();
    location.href = buildUrl(target, stack);
    return true;
  }

  /* ==========================================================
     .btn-back 按钮
     ========================================================== */
  function setupBackButtons() {
    var stack = readStack();
    if (stack.length === 0) return;   /* 栈空：保留 href 走默认 */

    var list = document.querySelectorAll('.btn-back');
    for (var i = 0; i < list.length; i++) {
      setupOneBack(list[i]);
    }
  }

  function setupOneBack(a) {
    /* 保留 href 作为 fallback */
    var fallback = a.getAttribute('href') || '';
    a.removeAttribute('href');
    if (!a.hasAttribute('tabindex')) a.setAttribute('tabindex', '0');
    a.style.cursor = 'pointer';

    a.addEventListener('click', function(e) {
      e.preventDefault();
      back(fallback);
    });

    a.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        a.click();
      }
    });
  }

  /* ==========================================================
     普通内部链接
     ========================================================== */
  function setupLinks() {
    document.addEventListener('click', function(e) {
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      if (a.classList.contains('btn-back')) return;
      if (a.classList.contains('noback')) return;

      var href = a.getAttribute('href');
      if (!shouldAttachFrom(href)) return;

      var base = stripQuery(href);
      var s = readStack();
      s.push(currentPage());

      e.preventDefault();
      location.href = buildUrl(base, s);
    }, true);
  }

  /* ==========================================================
     对外接口
     ========================================================== */
  window.mcBack = {
    /* 从栈里 pop 上一页；fallbackUrl 是栈空时的兜底 */
    back: back,
    /* 读当前栈 */
    getStack: readStack,
    /* 手动 push 一页（一般不用，链接点击自动 push） */
    push: function(page) {
      var s = readStack();
      s.push(page || currentPage());
      location.href = buildUrl(currentPage(), s);
    }
  };

  /* ==========================================================
     启动
     ========================================================== */
  function init() {
    setupBackButtons();
    setupLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();