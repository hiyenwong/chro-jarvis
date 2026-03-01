/**
 * 请求类型（用于 token 统计）
 */
export type RequestType = 'chat' | 'translate';

// 重新导出其他类型
export * from './config';
export * from './chat';
export * from './tokenUsage';

/**
 * Chrome 插件通信消息类型
 */
export enum MessageType {
  // 翻译相关
  TRANSLATE_TEXT = 'TRANSLATE_TEXT',
  TRANSLATE_TEXT_RESPONSE = 'TRANSLATE_TEXT_RESPONSE',
  // 页面内容分析
  ANALYZE_PAGE = 'ANALYZE_PAGE',
  ANALYZE_PAGE_RESPONSE = 'ANALYZE_PAGE_RESPONSE',
  // 上下文管理
  GET_CONTEXT = 'GET_CONTEXT',
  GET_CONTEXT_RESPONSE = 'GET_CONTEXT_RESPONSE',
  SET_CONTEXT = 'SET_CONTEXT',
  SET_CONTEXT_RESPONSE = 'SET_CONTEXT_RESPONSE',
  // 插件状态
  GET_STATUS = 'GET_STATUS',
  GET_STATUS_RESPONSE = 'GET_STATUS_RESPONSE',
  // 配置管理
  GET_CONFIG = 'GET_CONFIG',
  GET_CONFIG_RESPONSE = 'GET_CONFIG_RESPONSE',
  SET_CONFIG = 'SET_CONFIG',
  SET_CONFIG_RESPONSE = 'SET_CONFIG_RESPONSE',
  // 错误处理
  ERROR = 'ERROR',
}

/**
 * 翻译服务类型
 */
export enum TranslationService {
  GOOGLE = 'google',
  BAIDU = 'baidu',
  YOUDAO = 'youdao',
  DEEPL = 'deepl',
}

/**
 * 语言类型
 */
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

/**
 * 翻译请求参数
 */
export interface TranslateRequest {
  text: string;
  from?: string;
  to?: string;
  service?: TranslationService;
}

/**
 * 翻译响应结果
 */
export interface TranslateResponse {
  text: string;
  translation: string;
  from: string;
  to: string;
  service: TranslationService;
  timestamp: number;
}

/**
 * 页面分析请求参数
 */
export interface AnalyzePageRequest {
  url: string;
  title: string;
  content?: string;
}

/**
 * 页面分析响应结果
 */
export interface AnalyzePageResponse {
  url: string;
  title: string;
  summary?: string;
  keywords?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  timestamp: number;
}

/**
 * 插件配置
 */
export interface PluginConfig {
  // 翻译配置
  defaultTranslationService: TranslationService;
  defaultFromLanguage: string;
  defaultToLanguage: string;
  // 界面配置
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  // 功能配置
  enableAutoTranslate: boolean;
  enablePageAnalysis: boolean;
  enableContextMenu: boolean;
  // API 配置
  apiKeys: {
    google?: string;
    baidu?: string;
    youdao?: string;
    deepl?: string;
  };
}

/**
 * 插件状态
 */
export interface PluginStatus {
  isActive: boolean;
  isLoggedIn: boolean;
  version: string;
  lastUpdate: number;
  memoryUsage: number;
}

/**
 * 上下文信息
 */
export interface ContextInfo {
  url: string;
  title: string;
  selectionText?: string;
  timestamp: number;
}

/**
 * 通用消息结构
 */
export interface PluginMessage<T = unknown> {
  type: MessageType;
  id?: string;
  data?: T;
  error?: string;
}

/**
 * 存储键值类型
 */
export enum StorageKey {
  CONFIG = 'plugin-config',
  STATUS = 'plugin-status',
  CONTEXT = 'plugin-context',
  HISTORY = 'plugin-history',
}

/**
 * 翻译历史记录
 */
export interface TranslationHistoryItem {
  id: string;
  text: string;
  translation: string;
  from: string;
  to: string;
  service: TranslationService;
  timestamp: number;
  url?: string;
  title?: string;
}

/**
 * 页面分析历史记录
 */
export interface AnalysisHistoryItem {
  id: string;
  url: string;
  title: string;
  summary?: string;
  keywords?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  timestamp: number;
}
