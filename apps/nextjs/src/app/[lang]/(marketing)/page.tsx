import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "~/lib/get-dictionary";

import { Button } from "@saasfly/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";
import * as Icons from "@saasfly/ui/icons";

import type { Locale } from "~/config/i18n-config";

export default async function IndexPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 主标题区域 */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            使用图片提示词创作更
            <br />
            好的AI艺术
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            利用强大的AI工具，将您的创意转化为令人惊叹的艺术作品
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg">
              开始创作
            </Button>
            <Button
              variant="outline"
              className="border-gray-400 text-gray-300 hover:bg-gray-800 px-8 py-3 rounded-lg text-lg"
            >
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* 功能卡片区域 */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href={`/${lang}/image-to-prompt`}>
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Icons.Image className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">图片转提示词</CardTitle>
                <CardDescription className="text-gray-400">
                  将图片转换为提示词，以生成您自己的图片
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Icons.Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">魔法增强</CardTitle>
              <CardDescription className="text-gray-400">
                将简单文本转化为详细、描述性的图片提示词
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Icons.Bot className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">AI图片描述生成器</CardTitle>
              <CardDescription className="text-gray-400">
                让AI帮助您详细理解和分析任何图片
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Icons.Palette className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">AI图片生成器</CardTitle>
              <CardDescription className="text-gray-400">
                描述您的图片提示词，我们将为您生成图片
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* AI驱动的图片提示词工具 */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            AI驱动的图片提示词工具
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">图片转提示词</h3>
            <p className="text-gray-300 mb-6">
              上传任何图片，我们的AI将分析并生成详细的提示词，帮助您重现或改进图片风格。
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              立即尝试
            </Button>
          </div>
          <div className="relative">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center">
                <Icons.Image className="w-16 h-16 text-white/50" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-600 rounded w-3/4"></div>
                <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                <div className="h-3 bg-slate-600 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 图片提示词生成器 */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Icons.User className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 flex-1">
                    <p className="text-white text-sm">
                      请生成一个科幻风格的提示词
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Icons.Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-purple-900/50 rounded-lg p-3 flex-1">
                    <p className="text-white text-sm">
                      futuristic cityscape, neon lights, cyberpunk style,
                      high-tech architecture, flying cars, digital art, ultra
                      detailed, 8k resolution
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              图片提示词生成器
            </h3>
            <p className="text-gray-300 mb-6">
              描述您想要的图片风格，AI将为您生成专业的提示词，适用于各种AI绘画工具。
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              开始生成
            </Button>
          </div>
        </div>
      </section>

      {/* AI图片生成器 */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">AI图片生成器</h3>
            <p className="text-gray-300 mb-6">
              使用我们的AI图片生成器，直接从提示词创建令人惊叹的艺术作品。支持多种风格和分辨率。
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              立即生成
            </Button>
          </div>
          <div className="relative">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full h-32 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Icons.Sparkles className="w-8 h-8 text-white/50" />
                </div>
                <div className="w-full h-32 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Icons.Palette className="w-8 h-8 text-white/50" />
                </div>
                <div className="w-full h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Icons.Image className="w-8 h-8 text-white/50" />
                </div>
                <div className="w-full h-32 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Icons.Zap className="w-8 h-8 text-white/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI图片描述生成器 */}
      <section className="container mx-auto px-4 py-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                <Icons.FileText className="w-16 h-16 text-white/50" />
              </div>
              <div className="space-y-3">
                <h4 className="text-white font-semibold">AI生成的描述：</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  这是一幅充满未来感的数字艺术作品，展现了一个霓虹灯闪烁的赛博朋克城市景观。
                  高耸的摩天大楼被五彩斑斓的光线照亮，飞行汽车在空中穿梭...
                </p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              AI图片描述生成器
            </h3>
            <p className="text-gray-300 mb-6">
              上传图片，获得详细的AI生成描述。完美适用于内容创作、SEO优化和无障碍访问。
            </p>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              生成描述
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
