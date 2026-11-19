/**
 * 个人主页核心数据配置文件 (data/site-data.js)
 * 以后更新简介、新闻、论文、社交链接，只需修改这一个文件即可！
 */
window.SITE_DATA = {
  // 基本信息
  profile: {
    firstName: "Junan",
    lastName: "Hu",
    faviconEmoji: "🥐",
    avatarWebp480: "/assets/img/prof_pic-480.webp",
    avatarWebp800: "/assets/img/prof_pic-800.webp",
    avatarFallback: "/assets/img/prof_pic.jpg",
    avatarWidth: 800,
    avatarHeight: 600,
    contactNote: "",
    // 头像下方社交图标（顺序即展示顺序，url 留空则自动隐藏）
    socials: [
      {
        title: "Email",
        icon: "fa-solid fa-envelope",
        url: "mailto:junanhu06@gmail.com",
        external: false,
      },
      {
        title: "GitHub",
        icon: "fa-brands fa-github",
        url: "https://github.com/Steve2457",
        external: true,
      },
      {
        title: "Google Scholar",
        icon: "ai ai-google-scholar",
        // 创建个人 Google Scholar 主页后，将下方链接替换为 https://scholar.google.com/citations?user=你的ID 即可
        url: "https://scholar.google.com/scholar?q=author%3A%22Junan+Hu%22",
        external: true,
      },
    ],
  },

  // 首页个人介绍段落（支持 HTML）
  bioParagraphs: [
    `Hi 👋 I am a fourth-year undergraduate at <a href="https://baike.baidu.com/item/%E5%B1%B1%E4%B8%9C%E5%A4%A7%E5%AD%A6%E5%B4%87%E6%96%B0%E5%AD%A6%E5%A0%82/20809738" target="_blank" rel="noopener noreferrer">Chongxin College</a>, <img class="inline-logo" src="/assets/img/logos/sdu.svg" alt="SDU"> <a href="https://www.sdu.edu.cn/" target="_blank" rel="noopener noreferrer">Shandong University</a>, where I am fortunate to be advised by <a href="https://faculty.sdu.edu.cn/weiyinwei1/zh_CN/index.htm" target="_blank" rel="noopener noreferrer">Prof. Yinwei Wei</a>. Currently, I am a Research Intern at <img class="inline-logo inline-logo-ms" src="/assets/img/logos/microsoft.svg" alt="Microsoft"> <a href="https://www.microsoft.com/en-us/research/lab/microsoft-research-asia/" target="_blank" rel="noopener noreferrer">Microsoft Research Asia (MSRA)</a>, advised by Principal Researcher <a href="https://www.microsoft.com/en-us/research/people/jialia/" target="_blank" rel="noopener noreferrer">Dr. Jianxun Lian</a>. Previously, I worked with <a href="https://42shawn.github.io/" target="_blank" rel="noopener noreferrer">Prof. Yuzhang Shang</a> and <a href="https://cywang735.github.io/" target="_blank" rel="noopener noreferrer">Chaoyang Wang</a> at the <a href="https://excel-lab.github.io/EXcel-Lab-Website/" target="_blank" rel="noopener noreferrer">EXceL Lab</a>, <img class="inline-logo" src="/assets/img/logos/ucf.svg" alt="UCF"> <a href="https://www.ucf.edu/" target="_blank" rel="noopener noreferrer">University of Central Florida (UCF)</a>. I was also honored to work with <a href="https://cse.hkust.edu.hk/~songguo/" target="_blank" rel="noopener noreferrer">Prof. Song Guo</a> at the <a href="https://www.hkpeilab.com/" target="_blank" rel="noopener noreferrer">PEI Lab</a>, <img class="inline-logo" src="/assets/img/logos/hkust.svg" alt="HKUST"> <a href="https://hkust.edu.hk/" target="_blank" rel="noopener noreferrer">Hong Kong University of Science and Technology</a>, in close collaboration with <a href="https://hitcslj.github.io/" target="_blank" rel="noopener noreferrer">Jian Liu</a> and <a href="https://scholar.google.com/citations?user=6jAXwlwAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">Jinxiang Lai</a>.`,
    `My research interests lie in developing more capable and general AI agents, spanning <strong>Recursive Self-Improvement (RSI)</strong>, <strong>Generative World Models</strong>, <strong>Multimodal Foundation Models</strong>, and <strong>Reinforcement Learning</strong>. Here are some core problems I’m thinking about:`,
  ],

  researchQuestions: [
    "How can AI agents achieve recursive self-improvement (RSI) to autonomously refine and evolve their own reasoning, coding, and learning capabilities?",
    "How can generative world models provide agents with a deeper understanding of causality and dynamics?",
    "In what ways does integrating multiple modalities enable richer perception and interaction in large models?",
    "How can we build intelligent systems that learn, reason, and act effectively in complex, real-world environments?",
  ],

  bioClosing: [
    "I am passionate about advancing AI towards greater generality and real-world applicability.",
    "If you have any questions, please feel free to contact me!",
  ],

  // Something Interesting 板块
  interestingIntro:
    "I've developed two browser extensions to boost academic productivity, both available on the Chrome Web Store:",
  interestingItems: [
    {
      icon: "/assets/img/interesting/arxiv.png",
      iconWidth: 465,
      iconHeight: 465,
      name: "Super arXiv",
      url: "https://github.com/Steve2457/Super-arXiv",
      description:
        "If you also read papers on ArXiv, you should definitely try this extension — it comprehensively enhances the ArXiv browsing experience.",
    },
    {
      icon: "/assets/img/interesting/openreveiw.png",
      iconWidth: 120,
      iconHeight: 120,
      name: "OpenReview Export",
      url: "https://github.com/Steve2457/Openreview-Export",
      description:
        "One-click export of OpenReview rebuttals to Markdown files, streamlining your LLM workflow.",
    },
  ],

  // Misc. 板块
  misc: "In my free time, I enjoy playing soccer and photography. Recently, I've also started getting into fitness 🏋️.",

  // News 列表（按时间从新到旧排列；homeNewsLimit 控制首页最多显示几条）
  homeNewsLimit: 6,
  news: [
    {
      date: "Nov, 2026",
      content: `📄 Our paper "Video-Coder: Reinforcing Agentic Coding for Video Generation" is now available on <a href="https://arxiv.org/abs/2611.09894" target="_blank" rel="noopener noreferrer">arXiv</a> with <a href="https://github.com/CYWang735/Video-Coder" target="_blank" rel="noopener noreferrer">code &amp; models</a> released!`,
    },
    {
      date: "Oct, 2026",
      content: `🎉 Our survey "GUI Agents with Reinforcement Learning: Toward Digital Inhabitants" was accepted to <strong>TMLR</strong>!`,
    },
    {
      date: "Sep, 2026",
      content: `💻 Started my research internship at <a href="https://www.microsoft.com/en-us/research/lab/microsoft-research-asia/" target="_blank" rel="noopener noreferrer">Microsoft Research Asia (MSRA)</a>, advised by <a href="https://www.microsoft.com/en-us/research/people/jialia/" target="_blank" rel="noopener noreferrer">Dr. Jianxun Lian</a>.`,
    },
    {
      date: "May, 2026",
      content: `🚀 The Super arXiv <img class="inline-logo inline-logo-news" src="/assets/img/interesting/arxiv.png" alt="arXiv" width="18" height="18"> extension surpassed 600 users one month after launch. Thank you for the support!`,
    },
    {
      date: "Apr, 2026",
      content: `📄 Our survey "GUI Agents with Reinforcement Learning: Toward Digital Inhabitants" is now available on arXiv!`,
    },
    {
      date: "Apr, 2026",
      content: `🎉 Happy birthday! Context-Agent was accepted to ACL 2026 Findings.`,
    },
  ],

  // 论文列表（maxAuthorLimit 控制默认展示前几位作者，其余点击展开）
  maxAuthorLimit: 3,
  selfName: "Junan Hu",
  publications: [
    {
      id: "wang2026video",
      title: "Video-Coder: Reinforcing Agentic Coding for Video Generation",
      authors: [
        "Chaoyang Wang",
        "Sicheng Gao",
        "Junan Hu",
        "Kunyang Li",
        "Dongyang Chen",
        "Yiyang Zhou",
        "Huaxiu Yao",
        "Yong Jae Lee",
        "Radu Timofte",
        "Yuzhang Shang",
      ],
      venue: "arXiv preprint arXiv:2611.09894",
      date: "Nov 2026",
      year: 2026,
      abbr: "arXiv",
      preview: "/assets/img/publication_preview/video-coder.png",
      previewWidth: 2008,
      previewHeight: 608,
      selected: true,
      links: [
        { label: "arXiv", url: "https://arxiv.org/abs/2611.09894" },
        { label: "Website", url: "https://cywang735.github.io/Video-Coder/" },
        { label: "Code", url: "https://github.com/CYWang735/Video-Coder" },
      ],
    },
    {
      id: "hu2026gui",
      title: "GUI Agents with Reinforcement Learning: Toward Digital Inhabitants",
      authors: [
        "Junan Hu",
        "Jian Liu",
        "Jingxiang Lai",
        "Jiarui Hu",
        "Yiwei Sheng",
        "Shuang Chen",
        "Jian Li",
        "Dazhao Du",
        "Song Guo",
      ],
      venue: "Transactions on Machine Learning Research (TMLR)",
      date: "Oct 2026",
      year: 2026,
      abbr: "TMLR",
      preview: "/assets/img/publication_preview/gui-survey.png",
      previewWidth: 3610,
      previewHeight: 2368,
      selected: true,
      links: [
        { label: "arXiv", url: "https://arxiv.org/abs/2604.27955" },
        { label: "HTML", url: "https://openreview.net/forum?id=cLFnzcCYx6" },
        { label: "Code", url: "https://github.com/Steve2457/Awesome-RL-GUI-Agents" },
      ],
    },
    {
      id: "hu2026context",
      title: "Context-Agent: Dynamic Discourse Trees for Non-Linear Dialogue",
      authors: [
        "Junan Hu",
        "Shudan Guo",
        "Wenqi Liu",
        "Jianhua Yin",
        "Yinwei Wei",
      ],
      venue: "ACL 2026 Findings",
      date: "2026",
      year: 2026,
      abbr: "ACL",
      preview: "/assets/img/publication_preview/contex-agent.png",
      previewWidth: 3766,
      previewHeight: 1949,
      selected: true,
      links: [
        { label: "arXiv", url: "https://arxiv.org/abs/2604.05552" },
        { label: "Code", url: "https://github.com/Steve2457/Context-Agent" },
      ],
    },
  ],

  // 页脚信息
  footerHtml: `© Copyright 2026 Junan Hu. Hosted by <a href="https://pages.github.com/" target="_blank" rel="noopener noreferrer">GitHub Pages</a>.`,
};
