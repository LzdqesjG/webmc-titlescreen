(function() {
  'use strict';

  var DEFAULT_ICON = 'assets/icon/world_selection/unknown_server.png';

  /* ==========================================================
     WorldSelectionList
     对应源码 WorldSelectionList.WorldListEntry
     - 单击整行 → 选中
     - 单击图标区域 → 立即进入（onJoin）
     - 双击整行 → 进入（onJoin）
     - 点击 warning/error → onAlertClick + 转发 onJoin
     ========================================================== */
  function WorldSelectionList(container, options) {
    if (!window.mcWidgets || !window.mcWidgets.ObjectSelectionList) {
      throw new Error('WorldSelectionList: ObjectSelectionList required');
    }
    options = options || {};

    /* 底层通用列表 */
    this.base = new window.mcWidgets.ObjectSelectionList(container, {
      entrySelector: '.world-entry',
      onSelect: options.onSelect || null,
      onInteract: options.onInteract || null
    });

    this.el = container;
    this.entrySelector = '.world-entry';
    this.entries = [];
  }

  /* ==========================================================
     创建一个条目 DOM
     ========================================================== */
  WorldSelectionList.prototype.createEntry = function(world) {
    var self = this;

    var el = document.createElement('div');
    el.className = 'mc-list-entry world-entry';

    /* --- 图标 --- */
    var iconWrap = document.createElement('div');
    iconWrap.className = 'world-icon-wrap';

    var iconEl = document.createElement('div');
    iconEl.className = 'world-icon';
    iconEl.style.backgroundImage =
      'url("' + String(world.icon || DEFAULT_ICON).replace(/"/g, '\\"') + '")';
    iconWrap.appendChild(iconEl);

    /* --- 状态叠加 --- */
    var statusEl = document.createElement('div');
    statusEl.className = 'world-status';

    var joinEl = document.createElement('div');
    joinEl.className = 'world-join';
    if (world.join) joinEl.dataset.join = world.join;

joinEl.addEventListener('click', function(e) {
  e.stopPropagation();
  self.base.setSelected(el);
  if (world.alert === 'error') return;
  self._fireInteract(el, world);       /* 只调这个，内部走 onInteract */
});

    var alertEl = document.createElement('div');
    alertEl.className = 'world-alert';
    if (world.alert) alertEl.dataset.alert = world.alert;

    /* 悬浮警告 → 箭头也高亮 */
    alertEl.addEventListener('mouseenter', function() {
      if (world.alert === 'error') return;
      if (!world.join) return;
      var hi = (world.join === 'marked_join')
        ? 'assets/icon/world_selection/marked_join_highlighted.png'
        : 'assets/icon/world_selection/join_highlighted.png';
      joinEl.style.backgroundImage = 'url("' + hi + '")';
    });
    alertEl.addEventListener('mouseleave', function() {
      joinEl.style.backgroundImage = '';
    });

alertEl.addEventListener('click', function(e) {
  e.stopPropagation();
  self.base.setSelected(el);
  callHandle(world, 'onAlertClick');   /* 这个是 alert 专属，保留 */
  if (world.alert === 'error') return;
  self._fireInteract(el, world);       /* 转发给 onInteract，内部再走 onJoin */
});

    statusEl.appendChild(joinEl);
    statusEl.appendChild(alertEl);
    iconWrap.appendChild(statusEl);

    /* --- 文字区 --- */
    var infoEl = document.createElement('div');
    infoEl.className = 'world-info';

    var nameEl = document.createElement('div');
    nameEl.className = 'world-name';
    nameEl.textContent = world.name || '';

    var descEl = document.createElement('div');
    descEl.className = 'world-meta';
    descEl.textContent = world.description || '';

    infoEl.appendChild(nameEl);
    infoEl.appendChild(descEl);

    el.appendChild(iconWrap);
    el.appendChild(infoEl);

    /* 关联数据 */
    this.base.setData(el, world);
    world._el = el;

    return el;
  };

  /* 派发 interact（不经过 base 的 dblclick 逻辑） */
  WorldSelectionList.prototype._fireInteract = function(el, world) {
    if (typeof this.base.onInteract === 'function') {
      this.base.onInteract(el, world);
    }
    el.dispatchEvent(new CustomEvent('interact', {
      bubbles: true,
      detail: { data: world }
    }));
  };

  /* ==========================================================
     批量渲染
     ========================================================== */
  WorldSelectionList.prototype.renderList = function(worlds) {
    this.el.innerHTML = '';
    this.entries = worlds;

    for (var i = 0; i < worlds.length; i++) {
      this.el.appendChild(this.createEntry(worlds[i]));
    }
    this.base.setSelected(null);
  };

  /* ==========================================================
     搜索过滤（源码 updateFilter / fillLevels）
     - 只匹配 name 和 description
     - 过滤后清空选中（源码 fillLevels 会尝试重选，这里简化）
     ========================================================== */
  WorldSelectionList.prototype.applyFilter = function(q) {
    q = (q || '').trim().toLowerCase();
    for (var i = 0; i < this.entries.length; i++) {
      var w = this.entries[i];
      if (!w._el) continue;
      var hay = ((w.name || '') + ' ' + (w.description || '')).toLowerCase();
      var hit = !q || hay.indexOf(q) >= 0;
      w._el.style.display = hit ? '' : 'none';
    }
    this.base.setSelected(null);
  };

  /* ==========================================================
     状态查询 / 设置
     ========================================================== */
  WorldSelectionList.prototype.getSelectedData = function() {
    return this.base.getSelectedData();
  };

  WorldSelectionList.prototype.getSelectedEl = function() {
    return this.base.getSelected();
  };

  /* ==========================================================
     工具
     ========================================================== */
  function callHandle(world, name) {
    if (!world) return;
    var fn = world[name];
    if (typeof fn === 'function') fn.call(world);
  }

  window.mcWidgets = window.mcWidgets || {};
  window.mcWidgets.WorldSelectionList = WorldSelectionList;
})();