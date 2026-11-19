# Junan Hu's Academic Homepage

个人学术主页（纯静态 HTML/CSS/JS，零框架、零构建依赖，无需 Docker 或 Ruby）。

在线地址：<https://steve2457.github.io/>

## 本地预览（1 秒启动）

在项目根目录运行：

```bash
python3 -m http.server 8080
```

浏览器打开 <http://localhost:8080> 即可实时预览（保存文件后刷新页面即可看到最新效果）。

## 日常如何更新内容

所有文案、社交链接、新闻动态、论文列表均集中在 **`data/site-data.js`** 一个文件中：

- **修改简介 / 研究兴趣 / 社交链接**：编辑 `data/site-data.js` 中的 `profile`、`bioParagraphs`、`researchQuestions`
- **新增新闻动态**：在 `data/site-data.js` 的 `news` 数组顶部插入一项 `{ date: "Nov, 2026", content: "..." }`
- **新增论文**：将论文预览图放入 `assets/img/publication_preview/`，然后在 `data/site-data.js` 的 `publications` 数组中添加一项即可

## 部署说明

直接 `git push origin main` 即可，GitHub Pages 会直接从 `main` 分支根目录自动发布上线（无需任何构建或 GitHub Actions）。
