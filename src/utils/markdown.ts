export function renderMarkdown(text: string): string {
  if (!text) return '';

  // Check if this is HTML content wrapped in markdown code blocks
  const htmlCodeBlockMatch = text.match(/```html\s*([\s\S]*?)\s*```/);
  if (htmlCodeBlockMatch) {
    console.log('Content script: Detected HTML code block, rendering as HTML');
    return htmlCodeBlockMatch[1].trim();
  }

  // Check for other code block formats that might contain HTML
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    const codeContent = codeBlockMatch[1].trim();
    if (codeContent.includes('<div') || codeContent.includes('<script') ||
      codeContent.includes('<html') || codeContent.includes('<!DOCTYPE') ||
      codeContent.includes('<svg') || codeContent.includes('class=')) {
      console.log('Content script: Detected HTML in code block, rendering as HTML');
      return codeContent;
    }
  }

  // Check if this is HTML content (like from Mermaid tool)
  if (text.includes('<div class="mermaid-diagram">') || text.includes('<script>') || text.includes('<html>') || text.includes('<!DOCTYPE')) {
    console.log('Content script: Detected HTML content, rendering as HTML');
    return text;
  }

  // Escape HTML first for regular markdown content
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Convert markdown to HTML
  html = html
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

  // Wrap consecutive list items in ul/ol
  html = html.replace(/(<li>.*<\/li>)/g, (match) => {
    if (match.includes('<ul>') || match.includes('<ol>')) return match;
    return '<ul>' + match + '</ul>';
  });

  return html;
}

export function containsMermaidDiagram(content: string): boolean {
  return content.includes('mermaid') ||
    content.includes('graph') ||
    content.includes('flowchart') ||
    content.includes('sequenceDiagram') ||
    content.includes('classDiagram') ||
    content.includes('stateDiagram') ||
    content.includes('erDiagram') ||
    content.includes('journey') ||
    content.includes('gantt') ||
    content.includes('pie') ||
    content.includes('gitgraph');
}
