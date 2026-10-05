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

## 按钮贴图：9-slice（九宫格拼接）

按钮原先按每种尺寸各切一张贴图（20 / 71 / 98 / 150 / 200 × 20 共 16 张），
体积冗余且新增尺寸就要再加图。现改为 **9-slice** 方案：

- 一张 **7×7** 精灵图（`assets/button/button_9s.png` 及高亮/禁用共 3 张）覆盖所有尺寸；
- CSS 用 `border-image: url(...) 3 fill stretch;`：
  - 4 个 `3×3` 角 1:1 还原（边框丝毫不失真）；
  - 4 条边按需拉伸；
  - 中间 `1×1` 拉伸填充，配合 `image-rendering: pixelated` 保持像素风。
- 每种按钮只需给出 `width / height` 即可，交互态只切换精灵图源。

体积：**16 张 ≈ 16.2 KB → 3 张 ≈ 0.3 KB（约 −98%）**。

### 重新生成精灵图

```bash
python3 tools/mkslice.py   # 依赖 Pillow；从原尺寸贴图提取角/边
```

## 本地预览

```bash
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080/
```

> 静态站点，无构建步骤、无第三方依赖。
