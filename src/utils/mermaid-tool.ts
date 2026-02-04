// Mermaid diagram tool for LangGraph agent
import { Tool } from "@langchain/core/tools";

export class MermaidDiagramTool extends Tool {
  name = "mermaid_diagram";
  description = "Create a Mermaid diagram from code. Use this when users ask for diagrams, flowcharts, sequence diagrams, class diagrams, or any visual representation. Input should be Mermaid diagram code.";
  private mermaidLoaded = false;

  async _call(input: string): Promise<string> {
    try {
      const mermaidCode = input.trim();

      if (!mermaidCode) {
        return "Error: No Mermaid code provided. Please provide valid Mermaid diagram code.";
      }

      const validMermaidTypes = [
        'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
        'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 'gitgraph'
      ];

      const hasValidType = validMermaidTypes.some(type =>
        mermaidCode.toLowerCase().includes(type.toLowerCase())
      );

      if (!hasValidType) {
        return `Error: Invalid Mermaid syntax. Please start with one of these diagram types: ${validMermaidTypes.join(', ')}`;
      }

      const diagramId = `mermaid-${Date.now()}`;

      const mermaidHtml = `
        <div class="mermaid-diagram" id="${diagramId}" data-diagram-id="${diagramId}" data-mermaid-code="${mermaidCode.replace(/"/g, '&quot;')}">
          <div class="mermaid-code">
            <pre><code>${mermaidCode}</code></pre>
          </div>
          <div class="mermaid-container">
            <div class="mermaid" id="${diagramId}-render">${mermaidCode}</div>
          </div>
        </div>
        <script>
          (function() {
            function renderMermaidDiagram(diagramId, mermaidCode) {
              if (typeof mermaid === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
                script.onload = function() {
                  mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    themeVariables: {
                      primaryColor: '#007bff',
                      primaryTextColor: '#333',
                      primaryBorderColor: '#007bff',
                      lineColor: '#333',
                      secondaryColor: '#f8f9fa',
                      tertiaryColor: '#fff'
                    }
                  });
                  mermaid.render(diagramId + '-svg', mermaidCode).then(({svg}) => {
                    const container = document.getElementById(diagramId + '-render');
                    if (container) {
                      container.innerHTML = svg;
                    }
                  }).catch(err => {
                    console.error('Mermaid rendering error:', err);
                    const container = document.getElementById(diagramId + '-render');
                    if (container) {
                      container.innerHTML = '<div class="mermaid-error">Error rendering diagram: ' + err.message + '</div>';
                    }
                  });
                };
                document.head.appendChild(script);
              } else {
                mermaid.render(diagramId + '-svg', mermaidCode).then(({svg}) => {
                  const container = document.getElementById(diagramId + '-render');
                  if (container) {
                    container.innerHTML = svg;
                  }
                }).catch(err => {
                  console.error('Mermaid rendering error:', err);
                  const container = document.getElementById(diagramId + '-render');
                  if (container) {
                    container.innerHTML = '<div class="mermaid-error">Error rendering diagram: ' + err.message + '</div>';
                  }
                });
              }
            }
            renderMermaidDiagram('${diagramId}', \`${mermaidCode}\`);
          })();
        </script>
      `;

      console.log('MermaidDiagramTool: Mermaid HTML created successfully');
      return mermaidHtml;
    } catch (error: any) {
      console.error('MermaidDiagramTool error:', error);
      return `Error creating Mermaid diagram: ${error.message}`;
    }
  }
}
