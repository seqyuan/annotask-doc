import { defineUserConfig } from "vuepress";
import recoTheme from "vuepress-theme-reco";
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  title: "annotask",
  description: "A go binaries for parallel task execution - 并行任务执行工具",
  bundler: viteBundler(),
  theme: recoTheme({
    logo: "/logo.png",
    author: "Yuan Zan",
    authorAvatar: "/head.png",
    docsRepo: "https://github.com/seqyuan/annotask-doc",
    docsBranch: "main",
    docsDir: ".",
    lastUpdatedText: "",
    // series 为原 sidebar
    series: {
      "/blogs/guide/": [
        {
          text: "指南",
          children: [
            "introduce",
            "installation",
            "usage",
            "database",
            "features",
            "faq"
          ],
        },
      ],
      "/blogs/advanced/": [
        {
          text: "高级",
          children: [
            "thread-analysis"
          ],
        },
      ],
      "/blogs/other/": [
        {
          text: "其他",
          children: [
            "changelog"
          ],
        },
      ],
    },
    navbar: [
      { text: "Home", link: "/" },
      {
        text: "文档",
        children: [
          { text: "介绍", link: "/blogs/guide/introduce" },
          { text: "安装指南", link: "/blogs/guide/installation" },
          { text: "使用方法", link: "/blogs/guide/usage" },
          { text: "数据库结构", link: "/blogs/guide/database" },
          { text: "功能特性", link: "/blogs/guide/features" },
          { text: "常见问题", link: "/blogs/guide/faq" },
        ],
      },
      {
        text: "高级",
        children: [
          { text: "线程分析", link: "/blogs/advanced/thread-analysis" },
        ],
      },
      {
        text: "其他",
        children: [
          { text: "更新日志", link: "/blogs/other/changelog" },
        ],
      },
    ],
    bulletin: {
      body: [
        {
          type: "text",
          content: `🎉🎉🎉  annotask 是一个并行任务执行工具，支持本地并行执行和 SGE 集群投递两种模式。`,
          style: "font-size: 12px;",
        },
        {
          type: "hr",
        },
        {
          type: "title",
          content: "GitHub",
        },
        {
          type: "text",
          content: `
          <ul>
            <li><a href="https://github.com/seqyuan/annotask">annotask 项目</a></li>
            <li><a href="https://github.com/seqyuan/annotask/issues">Issues</a></li>
          </ul>`,
          style: "font-size: 12px;",
        },
        {
          type: "hr",
        },
        {
          type: "title",
          content: "关于",
        },
        {
          type: "text",
          content: `
          <ul>
            <li>微信公众号：seqyuan</li>
          </ul>`,
          style: "font-size: 12px;",
        },
      ],
    },
    // commentConfig: {
    //   type: 'valine',
    //   // options 与 1.x 的 valineConfig 配置一致
    //   options: {
    //     // appId: 'xxx',
    //     // appKey: 'xxx',
    //     // placeholder: '填写邮箱可以收到回复提醒哦！',
    //     // verify: true, // 验证码服务
    //     // notify: true,
    //     // recordIP: true,
    //     // hideComments: true // 隐藏评论
    //   },
    // },
  }),
  // debug: true,
});

