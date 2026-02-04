// LangGraph Agent using actual LangChain packages
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MermaidDiagramTool } from "./mermaid-tool";
import { WebSearchTool } from "./web-search-tool";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph/web";
import { Client } from "langsmith";
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";
import { PageData } from "../types";

export class LangGraphAgent {
  private apiKey: string;
  private baseUrl: string;
  private langsmithApiKey: string | null;
  private langsmithProject: string;
  private conversationHistory: Array<{ role: string; content: string; timestamp: string }> = [];
  private pageContext: PageData | null = null;
  private threadId: string | null = null;
  private mermaidDiagramAgent: any = null;
  private summerizeAgent: any = null;
  private supervisor: any = null;
  private initialized: boolean = false;
  private tracer: LangChainTracer | null = null;

  constructor(
    apiKey: string,
    baseUrl: string = 'https://api.openai.com/v1',
    langsmithApiKey: string | null = null,
    langsmithProject: string = 'browser-assistant'
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.langsmithApiKey = langsmithApiKey;
    this.langsmithProject = langsmithProject;
    this.setLangSmithEnvironment();
  }

  private setLangSmithEnvironment() {
    if (this.langsmithApiKey) {
      // Set environment variables for LangSmith tracing
      if (typeof window !== 'undefined') {
        (window as any).LANGSMITH_TRACING = true;
        (window as any).LANGSMITH_API_KEY = this.langsmithApiKey;
        (window as any).LANGSMITH_PROJECT = this.langsmithProject;
        (window as any).LANGSMITH_ENDPOINT = "https://api.smith.langchain.com";
      }
      console.log('LangGraphAgent: LangSmith environment variables set');
    }
  }

  async initialize(pageData: PageData, threadId: string | null = null): Promise<string> {
    try {
      console.log('LangGraphAgent: Initialize method called');
      this.pageContext = {
        url: pageData.url,
        title: pageData.title,
        content: pageData.content,
        timestamp: pageData.timestamp || new Date().toISOString()
      };

      this.threadId = threadId || this.generateThreadId();
      console.log('LangGraphAgent: Thread ID generated:', this.threadId);

      this.conversationHistory = [];

      console.log('LangGraphAgent: About to call setupAgent()');
      await this.setupAgent();
      console.log('LangGraphAgent: setupAgent() completed successfully');

      console.log('LangGraphAgent: Initialized with thread ID:', this.threadId);
      return this.threadId;
    } catch (error: any) {
      console.error('LangGraphAgent: Error initializing:', error);
      console.error('LangGraphAgent: Error stack:', error.stack);
      throw error;
    }
  }

  private async setupAgent() {
    try {
      if (!this.apiKey) {
        throw new Error('API key is required but not provided');
      }

      const llmConfig: any = {
        apiKey: this.apiKey,
        model: 'gpt-4o-mini',
        temperature: 0.7,
      };

      if (this.langsmithApiKey && this.tracer) {
        llmConfig.callbacks = [this.tracer];
      }

      console.log('LangGraphAgent: Creating LLM with config:', {
        apiKey: this.apiKey ? '***' + this.apiKey.slice(-4) : 'missing',
        model: llmConfig.model
      });

      let llm: ChatOpenAI;
      try {
        llm = new ChatOpenAI(llmConfig);
        console.log('LangGraphAgent: LLM created successfully');
      } catch (llmCreateError: any) {
        console.error('LangGraphAgent: Failed to create LLM:', llmCreateError);
        throw new Error(`Failed to create LLM: ${llmCreateError.message}`);
      }

      console.log('LangGraphAgent: Testing LLM connection...');
      try {
        await llm.invoke([new HumanMessage("Test message")]);
        console.log('LangGraphAgent: LLM connection successful');
      } catch (llmError: any) {
        console.error('LangGraphAgent: LLM connection failed:', llmError);
        throw new Error(`LLM connection failed: ${llmError.message}`);
      }

      if (this.langsmithApiKey) {
        try {
          console.log('LangGraphAgent: Initializing LangSmith tracer...');
          this.tracer = new LangChainTracer({
            projectName: this.langsmithProject,
            client: new Client({
              apiUrl: "https://api.smith.langchain.com",
              apiKey: this.langsmithApiKey,
            }),
          });
          console.log('LangGraphAgent: LangSmith tracer initialized successfully');
        } catch (error) {
          console.warn('LangGraphAgent: Failed to initialize LangSmith tracer:', error);
          this.tracer = null;
        }
      } else {
        this.tracer = null;
        console.log('LangGraphAgent: LangSmith tracing disabled (no API key)');
      }

      const webSearchTool = new WebSearchTool();
      this.summerizeAgent = createReactAgent({
        llm: llm,
        tools: [webSearchTool],
        prompt: "you are a summerize agent and have access to the content of the page and a web search tool. \
        You summerize the content of the page to highlight the most important architecture and design patterns. \
        You can also use the web search tool to find additional information, current events, or facts that are not available in the page content.",
      });
      console.log('LangGraphAgent: Summerize agent created successfully');

      try {
        const mermaidTool = new MermaidDiagramTool();
        this.mermaidDiagramAgent = createReactAgent({
          llm: llm,
          tools: [mermaidTool],
          prompt: "you are a mermaid diagram agent and have access to mermaid diagram tool. \
          You take mermaid code and render it into a diagram in HTML and only return valid HTML.",
        });
        console.log('LangGraphAgent: Agent executor created successfully');
      } catch (agentError: any) {
        console.error('LangGraphAgent: Failed to create agent executor:', agentError);
        console.log('LangGraphAgent: Will use LLM directly instead of agent executor');
        this.mermaidDiagramAgent = null;
      }

      this.supervisor = new StateGraph(MessagesAnnotation)
        .addNode("mermaid_diagram_agent", this.mermaidDiagramAgent)
        .addNode("summerize_agent", this.summerizeAgent)
        .addEdge("__start__", "summerize_agent")
        .addEdge("summerize_agent", "mermaid_diagram_agent")
        .addEdge("mermaid_diagram_agent", "__end__");

      this.supervisor = this.supervisor.compile();
      console.log('LangGraphAgent: Supervisor created successfully');

      this.initialized = true;
      console.log('LangGraphAgent: Agent setup complete');
    } catch (error: any) {
      console.error('LangGraphAgent: Error setting up agent:', error);
      throw error;
    }
  }

  private generateThreadId(): string {
    return 'thread_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async processMessage(userMessage: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    try {
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });

      const contextualMessage = this.createContextualMessage(userMessage);

      console.log('LangGraphAgent: Invoking agent with message:', contextualMessage);

      let result: any;
      if (this.supervisor) {
        try {
          const invokeOptions = {
            messages: [new HumanMessage(contextualMessage)]
          };

          console.log('LangGraphAgent: Invoking agent with options:', invokeOptions);
          result = await this.supervisor.invoke(invokeOptions,
            { callbacks: this.tracer ? [this.tracer] : [] }
          );
        } catch (invokeError: any) {
          console.warn('LangGraphAgent: Standard invoke failed, trying alternative method:', invokeError);
          throw invokeError;
        }
      } else {
        console.error('LangGraphAgent: Using LLM directly (agent is null)');
        throw new Error('Supervisor not initialized');
      }

      let response: string;
      if (result && result.messages && result.messages.length > 0) {
        response = result.messages[result.messages.length - 1].content;
      } else if (result && result.output) {
        response = result.output;
      } else if (result && typeof result === 'string') {
        response = result;
      } else {
        console.error('LangGraphAgent: No response from agent');
        throw new Error('No response from agent');
      }

      console.log('LangGraphAgent: Received response:', response);

      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error: any) {
      console.error('LangGraphAgent: Error processing message:', error);
      throw error;
    }
  }

  private createContextualMessage(userMessage: string): string {
    if (!this.pageContext) {
      return userMessage;
    }

    return `You are a helpful browser assistant. The user is currently on this webpage:

URL: ${this.pageContext.url}
Title: ${this.pageContext.title}
Content: ${this.pageContext.content}

User's question: ${userMessage}

Please provide a helpful response based on the webpage content and the user's question. If the question is not related to the current page, you can still help but mention that you're not sure about the current page context.

Previous conversation:
${this.conversationHistory.map(h => `${h.role}: ${h.content}`).join('\n')}`;
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  getThreadId(): string | null {
    return this.threadId;
  }

  clearHistory(): void {
    this.conversationHistory = [];
    console.log('LangGraphAgent: Conversation history cleared');
  }

  exportConversation() {
    return {
      threadId: this.threadId,
      pageContext: this.pageContext,
      conversationHistory: this.conversationHistory,
      exportDate: new Date().toISOString()
    };
  }

  getStatus() {
    return {
      isInitialized: this.initialized,
      threadId: this.threadId,
      messageCount: this.conversationHistory.length,
      lastActivity: this.conversationHistory.length > 0 ?
        this.conversationHistory[this.conversationHistory.length - 1].timestamp : null
    };
  }
}
