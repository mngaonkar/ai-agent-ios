import React, { useEffect, useState, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonBackButton,
  IonButtons,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { sendOutline, settingsOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { storageService } from '../services/storage.service';
import { langGraphAgentService } from '../services/langgraph-agent.service';
import { renderMarkdown, containsMermaidDiagram } from '../utils/markdown';
import { Message, PageData } from '../types';
import './ChatPage.css';

const ChatPage: React.FC = () => {
  const history = useHistory();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    const config = await storageService.getConfig();
    if (!config?.apiKey) {
      history.push('/config');
      return;
    }

    await langGraphAgentService.initialize(config);

    // Create a mock page data for the chat
    // In a real app, you might want to allow users to input URL or use a webview
    const mockPageData: PageData = {
      url: window.location.href,
      title: document.title || 'AI Browser Assistant',
      content: 'This is a chat interface for the AI Browser Assistant. You can ask questions and get AI-powered responses.',
      timestamp: new Date().toISOString(),
    };

    setPageData(mockPageData);
    setThreadId('thread_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));

    // Auto-analyze the page
    setIsLoading(true);
    try {
      const analysis = await langGraphAgentService.analyzePage(mockPageData);
      setMessages([
        {
          role: 'assistant',
          content: analysis,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error: any) {
      console.error('Error analyzing page:', error);
      setMessages([
        {
          role: 'assistant',
          content: 'Welcome! I\'m ready to help you. What would you like to know?',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading || !threadId || !pageData) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await langGraphAgentService.processMessage(
        userMessage.content,
        pageData,
        threadId
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    const isMermaid = containsMermaidDiagram(message.content);
    const renderedContent = isUser ? message.content : renderMarkdown(message.content);

    return (
      <div
        key={message.timestamp}
        style={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            maxWidth: '80%',
            padding: '12px 16px',
            borderRadius: '18px',
            backgroundColor: isUser ? '#007bff' : '#f1f3f4',
            color: isUser ? '#fff' : '#333',
            wordWrap: 'break-word',
          }}
        >
          {isUser ? (
            <div>{message.content}</div>
          ) : (
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>AI Assistant</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/config')}>
              <IonIcon icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef} className="chat-content">
        <div style={{ padding: '16px', paddingBottom: '100px' }}>
          {messages.map(renderMessage)}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '18px',
                  backgroundColor: '#f1f3f4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <IonSpinner name="crescent" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '12px',
            backgroundColor: '#fff',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <IonInput
            value={inputMessage}
            placeholder="Ask me anything..."
            onIonInput={(e) => setInputMessage(e.detail.value!)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            style={{ flex: 1 }}
          />
          <IonButton onClick={handleSend} disabled={!inputMessage.trim() || isLoading}>
            <IonIcon icon={sendOutline} />
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ChatPage;
