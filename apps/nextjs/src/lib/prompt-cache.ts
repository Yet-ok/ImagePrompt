/**
 * 提示词缓存管理
 * 用于解决Coze工作流随机性导致的一致性问题
 */

export interface CacheEntry {
  prompt: string;
  timestamp: number;
  aiModel: string;
  imageHash: string;
}

// 内存缓存存储
const promptCache = new Map<string, CacheEntry>();

// 缓存过期时间（24小时）
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * 生成图片内容的哈希值
 */
export async function generateImageHash(imageSource: File | string): Promise<string> {
  try {
    let buffer: ArrayBuffer;
    
    if (typeof imageSource === 'string') {
      // URL情况：使用URL作为哈希基础
      const encoder = new TextEncoder();
      buffer = encoder.encode(imageSource);
    } else {
      // File情况：读取文件内容
      buffer = await imageSource.arrayBuffer();
    }
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error generating image hash:', error);
    // 降级方案：使用时间戳和随机数
    return `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 生成缓存键
 */
export function generateCacheKey(imageHash: string, aiModel: string): string {
  return `${imageHash}_${aiModel}`;
}

/**
 * 获取缓存的提示词
 */
export function getCachedPrompt(imageHash: string, aiModel: string): string | null {
  const cacheKey = generateCacheKey(imageHash, aiModel);
  const entry = promptCache.get(cacheKey);
  
  if (!entry) {
    return null;
  }
  
  // 检查是否过期
  if (Date.now() - entry.timestamp > CACHE_EXPIRY_MS) {
    promptCache.delete(cacheKey);
    return null;
  }
  
  console.log(`缓存命中: ${cacheKey}`);
  return entry.prompt;
}

/**
 * 缓存提示词
 */
export function setCachedPrompt(
  imageHash: string, 
  aiModel: string, 
  prompt: string
): void {
  const cacheKey = generateCacheKey(imageHash, aiModel);
  const entry: CacheEntry = {
    prompt,
    timestamp: Date.now(),
    aiModel,
    imageHash,
  };
  
  promptCache.set(cacheKey, entry);
  console.log(`缓存设置: ${cacheKey}, 提示词长度: ${prompt.length}`);
}

/**
 * 清理过期缓存
 */
export function cleanExpiredCache(): void {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [key, entry] of promptCache.entries()) {
    if (now - entry.timestamp > CACHE_EXPIRY_MS) {
      promptCache.delete(key);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`清理了 ${cleanedCount} 个过期缓存条目`);
  }
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): {
  totalEntries: number;
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  const entries = Array.from(promptCache.values());
  
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }
  
  const timestamps = entries.map(e => e.timestamp);
  
  return {
    totalEntries: entries.length,
    oldestEntry: Math.min(...timestamps),
    newestEntry: Math.max(...timestamps),
  };
}

/**
 * 清空所有缓存
 */
export function clearAllCache(): void {
  const count = promptCache.size;
  promptCache.clear();
  console.log(`清空了所有缓存，共 ${count} 个条目`);
}