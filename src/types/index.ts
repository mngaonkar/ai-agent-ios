export interface AppConfig {
  apiKey: string;
  baseUrl: string;
  langsmithApiKey?: string;
  langsmithProject?: string;
}

export interface PageData {
  url: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ConversationThread {
  threadId: string;
  messages: Message[];
  pageContext?: PageData;
}
