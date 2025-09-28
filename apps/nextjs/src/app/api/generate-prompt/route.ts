import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { CozeUploadResponse } from "~/lib/coze-api";
import {
  uploadImageToCoze,
  uploadImageUrlToCoze,
  runCozeWorkflow,
  getPromptTypeFromAIModel,
} from "~/lib/coze-api";
import {
  generateImageHash,
  getCachedPrompt,
  setCachedPrompt,
  cleanExpiredCache,
  getCacheStats,
} from "~/lib/prompt-cache";

export async function POST(request: NextRequest) {
  try {
    // 清理过期缓存
    cleanExpiredCache();

    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;
    const aiModel = formData.get("aiModel") as string;
    const useCache = formData.get("useCache") === "true";

    if (!image && !imageUrl) {
      return NextResponse.json(
        { error: "请提供图片文件或图片URL" },
        { status: 400 },
      );
    }

    if (!aiModel) {
      return NextResponse.json({ error: "请选择AI模型" }, { status: 400 });
    }

    let imageHash: string;
    let uploadResult: CozeUploadResponse;

    // 生成图片哈希值用于缓存
    if (image) {
      imageHash = await generateImageHash(image);

      // 检查缓存
      if (useCache) {
        const cachedPrompt = getCachedPrompt(imageHash, aiModel);
        if (cachedPrompt) {
          console.log("Cache hit for image hash:", imageHash);
          return NextResponse.json({
            success: true,
            prompt: cachedPrompt,
            cached: true,
            cacheStats: getCacheStats(),
          });
        }
      }

      // 上传图片到Coze
      uploadResult = await uploadImageToCoze(image);
    } else if (imageUrl) {
      // 对于URL，使用URL作为哈希
      imageHash = await generateImageHash(imageUrl);

      // 检查缓存
      if (useCache) {
        const cachedPrompt = getCachedPrompt(imageHash, aiModel);
        if (cachedPrompt) {
          console.log("Cache hit for image URL hash:", imageHash);
          return NextResponse.json({
            success: true,
            prompt: cachedPrompt,
            cached: true,
            cacheStats: getCacheStats(),
          });
        }
      }

      // 上传图片URL到Coze
      uploadResult = await uploadImageUrlToCoze(imageUrl);
    } else {
      return NextResponse.json({ error: "未提供有效的图片" }, { status: 400 });
    }

    if (uploadResult.code !== 0) {
      return NextResponse.json(
        {
          error: uploadResult.msg || "图片上传失败",
        },
        { status: 500 },
      );
    }

    if (!uploadResult.data?.file_id) {
      return NextResponse.json(
        {
          error: "上传成功但未获取到文件ID",
        },
        { status: 500 },
      );
    }

    // 获取提示词类型
    const promptType = getPromptTypeFromAIModel(aiModel);

    // 运行Coze工作流
    const workflowResult = await runCozeWorkflow(
      promptType,
      uploadResult.data.file_id,
    );

    if (workflowResult.code !== 0) {
      return NextResponse.json(
        {
          error: workflowResult.msg || "工作流执行失败",
        },
        { status: 500 },
      );
    }

    const prompt = workflowResult.data?.output;

    // 缓存结果
    if (useCache && prompt) {
      setCachedPrompt(imageHash, aiModel, prompt);
      console.log("Cached prompt for hash:", imageHash);
    }

    return NextResponse.json({
      success: true,
      prompt,
      cached: false,
      cacheStats: getCacheStats(),
    });
  } catch (error) {
    console.error("Generate prompt error:", error);
    return NextResponse.json(
      {
        error: "服务器内部错误",
      },
      { status: 500 },
    );
  }
}
