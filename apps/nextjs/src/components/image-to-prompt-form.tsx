"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";

import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@saasfly/ui/select";
import * as Icons from "@saasfly/ui/icons";

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
    if (url) {
      setImagePreview(url);
    }
  };

  const handleGenerate = async () => {
    if (!imagePreview) return;
    
    setIsGenerating(true);
    // 模拟API调用
    setTimeout(() => {
      const samplePrompts = {
        general: "一幅现代数字艺术作品，展现了充满活力的色彩和抽象的几何形状，具有未来主义的设计风格。",
        flux: "vibrant digital art, abstract geometric shapes, futuristic design, modern composition",
        midjourney: "vibrant digital art, abstract geometric shapes, futuristic design, modern composition --ar 16:9 --v 6 --style raw",
        "stable-diffusion": "vibrant digital art, abstract geometric shapes, futuristic design, modern composition, high quality, detailed, 8k resolution"
      };
      setGeneratedPrompt(samplePrompts[selectedModel]);
      setIsGenerating(false);
    }, 2000);
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

      <div className="space-y-8">
        {/* 第一行：上传图片和图片预览 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧 - 图片上传区域 */}
          <div className="space-y-6">
            {/* 上传选项 */}
            <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
              <Button 
                variant="ghost"
                className={cn(
                  "flex-1 rounded-md",
                  uploadMode === "upload" 
                    ? "bg-slate-700 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-slate-700"
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
                    : "text-gray-400 hover:text-white hover:bg-slate-700"
                )}
                onClick={() => setUploadMode("url")}
              >
                输入图片URL
              </Button>
            </div>

            {/* 图片上传区域 */}
            {uploadMode === "upload" ? (
              <div className="bg-slate-800/30 border-2 border-dashed border-slate-600 rounded-lg p-8">
                <div 
                  className="text-center cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Icons.Image className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-medium mb-2">上传一张图片或拖拽上传</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    PNG, JPG 或 WEBP 格式，大小不超过 4MB
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    选择文件
                  </Button>
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
              <div className="space-y-2">
                <Label className="text-white">图片URL</Label>
                <Input
                  type="url"
                  placeholder="输入图片URL..."
                  value={imageUrl}
                  onChange={handleUrlChange}
                  className="bg-slate-800/50 border-slate-600 text-white"
                />
              </div>
            )}
          </div>

          {/* 右侧 - 图片预览区域 */}
          <div>
            <Label className="text-white text-base font-medium mb-4 block">图片预览</Label>
            <div className="bg-slate-800/30 border border-slate-600 rounded-lg p-8">
              {imagePreview ? (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center mb-4 mx-auto">
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
          <Label className="text-white text-base font-medium">选择 AI 模型</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiModels.map((model) => {
              const IconComponent = model.icon;
              const isSelected = selectedModel === model.id;
              return (
                <div 
                  key={model.id}
                  className={cn(
                    "bg-slate-800/50 border border-slate-600 rounded-lg p-4 cursor-pointer transition-all",
                    isSelected 
                      ? "border-blue-500 bg-blue-600/10" 
                      : "hover:border-slate-500 hover:bg-slate-800/70"
                  )}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      model.color === "purple" && "bg-purple-600",
                      model.color === "blue" && "bg-blue-600",
                      model.color === "green" && "bg-green-600",
                      model.color === "orange" && "bg-orange-600"
                    )}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium mb-1">{model.name}</h4>
                      <p className="text-gray-400 text-xs">{model.description}</p>
                    </div>
                    <div className={cn(
                      "w-4 h-4 border-2 rounded-full",
                      isSelected 
                        ? "border-blue-500 bg-blue-500" 
                        : "border-slate-500"
                    )}>
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
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
              <SelectItem value="english" className="text-white">English</SelectItem>
              <SelectItem value="chinese" className="text-white">中文</SelectItem>
              <SelectItem value="japanese" className="text-white">日本語</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 第四行：生成按钮和查看历史 */}
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
          <Button variant="link" className="text-purple-400 hover:text-purple-300">
            查看历史
          </Button>
        </div>

        {/* 第五行：生成结果区域 */}
        <div>
          <Label className="text-white text-base font-medium mb-4 block">生成的提示词</Label>
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