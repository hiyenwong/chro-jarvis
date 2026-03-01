export interface Config {
  aiProvider: 'deepseek' | 'zhipu' | 'volcano' | 'openai' | 'claude';
  apiKey: string;
  targetLanguage: string;
}
