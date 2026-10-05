# webmc-titlescreen

用纯静态 HTML / CSS / JS 复刻《Minecraft》Java 版启动器的标题画面与相关界面
（标题屏 / 选择世界 / 语言设置），包含原版像素字体、全景背景与 MC 风格按钮体系。

## 目录结构

```
website/
├── index.html        # 标题画面
├── sstart.html       # 选择世界
├── lang.html         # 语言设置
├── css/              # 样式（buttons / logos / realm / slider / textfield ...）
├── js/               # 交互脚本
└── assets/           # 原版贴图 / 音效资源
```
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
