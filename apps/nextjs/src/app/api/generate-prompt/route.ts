import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCoze, uploadImageUrlToCoze, runCozeWorkflow, getPromptTypeFromAIModel } from '~/lib/coze-api';
import { 
  generateImageHash, 
  getCachedPrompt, 
  setCachedPrompt, 
  cleanExpiredCache,
  getCacheStats 
} from '~/lib/prompt-cache';

interface CozeResponse {
  success: boolean;
  prompt?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 清理过期缓存
    cleanExpiredCache();

    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;
    const aiModel = formData.get('aiModel') as string;
    const useCache = formData.get('useCache') === 'true';

    if (!image && !imageUrl) {
      return NextResponse.json({ error: '请提供图片文件或图片URL' }, { status: 400 });
    }

    if (!aiModel) {
      return NextResponse.json({ error: '请选择AI模型' }, { status: 400 });
    }

    let imageHash: string;
    let uploadResult: { success: boolean; file_id?: string; error?: string };

    // 生成图片哈希值用于缓存
    if (image) {
      const imageBuffer = Buffer.from(await image.arrayBuffer());
      imageHash = generateImageHash(imageBuffer, aiModel);
      
      // 检查缓存
      if (useCache) {
        const cachedPrompt = getCachedPrompt(imageHash);
        if (cachedPrompt) {
          console.log('Cache hit for image hash:', imageHash);
          return NextResponse.json({ 
            success: true, 
            prompt: cachedPrompt,
            cached: true,
            cacheStats: getCacheStats()
          });
        }
      }

      // 上传图片到Coze
      uploadResult = await uploadImageToCoze(image);
    } else if (imageUrl) {
      // 对于URL，使用URL+模型作为哈希
      imageHash = generateImageHash(Buffer.from(imageUrl), aiModel);
      
      // 检查缓存
      if (useCache) {
        const cachedPrompt = getCachedPrompt(imageHash);
        if (cachedPrompt) {
          console.log('Cache hit for image URL hash:', imageHash);
          return NextResponse.json({ 
            success: true, 
            prompt: cachedPrompt,
            cached: true,
            cacheStats: getCacheStats()
          });
        }
      }

      // 上传图片URL到Coze
      uploadResult = await uploadImageUrlToCoze(imageUrl);
    } else {
      return NextResponse.json({ error: '未提供有效的图片' }, { status: 400 });
    }

    if (!uploadResult.success || !uploadResult.file_id) {
      return NextResponse.json({ 
        error: uploadResult.error || '图片上传失败' 
      }, { status: 500 });
    }

    // 获取提示词类型
    const promptType = getPromptTypeFromAIModel(aiModel);

    // 运行Coze工作流
    const workflowResult = await runCozeWorkflow(uploadResult.file_id, promptType);

    if (!workflowResult.success) {
      return NextResponse.json({ 
        error: workflowResult.error || '工作流执行失败' 
      }, { status: 500 });
    }

    const prompt = workflowResult.prompt;

    // 缓存结果
    if (useCache && prompt) {
      setCachedPrompt(imageHash, prompt);
      console.log('Cached prompt for hash:', imageHash);
    }

    return NextResponse.json({ 
      success: true, 
      prompt,
      cached: false,
      cacheStats: getCacheStats()
    });

  } catch (error) {
    console.error('Generate prompt error:', error);
    return NextResponse.json({ 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}