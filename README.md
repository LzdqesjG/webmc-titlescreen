# webmc-titlescreen

用纯静态 HTML / CSS / JS 复刻《Minecraft》Java 版启动器的标题画面与相关界面
（标题屏 / 选择世界 / 多人游戏 / Realms / 语言设置 / 开发者菜单），包含原版像素字体、全景背景与 MC 风格按钮体系。

## 目录结构

```
website/
├── index.html        # 标题画面
├── sstart.html       # 选择世界（单人）
├── mstart.html       # 多人游戏（服务器列表）
├── realms_online.html  # Minecraft Realms（在线，领域列表）
├── realms_offline.html # Minecraft Realms（离线 / 盗版，加载失败）
├── realms_update.html  # Minecraft Realms（客户端版本过低）
├── devmenu.html      # 开发者菜单（实验性，从服务器列表首条进入）
├── lang.html         # 语言设置
├── css/              # 样式（buttons / logos / realm / slider / textfield ...）
├── js/               # 交互脚本
└── assets/           # 原版贴图 / 音效资源
```

### 多人游戏 / Realms / 开发者菜单

- `mstart.html` 以 `sstart.html` 为模板改写：结构、条目渲染、选中与搜索逻辑完全复用，仅替换文案与底部按钮
  （Join Server / Direct Connect / Add Server / Edit / Delete / Refresh / Back）。
- 服务器列表**下方居中**有局域网扫描提示：三点逐一亮起的逐帧动画（`Ooo → oOo → ooO → oOo`，每 0.4s 一格），
  其下为扫描文案（`multiplayer.scanning`）。
- 服务器列表首条固定为 **「开发者模式 (实验性)」**，MOTD **「存在bug并不被动修复」**，带 `warning` 警示图标；
  点击条目 / 箭头 / 警示图标都会进入 `devmenu.html`。
- `devmenu.html` 是测试用导航页：上半区可打开项目内**每个**界面（标题屏 / 选择世界 / 多人游戏 / Realms / 语言设置），
  下半区提供测试功能：UI 缩放循环（auto / 0.75 / 1.0 / 1.5 / 2.0，经 `sessionStorage` 持久化）、
  查看当前语言、诊断信息（UA / 视口 / 缩放）、清空 localStorage、重载页面、退出/崩溃测试（复用 `exit.js`）。
- 语言包新增 `multiplayer.*` 与 `devmenu.*` 键；服务器名与 MOTD 属数据，按原版习惯不参与翻译。
- 新增 `dev_ui_scale` 为开发者菜单的缩放覆盖键（`sessionStorage`，不污染正常浏览）。

### Minecraft Realms

Realms 按场景拆为三页：

- `realms_online.html`（在线）：标题屏的 **Minecraft Realms** 按钮进入此页（原先为 `disabled` 占位）。
  以 `mstart.html` 为模板：Realm 列表 + 选中 / 搜索逻辑完全复用；
  底部为 Configure Realm / Leave Realm（选中才可用）、Buy a Realm / Back。
- `realms_offline.html`（离线 / 盗版玩家）：无 Microsoft 账号、Realms 加载失败的界面；
  红色标题「Failed to load Realms」，提供 Retry（重新加载本页）与 Back。
- `realms_update.html`（客户端版本过低）：黄色标题「Outdated client!」，提示使用最新版本；仅提供 Back。
- 标题屏通知图标系统（`css/realm.css` + `js/show_realm.js`）保持原样：按 cookie 决定 news / invite / trial 的显隐。
- Realms 需在线账号与官方服务，纯静态站点无法真正联机：示例条目与按钮动作为 console 占位。

## 按钮：纯 CSS 无缝绘制

按钮原先按每种尺寸各切一张贴图（20 / 71 / 98 / 150 / 200 × 20 共 16 张），体积冗余。
之后曾改用 **9-slice**（`border-image` + 7×7 精灵图），但它在浏览器里会露缝：

- `border-image` 会把图**切成 9 块分别绘制**；
- 而外层 `.screen` 的 `transform: scale(var(--ui-scale))` 恒为小数（`uiscale.js` 保留 3 位）；
- 切片边界被抗锯齿错位、透出页面背景，于是按钮上出现一条**白线**（缩放越大越明显）；
- 悬停态外圈本就是纯白，这条缝在悬停时尤其显眼。

现改为 **纯 CSS 直接绘制**（不再依赖任何按钮位图）：

```css
.mcbtn {
  border: 1px solid #000000;                                       /* 外描边 */
  background-color: #6f6f6f;                                       /* 填充 */
  box-shadow: inset 1px 1px 0 #aaaaaa, inset -1px -1px 0 #565656;  /* 内斜面 */
}
.mcbtn:hover:not(:disabled) {
  border-color: #ffffff; background-color: #757575;
  box-shadow: inset 1px 1px 0 #afafaf, inset -1px -1px 0 #5c5c5c;
}
.mcbtn:disabled { background-color: #2c2c2c; box-shadow: none; }
```

- 整个按钮由**同一个元素一次绘制**，不存在切片接缝，任意尺寸 / 任意缩放下都没有白线；
- 颜色直接取自原贴图，三态与原贴图平均色差 ≈ 1%；
- 按钮位图全部移除（`assets/button/button_9s*.png` 与 `tools/mkslice.py` 已删），体积进一步归零。

每种按钮只需给出 `width / height`（`.mcbtn-long` / `-half` / `-icon` / `-71` / `-150`）。


## 本地预览

```bash
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080/
```

> 静态站点，无构建步骤、无第三方依赖。
