"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@saasfly/ui/select";
import { Switch } from "@saasfly/ui/switch";
import * as Icons from "@saasfly/ui/icons";

import { generatePromptFromImage } from "~/lib/coze-api";

type AIModel = "general" | "flux" | "midjourney" | "stable-diffusion";
type UploadMode = "upload" | "url";

interface ImageToPromptFormProps {
  className?: string;
}

export function ImageToPromptForm({ className }: ImageToPromptFormProps) {
  const [uploadMode, setUploadMode] = useState<UploadMode>("upload");
  const [selectedModel, setSelectedModel] = useState<AIModel>("general");
  const [language, setLanguage] = useState("english");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useConsistentMode, setUseConsistentMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aiModels = [
    {
      id: "general" as AIModel,
      name: "通用描述",
      description: "图片的自然语言描述",
      icon: Icons.Zap,
      color: "purple",
    },
    {
      id: "flux" as AIModel,
      name: "Flux",
      description: "针对 Flux AI 模型优化，简洁的自然语言",
      icon: Icons.Sparkles,
      color: "blue",
    },
    {
      id: "midjourney" as AIModel,
      name: "Midjourney",
      description: "为 Midjourney 生成定制，包含 Midjourney 参数",
      icon: Icons.Bot,
      color: "green",
    },
    {
      id: "stable-diffusion" as AIModel,
      name: "Stable Diffusion",
      description: "为 Stable Diffusion 模型格式化",
      icon: Icons.Palette,
      color: "orange",
    },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("用户选择的文件:", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        lastModifiedDate: new Date(file.lastModified).toISOString(),
      });

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      console.log("用户拖拽的文件:", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        lastModifiedDate: new Date(file.lastModified).toISOString(),
      });

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setImageUrl(url);
    // 不再自动设置预览，等待用户点击获取图片按钮
  };

  const handleFetchImage = async () => {
    try {
      console.log("=== handleFetchImage 开始执行 ===");
      console.log("当前 imageUrl:", imageUrl);
      console.log("imageUrl.trim():", imageUrl.trim());

      if (!imageUrl.trim()) {
        console.log("URL为空，显示警告");
        alert("请输入有效的图片URL");
        return;
      }

      try {
        console.log("开始获取图片:", imageUrl);
        console.log("清除 imageFile 状态");

        // 使用 React 的批量更新来避免状态冲突
        const trimmedUrl = imageUrl.trim();

        // 先清除文件状态，然后设置URL预览
        setImageFile(null);

        // 添加延迟确保状态更新完成
        setTimeout(() => {
          try {
            console.log("设置图片预览:", trimmedUrl);
            setImagePreview(trimmedUrl);
            console.log("图片预览设置成功");
            console.log("=== handleFetchImage 执行完成 ===");
          } catch (error) {
            console.error("setTimeout callback 发生错误:", error);
          }
        }, 0);
      } catch (error) {
        console.error("=== handleFetchImage 发生错误 ===");
        console.error("错误详情:", error);
        console.error(
          "错误堆栈:",
          error instanceof Error ? error.stack : "无堆栈信息",
        );
        alert(
          "设置图片预览失败: " +
            (error instanceof Error ? error.message : String(error)),
        );
      }
    } catch (error) {
      console.error("handleFetchImage 外层错误:", error);
    }
  };

  const handleGenerate = async () => {
    if (!imagePreview && !imageUrl) {
      toast.error("请先上传图片或输入图片URL");
      return;
    }

    if (!selectedModel) {
      toast.error("请选择AI模型");
      return;
    }

    setIsGenerating(true);
    setGeneratedPrompt("");

    try {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      console.log(`[${requestId}] 生成提示词请求开始`);
      console.log(`[${requestId}] 请求时间:`, timestamp);
      console.log(`[${requestId}] 图片来源:`, imageFile ? "file" : "url");
      console.log(
        `[${requestId}] 图片值:`,
        imageFile
          ? `文件名: ${imageFile.name}, 大小: ${imageFile.size}`
          : imageUrl,
      );
      console.log(`[${requestId}] 选择的AI模型:`, selectedModel);
      console.log(`[${requestId}] 启用缓存:`, useConsistentMode);

      const formData = new FormData();

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      formData.append("aiModel", selectedModel);
      formData.append("useCache", useConsistentMode.toString());

      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate prompt");
      }

      const data = await response.json();
      console.log(`[${requestId}] API响应:`, data);

      if (data.fromCache) {
        console.log(`[${requestId}] 使用了缓存结果`);
        toast.success("已返回缓存的提示词（保证一致性）");
      } else {
        console.log(`[${requestId}] 生成了新的提示词`);
        toast.success("提示词生成成功");
      }

      setGeneratedPrompt(data.prompt || "");
    } catch (error) {
      console.error("生成提示词失败:", error);
      toast.error(error instanceof Error ? error.message : "生成提示词失败");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
  };

  return (
    <div className={cn("max-w-6xl mx-auto", className)}>
      {/* 标签页导航 */}
      <div className="flex space-x-1 mb-8 bg-slate-800/30 p-1 rounded-lg w-fit mx-auto">
        <Button
          variant="ghost"
          className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md"
        >
          <Icons.Image className="w-4 h-4 mr-2" />
          图片转提示词
        </Button>
        <Button
          variant="ghost"
          className="text-gray-400 hover:text-white hover:bg-slate-700 px-6 py-2 rounded-md"
        >
          <Icons.FileText className="w-4 h-4 mr-2" />
          文本转提示词
        </Button>
      </div>

      {/* 图片转提示词功能区域 */}
      <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-8 space-y-8">
        {/* 第一行：上传图片和图片预览 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧 - 图片上传区域 */}
          <div className="space-y-4">
            {/* 上传选项 */}
            <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
              <Button
                variant="ghost"
                className={cn(
                  "flex-1 rounded-md",
                  uploadMode === "upload"
                    ? "bg-slate-700 text-white"
                    : "text-gray-400 hover:text-white hover:bg-slate-700",
                )}
                onClick={() => setUploadMode("upload")}
              >
                上传图片
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "flex-1 rounded-md",
                  uploadMode === "url"
                    ? "bg-slate-700 text-white"
                    : "text-gray-400 hover:text-white hover:bg-slate-700",
                )}
                onClick={() => setUploadMode("url")}
              >
                输入图片URL
              </Button>
            </div>

            {/* 图片上传区域 */}
            {uploadMode === "upload" ? (
              <div className="bg-slate-800/30 border-2 border-dashed border-slate-600 rounded-lg p-8 h-[300px] flex items-center justify-center">
                <div
                  className="text-center cursor-pointer w-full"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 border-2 border-slate-400 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Icons.Image className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-white font-medium mb-2">
                    上传一张图片或拖拽上传
                  </h3>
                  <p className="text-gray-400 text-sm">
                    PNG, JPG 或 WEBP 格式，大小不超过 4MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">图片URL</Label>
                  <Input
                    type="url"
                    placeholder="在这里粘贴您的图片链接"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                </div>
                <Button
                  disabled={!imageUrl.trim()}
                  onClick={handleFetchImage}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400"
                >
                  获取图片
                </Button>
              </div>
            )}
          </div>

          {/* 右侧 - 图片预览区域 */}
          <div className="space-y-4">
            <Label className="text-white text-lg font-medium">图片预览</Label>
            <div className="bg-slate-800/30 border border-slate-600 rounded-lg p-8 h-[300px] flex items-center justify-center">
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="w-full h-full rounded-lg object-contain"
                    onError={(e) => {
                      console.error("Image load error:", e);
                      console.error("Failed to load image:", imagePreview);
                      setImagePreview(null);
                    }}
                    onLoad={() => {
                      console.log("Image loaded successfully:", imagePreview);
                    }}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 border-2 border-slate-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Icons.Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">您的图片将显示在这里</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 第二行：AI模型选择 */}
        <div className="space-y-4">
          <Label className="text-white text-base font-medium">
            选择 AI 模型
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiModels.map((model) => {
              const isSelected = selectedModel === model.id;
              return (
                <div
                  key={model.id}
                  className={cn(
                    "bg-slate-800/50 border border-slate-600 rounded-lg p-4 cursor-pointer transition-all relative",
                    isSelected
                      ? "border-blue-500 bg-blue-600/10"
                      : "hover:border-slate-500 hover:bg-slate-800/70",
                  )}
                  onClick={() => setSelectedModel(model.id)}
                >
                  {/* 选中状态图标 - 右上角 */}
                  <div className="absolute top-2 right-2">
                    <div
                      className={cn(
                        "w-4 h-4 border-2 rounded-full",
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-500",
                      )}
                    >
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>

                  <div className="text-left">
                    <div>
                      <h4 className="text-white text-base font-medium mb-1">
                        {model.name}
                      </h4>
                      <p className="text-gray-400 text-xs">
                        {model.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 第三行：提示词语言选择 */}
        <div className="space-y-2">
          <Label className="text-white text-base font-medium">提示词语言</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="english" className="text-white">
                English
              </SelectItem>
              <SelectItem value="chinese" className="text-white">
                中文
              </SelectItem>
              <SelectItem value="japanese" className="text-white">
                日本語
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 第四行：一致性模式开关 */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Switch
              id="consistent-mode"
              checked={useConsistentMode}
              onCheckedChange={setUseConsistentMode}
            />
            <div>
              <Label
                htmlFor="consistent-mode"
                className="text-white text-base font-medium cursor-pointer"
              >
                一致性模式
              </Label>
              <p className="text-gray-400 text-sm">
                启用后，相同图片将返回一致的提示词结果（使用缓存）
              </p>
            </div>
          </div>
        </div>

        {/* 第五行：生成按钮和查看历史 */}
        <div className="flex items-center space-x-4">
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-8 text-lg"
            onClick={handleGenerate}
            disabled={!imagePreview || isGenerating}
          >
            {isGenerating ? (
              <>
                <Icons.Spinner className="w-4 h-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              "生成提示词"
            )}
          </Button>
          <Button
            variant="link"
            className="text-purple-400 hover:text-purple-300"
          >
            查看历史
          </Button>
        </div>

        {/* 第六行：生成结果区域 */}
        <div>
          <Label className="text-white text-base font-medium mb-4 block">
            生成的提示词
          </Label>
          <div className="bg-slate-800/30 border border-slate-600 rounded-lg p-6">
            {generatedPrompt ? (
              <div className="space-y-4">
                <div className="bg-slate-700/50 border border-slate-600 rounded-md p-4 min-h-[150px] text-white whitespace-pre-wrap">
                  {generatedPrompt}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="border-slate-600 text-gray-300 hover:bg-slate-700"
                  >
                    <Icons.Copy className="w-4 h-4 mr-2" />
                    复制
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-gray-300 hover:bg-slate-700"
                  >
                    <Icons.Copy className="w-4 h-4 mr-2" />
                    下载
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[200px] flex items-center justify-center">
                <p className="text-gray-400 text-center">
                  生成的提示词将在此处显示
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
