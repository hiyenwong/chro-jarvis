/**
 * 安全存储工具
 * 用于加密存储敏感信息（如 API Key）
 */

/**
 * 简单的加密/解密工具
 * 注意：这是一个基础实现，生产环境应使用 Chrome 的 crypto API 或更安全的方案
 */
class CryptoUtils {
  /**
   * 生成设备特定的密钥
   */
  private static async getDeviceKey(): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('chro-jarvis-device-key'),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('chro-jarvis-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * 加密文本
   */
  static async encrypt(text: string): Promise<string> {
    try {
      const key = await this.getDeviceKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(text);

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
      );

      // 组合 IV 和加密数据
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // 转换为 Base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('加密失败:', error);
      // 如果加密失败，返回原始文本（降级处理）
      return text;
    }
  }

  /**
   * 解密文本
   */
  static async decrypt(encryptedText: string): Promise<string> {
    try {
      const key = await this.getDeviceKey();
      const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('解密失败:', error);
      // 如果解密失败，返回原始文本（可能是未加密的数据）
      return encryptedText;
    }
  }

  /**
   * 生成哈希（用于验证）
   */
  static async hash(text: string): Promise<string> {
    const encoded = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 验证 API Key 格式
   */
  static validateApiKey(provider: string, apiKey: string): { valid: boolean; error?: string } {
    if (!apiKey || apiKey.trim().length === 0) {
      return { valid: false, error: 'API Key 不能为空' };
    }

    // 基本的格式验证
    const patterns: Record<string, RegExp> = {
      deepseek: /^sk-[a-zA-Z0-9]{48}$/,
      openai: /^sk-[a-zA-Z0-9]{48,}$/,
      zhipu: /^[a-f0-9]{64}$/,
      volcano: /^[a-f0-9]{32}$/,
      claude: /^sk-ant-[a-zA-Z0-9_-]{95,}$/,
    };

    const pattern = patterns[provider];
    if (pattern && !pattern.test(apiKey)) {
      return { valid: false, error: `${provider} API Key 格式不正确` };
    }

    return { valid: true };
  }
}

/**
 * 安全存储管理器
 */
class SecureStorageManager {
  private readonly PREFIX = 'secure_';
  private readonly HASH_SUFFIX = '_hash';

  /**
   * 存储加密的 API Key
   */
  async setApiKey(provider: string, apiKey: string): Promise<void> {
    try {
      // 验证 API Key 格式
      const validation = CryptoUtils.validateApiKey(provider, apiKey);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // 加密 API Key
      const encrypted = await CryptoUtils.encrypt(apiKey);
      const hash = await CryptoUtils.hash(apiKey);

      // 存储加密的密钥和哈希
      await this.set(this.PREFIX + provider, encrypted);
      await this.set(this.PREFIX + provider + this.HASH_SUFFIX, hash);
    } catch (error) {
      console.error('存储 API Key 失败:', error);
      throw error;
    }
  }

  /**
   * 获取解密的 API Key
   */
  async getApiKey(provider: string): Promise<string | null> {
    try {
      const encrypted = await this.get(this.PREFIX + provider);
      if (!encrypted) return null;

      const decrypted = await CryptoUtils.decrypt(encrypted);

      // 验证解密后的数据
      const storedHash = await this.get(this.PREFIX + provider + this.HASH_SUFFIX);
      if (storedHash) {
        const currentHash = await CryptoUtils.hash(decrypted);
        if (currentHash !== storedHash) {
          console.warn('API Key 哈希验证失败');
          return null;
        }
      }

      return decrypted;
    } catch (error) {
      console.error('获取 API Key 失败:', error);
      return null;
    }
  }

  /**
   * 验证存储的 API Key 是否有效
   */
  async verifyApiKey(provider: string): Promise<boolean> {
    const apiKey = await this.getApiKey(provider);
    return apiKey !== null && apiKey.length > 0;
  }

  /**
   * 删除存储的 API Key
   */
  async removeApiKey(provider: string): Promise<void> {
    await this.remove(this.PREFIX + provider);
    await this.remove(this.PREFIX + provider + this.HASH_SUFFIX);
  }

  /**
   * 检查是否有任何 API Key
   */
  async hasAnyApiKey(): Promise<boolean> {
    const providers = ['deepseek', 'openai', 'zhipu', 'volcano', 'claude'];
    for (const provider of providers) {
      if (await this.verifyApiKey(provider)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 通用存储方法
   */
  private async set(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else {
        // 降级到 localStorage
        try {
          localStorage.setItem(key, value);
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  /**
   * 通用获取方法
   */
  private async get(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result[key] || null);
          }
        });
      } else {
        // 降级到 localStorage
        try {
          resolve(localStorage.getItem(key));
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  /**
   * 通用删除方法
   */
  private async remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove([key], () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else {
        // 降级到 localStorage
        try {
          localStorage.removeItem(key);
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  }
}

/**
 * 导出单例
 */
export const secureStorage = new SecureStorageManager();
export { CryptoUtils };
