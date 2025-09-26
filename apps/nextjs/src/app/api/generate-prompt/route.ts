import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCoze, uploadImageUrlToCoze, runCozeWorkflow, getPromptTypeFromAIModel } from '@/lib/coze-api';
import { 
  generateImageHash, 
  getCachedPrompt, 
  setCachedPrompt, 
  cleanExpiredCache,
  getCacheStats 
} from '@/lib/prompt-cache';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;
    const aiModel = formData.get('aiModel') as string;
    const useCache = formData.get('useCache') !== 'false'; // 默认启用缓存

    if (!aiModel) {
      return NextResponse.json({ error: 'AI model is required' }, { status: 400 });
    }

    if (!image && !imageUrl) {
      return NextResponse.json({ error: 'Either image file or image URL is required' }, { status: 400 });
    }

    // 清理过期缓存
    cleanExpiredCache();

    // 生成图片哈希用于缓存
    const imageSource = image || imageUrl!;
    const imageHash = await generateImageHash(imageSource);
    
    console.log('图片哈希:', imageHash);
    console.log('AI模型:', aiModel);
    console.log('使用缓存:', useCache);
    console.log('缓存统计:', getCacheStats());

    // 检查缓存
    if (useCache) {
      const cachedPrompt = getCachedPrompt(imageHash, aiModel);
      if (cachedPrompt) {
        console.log('返回缓存的提示词，长度:', cachedPrompt.length);
        return NextResponse.json({ 
          prompt: cachedPrompt,
          fromCache: true,
          cacheStats: getCacheStats()
        });
      }
    }

    let fileId: string;

    // 上传图片到 Coze
    if (image) {
      console.log('Uploading image file to Coze...');
      const uploadResult = await uploadImageToCoze(image);
      if (uploadResult.code !== 0 || !uploadResult.data?.file_id) {
        console.error('Image upload failed:', uploadResult);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
      fileId = uploadResult.data.file_id;
      console.log('Image upload successful, file ID:', fileId);
    } else if (imageUrl) {
      console.log('Uploading image URL to Coze...');
      const uploadResult = await uploadImageUrlToCoze(imageUrl);
      if (uploadResult.code !== 0 || !uploadResult.data?.file_id) {
        console.error('Image URL upload failed:', uploadResult);
        return NextResponse.json({ error: 'Failed to upload image URL' }, { status: 500 });
      }
      fileId = uploadResult.data.file_id;
      console.log('Image URL upload successful, file ID:', fileId);
    } else {
      return NextResponse.json({ error: 'No valid image source provided' }, { status: 400 });
    }

    // 获取 PromptType
    const promptType = getPromptTypeFromAIModel(aiModel);
    console.log('Prompt type:', promptType);

    // 调用工作流
    console.log('调用工作流，参数:', { promptType, imageFileId: fileId });
    const workflowResult = await runCozeWorkflow(promptType, fileId);

    if (workflowResult.code !== 0) {
      console.error('工作流执行失败:', workflowResult);
      return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
    }

    console.log('工作流执行成功:', workflowResult);

    // 解析输出
    let output = '';
    if (workflowResult.data) {
      try {
        const parsedData = JSON.parse(workflowResult.data);
        output = parsedData.output || '';
      } catch (parseError) {
        console.error('Failed to parse workflow output:', parseError);
        output = workflowResult.data;
      }
    }

    // 缓存结果
    if (useCache && output) {
      setCachedPrompt(imageHash, aiModel, output);
    }

    return NextResponse.json({ 
      prompt: output,
      debug_url: workflowResult.debug_url,
      fromCache: false,
      imageHash: imageHash.substring(0, 16), // 只返回前16位用于调试
      cacheStats: getCacheStats()
    });

  } catch (error) {
    console.error('Error in generate-prompt API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}