/**
 * Coze API 工具函数
 * 用于处理图片上传和工作流调用
 */

const COZE_API_BASE = 'https://api.coze.cn';
const WORKFLOW_ID = process.env.NEXT_PUBLIC_COZE_WORKFLOW_ID || '7553549738953572406';
const PERSONAL_TOKEN = process.env.COZE_PERSONAL_TOKEN;

export interface CozeUploadResponse {
  code: number;
  msg: string;
  data?: {
    file_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    file_url: string;
  };
}

export interface CozeWorkflowResponse {
  code: number;
  msg: string;
  data?: {
    workflow_run_id: string;
    output?: string;
  };
}

export type PromptType = 'Normal' | 'Flux' | 'Midjourney' | 'StableDiffusion';

/**
 * 上传图片到 Coze
 * @param file 图片文件
 * @returns 上传结果
 */
export async function uploadImageToCoze(file: File): Promise<CozeUploadResponse> {
  try {
    // 计算文件的简单哈希值用于验证
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const shortHash = hashHex.substring(0, 16);
    
    console.log('开始上传图片到Coze，文件信息:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      hash: shortHash
    });
    
    // 重新创建File对象，因为arrayBuffer()会消耗原始文件
    const newFile = new File([arrayBuffer], file.name, { type: file.type });
    
    // 检查环境变量
    if (!PERSONAL_TOKEN) {
      throw new Error('COZE_PERSONAL_TOKEN not configured');
    }
    
    console.log('使用API端点:', `${COZE_API_BASE}/v1/files/upload`);
    console.log('使用Token:', PERSONAL_TOKEN ? `${PERSONAL_TOKEN.substring(0, 10)}...` : 'Not set');
    
    const formData = new FormData();
    formData.append('file', newFile);

    const response = await fetch(`${COZE_API_BASE}/v1/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERSONAL_TOKEN}`,
        // 不要手动设置 Content-Type，让浏览器自动设置 multipart/form-data 边界
      },
      body: formData,
    });

    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('上传成功，结果:', result);
    return result;
  } catch (error) {
    console.error('Error uploading image to Coze:', error);
    throw error;
  }
}

/**
 * 上传图片URL到 Coze
 * @param imageUrl 图片URL
 * @returns 上传结果
 */
export async function uploadImageUrlToCoze(imageUrl: string): Promise<CozeUploadResponse> {
  try {
    // 首先获取图片数据
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBlob = await imageResponse.blob();
    const fileName = imageUrl.split('/').pop() || 'image.jpg';
    const file = new File([imageBlob], fileName, { type: imageBlob.type });

    return await uploadImageToCoze(file);
  } catch (error) {
    console.error('Error uploading image URL to Coze:', error);
    throw error;
  }
}

/**
 * 调用 Coze 工作流
 * @param promptType 提示词类型
 * @param imageFileId 图片文件ID（从上传接口获得）
 * @returns 工作流执行结果
 */
export async function runCozeWorkflow(
  promptType: PromptType,
  imageFileId: string
): Promise<CozeWorkflowResponse> {
  try {
    const requestId = Date.now().toString();
    const requestBody = {
      workflow_id: WORKFLOW_ID,
      parameters: {
        PromptType: promptType,
        img: `{"file_id":"${imageFileId}"}`,
      },
    };
    
    console.log(`[${requestId}] 调用工作流API开始`);
    console.log(`[${requestId}] 请求参数:`, { 
      promptType, 
      imageFileId, 
      workflowId: WORKFLOW_ID,
      timestamp: new Date().toISOString()
    });
    console.log(`[${requestId}] 完整请求体:`, JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${COZE_API_BASE}/v1/workflow/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERSONAL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[${requestId}] 工作流API响应状态:`, response.status);
    console.log(`[${requestId}] 工作流API响应头:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] 工作流API错误响应:`, errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const result = await response.json();
    console.log(`[${requestId}] 工作流API完整响应:`, JSON.stringify(result, null, 2));
    
    // 特别记录输出内容用于一致性分析
    if (result.data?.output) {
      console.log(`[${requestId}] 生成的提示词内容:`, result.data.output);
      console.log(`[${requestId}] 提示词长度:`, result.data.output.length);
      console.log(`[${requestId}] 提示词哈希:`, await generateSimpleHash(result.data.output));
    }
    
    return result;
  } catch (error) {
    console.error('Error running Coze workflow:', error);
    throw error;
  }
}

// 辅助函数：生成简单哈希用于比较
async function generateSimpleHash(text: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  } catch (error) {
    return 'hash-error';
  }
}

/**
 * 根据AI模型类型获取对应的PromptType
 * @param aiModel AI模型类型
 * @returns PromptType
 */
export function getPromptTypeFromAIModel(aiModel: string): PromptType {
  switch (aiModel) {
    case 'general':
      return 'Normal';
    case 'flux':
      return 'Flux';
    case 'midjourney':
      return 'Midjourney';
    case 'stable-diffusion':
      return 'StableDiffusion';
    default:
      return 'Normal';
  }
}

/**
 * 完整的图片转提示词流程
 * @param imageSource 图片源（File对象或URL字符串）
 * @param aiModel AI模型类型
 * @returns 生成的提示词
 */
export async function generatePromptFromImage(
  imageSource: File | string,
  aiModel: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('aiModel', aiModel);
    
    if (typeof imageSource === 'string') {
      formData.append('imageUrl', imageSource);
    } else {
      formData.append('imageFile', imageSource);
    }

    const response = await fetch('/api/generate-prompt', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.prompt) {
      throw new Error(`API error: ${result.error || 'Unknown error'}`);
    }

    return result.prompt;
  } catch (error) {
    console.error('Error in generatePromptFromImage:', error);
    throw error;
  }
}