export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatHistory {
  [tabId: string]: {
    url: string;
    title: string;
    history: Message[];
  };
}

export interface TabContext {
  url: string;
  title: string;
  history: Message[];
}
