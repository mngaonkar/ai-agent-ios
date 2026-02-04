// Web search tool for LangGraph agent
import { Tool } from "@langchain/core/tools";

export class WebSearchTool extends Tool {
  name = "web_search";
  description = "Search the web for current information, news, facts, or any information not available in the current page context. Use this when users ask about current events, recent information, or topics that require up-to-date data from the internet. Input should be a search query string.";

  private notifyToolCalled(query: string) {
    try {
      if (typeof window === "undefined") return;
      window.dispatchEvent(
        new CustomEvent("agent_tool_called", {
          detail: {
            tool: this.name,
            inputPreview: query.slice(0, 200),
            timestamp: new Date().toISOString(),
          },
        })
      );
    } catch {
      // best-effort only
    }
  }

  async _call(input: string): Promise<string> {
    try {
      const query = input.trim();

      if (!query) {
        return "Error: No search query provided. Please provide a search query string.";
      }

      this.notifyToolCalled(query);
      console.log('WebSearchTool: Searching for:', query);

      // Use DuckDuckGo Instant Answer API
      // Note: This is a simple implementation. For production, you might want to use
      // a more robust search API like Tavily, Serper, or a backend proxy
      try {
        // Use DuckDuckGo Instant Answer API (works in browser, no CORS issues)
        const instantAnswerUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        
        const response = await fetch(instantAnswerUrl);
        
        if (!response.ok) {
          throw new Error(`Search API returned ${response.status}`);
        }

        const data = await response.json();
        
        let result = `Search results for: "${query}"\n\n`;
        
        // Extract information from DuckDuckGo Instant Answer
        if (data.AbstractText) {
          result += `Summary: ${data.AbstractText}\n\n`;
        }
        
        if (data.Answer) {
          result += `Answer: ${data.Answer}\n\n`;
        }
        
        if (data.Definition) {
          result += `Definition: ${data.Definition}\n\n`;
        }
        
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
          result += `Related Topics:\n`;
          data.RelatedTopics.slice(0, 5).forEach((topic: any, index: number) => {
            if (topic.Text) {
              result += `${index + 1}. ${topic.Text}\n`;
            }
          });
          result += `\n`;
        }
        
        if (data.Results && data.Results.length > 0) {
          result += `Additional Results:\n`;
          data.Results.slice(0, 3).forEach((resultItem: any, index: number) => {
            result += `${index + 1}. ${resultItem.Text || resultItem.FirstURL}\n`;
            if (resultItem.FirstURL) {
              result += `   URL: ${resultItem.FirstURL}\n`;
            }
          });
        }
        
        // If no results from Instant Answer, provide a fallback message
        if (!data.AbstractText && !data.Answer && !data.Definition && (!data.RelatedTopics || data.RelatedTopics.length === 0)) {
          result += `No instant answer available. The search query "${query}" may require browsing search results. `;
          result += `Consider rephrasing the query or providing more specific search terms.`;
        }

        console.log('WebSearchTool: Search completed successfully');
        return result;
      } catch (fetchError: any) {
        console.error('WebSearchTool: Fetch error:', fetchError);
        
        // Fallback: Return a message suggesting the user try a different approach
        return `Unable to perform web search at this time. Error: ${fetchError.message}. ` +
               `Please try rephrasing your query or the agent can work with the current page context.`;
      }
    } catch (error: any) {
      console.error('WebSearchTool error:', error);
      return `Error performing web search: ${error.message}`;
    }
  }
}
