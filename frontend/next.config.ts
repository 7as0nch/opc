import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // 容器化部署：输出自带最小运行时的 standalone 产物（node server.js）
  output: "standalone",
  // 允许 .md / .mdx 作为内容模块被导入（博客文章正文）
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

// MDX 编译封装；后续可在此挂载 remark / rehype 插件（代码高亮、目录等）
const withMDX = createMDX({});

export default withMDX(nextConfig);
