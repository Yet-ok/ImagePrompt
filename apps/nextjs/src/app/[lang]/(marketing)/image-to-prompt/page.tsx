import { Suspense } from "react";
import { Metadata } from "next";

import { ImageToPromptForm } from "~/components/image-to-prompt-form";
import { MainNav } from "~/components/main-nav";
import { SiteFooter } from "~/components/site-footer";
import { getDictionary } from "~/lib/get-dictionary";
import { LangProps } from "~/types";
import type { Locale } from "~/config/i18n-config";

export const metadata: Metadata = {
  title: "图片转提示词 - AI驱动的图片分析工具",
  description:
    "使用AI技术分析图片内容，生成高质量的提示词，支持多种AI模型格式。",
};

export default async function ImageToPromptPage({ params }: LangProps) {
  const dict = await getDictionary(params.lang as Locale);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="flex-1">
        <div className="container py-12">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              免费图片转提示词生成器
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              获取图片背后的提示词，定制属于您的图片
            </p>
          </div>

          {/* 主要内容区域 */}
          <ImageToPromptForm />
        </div>
      </main>

      <SiteFooter params={{ lang: params.lang }} dict={dict.common} />
    </div>
  );
}
