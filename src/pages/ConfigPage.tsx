import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonToast,
  IonBackButton,
  IonButtons,
  IonIcon,
} from '@ionic/react';
import { checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { storageService } from '../services/storage.service';
import { langGraphAgentService } from '../services/langgraph-agent.service';
import { AppConfig } from '../types';

const ConfigPage: React.FC = () => {
  const history = useHistory();
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [langsmithApiKey, setLangsmithApiKey] = useState('');
  const [langsmithProject, setLangsmithProject] = useState('browser-assistant');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const config = await storageService.getConfig();
    if (config) {
      setApiKey(config.apiKey || '');
      setBaseUrl(config.baseUrl || 'https://api.openai.com/v1');
      setLangsmithApiKey(config.langsmithApiKey || '');
      setLangsmithProject(config.langsmithProject || 'browser-assistant');
    }
  };

  const showMessage = (message: string, color: 'success' | 'danger' = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      showMessage('Please enter an API key', 'danger');
      return;
    }

    try {
      const config: AppConfig = {
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim() || 'https://api.openai.com/v1',
        langsmithApiKey: langsmithApiKey.trim() || undefined,
        langsmithProject: langsmithProject.trim() || 'browser-assistant',
      };

      await storageService.saveConfig(config);
      await langGraphAgentService.initialize(config);
      showMessage('Configuration saved successfully!');
    } catch (error: any) {
      console.error('Error saving config:', error);
      showMessage(`Error saving configuration: ${error.message}`, 'danger');
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      showMessage('Please enter an API key first', 'danger');
      return;
    }

    setIsTesting(true);
    try {
      const testUrl = baseUrl.trim() || 'https://api.openai.com/v1';
      const response = await fetch(`${testUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });

      if (response.ok) {
        showMessage('Configuration test successful!');
      } else {
        showMessage(`Configuration test failed: ${response.status}`, 'danger');
      }
    } catch (error: any) {
      console.error('Error testing config:', error);
      showMessage('Configuration test failed: ' + error.message, 'danger');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Configuration</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>API Configuration</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">OpenAI API Key *</IonLabel>
              <IonInput
                type="password"
                value={apiKey}
                placeholder="Enter your OpenAI API key"
                onIonInput={(e) => setApiKey(e.detail.value!)}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">API Base URL</IonLabel>
              <IonInput
                type="text"
                value={baseUrl}
                placeholder="https://api.openai.com/v1"
                onIonInput={(e) => setBaseUrl(e.detail.value!)}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">LangSmith API Key (optional)</IonLabel>
              <IonInput
                type="password"
                value={langsmithApiKey}
                placeholder="Enter your LangSmith API key"
                onIonInput={(e) => setLangsmithApiKey(e.detail.value!)}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">LangSmith Project (optional)</IonLabel>
              <IonInput
                type="text"
                value={langsmithProject}
                placeholder="browser-assistant"
                onIonInput={(e) => setLangsmithProject(e.detail.value!)}
              />
            </IonItem>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <IonButton expand="block" onClick={handleSave}>
                <IonIcon icon={checkmarkCircleOutline} slot="start" />
                Save
              </IonButton>
              <IonButton expand="block" fill="outline" onClick={handleTest} disabled={isTesting}>
                <IonIcon icon={checkmarkCircleOutline} slot="start" />
                {isTesting ? 'Testing...' : 'Test'}
              </IonButton>
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
              <p>
                Get your API key from{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                  OpenAI Platform
                </a>
              </p>
              <p>
                Get your LangSmith API key from{' '}
                <a href="https://smith.langchain.com/" target="_blank" rel="noopener noreferrer">
                  LangSmith
                </a>
              </p>
            </div>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default ConfigPage;
