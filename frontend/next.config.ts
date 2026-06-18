import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // 容器化部署：输出自带最小运行时的 standalone 产物（node server.js）
  output: "standalone",
  // 允许 .md / .mdx 作为内容模块被导入（博客文章正文）
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

// MDX 编译封装；同时处理 .md（aicook 文档）与 .mdx（博客）。
// 后续可在此挂载 remark / rehype 插件（代码高亮、目录等）。
const withMDX = createMDX({
  extension: /\.mdx?$/,
  // Turbopack 下插件须用字符串形式（JS 函数无法传给 Rust）。
  // remark-gfm：GFM 表格、删除线、任务列表、自动链接等。
  // remark-breaks：把单个换行（软换行）渲染为 <br>，让文档里的回车体现为换行。
  options: {
    remarkPlugins: ["remark-gfm", "remark-breaks"],
  },
});

export default withMDX(nextConfig);
