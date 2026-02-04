import { LangGraphAgent } from '../utils/langgraph-agent';
import { AppConfig, PageData } from '../types';

export class LangGraphAgentService {
  private agents: Map<string, LangGraphAgent> = new Map();
  private config: AppConfig | null = null;

  async initialize(config: AppConfig): Promise<void> {
    this.config = config;
    // Clear existing agents when config changes
    this.agents.clear();
  }

  async getOrCreateAgent(threadId: string, pageData: PageData): Promise<LangGraphAgent> {
    if (!this.config) {
      throw new Error('Agent service not initialized. Please configure API key first.');
    }

    let agent = this.agents.get(threadId);
    if (!agent) {
      agent = new LangGraphAgent(
        this.config.apiKey,
        this.config.baseUrl,
        this.config.langsmithApiKey || undefined,
        this.config.langsmithProject || 'browser-assistant'
      );
      await agent.initialize(pageData, threadId);
      this.agents.set(threadId, agent);
    }
    return agent;
  }

  async processMessage(
    message: string,
    pageData: PageData,
    threadId: string
  ): Promise<string> {
    const agent = await this.getOrCreateAgent(threadId, pageData);
    return await agent.processMessage(message);
  }

  async analyzePage(pageData: PageData): Promise<string> {
    if (!this.config) {
      return 'Please configure your API key in the settings.';
    }

    const prompt = `Analyze the following webpage and provide a concise summary:

URL: ${pageData.url}
Title: ${pageData.title}
Content: ${pageData.content}

Please provide:
1. A brief summary of what this page is about
2. Key topics or themes
3. Any notable information or insights
4. Suggestions for what the user might want to know more about

Keep the response concise and helpful.`;

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful browser assistant that analyzes web pages and answers questions about their content. Be concise, helpful, and accurate.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error('Error analyzing page:', error);
      return 'Sorry, I encountered an error while analyzing this page. Please check your API key and try again.';
    }
  }

  clearAgent(threadId: string): void {
    this.agents.delete(threadId);
  }

  clearAllAgents(): void {
    this.agents.clear();
  }
}

export const langGraphAgentService = new LangGraphAgentService();
