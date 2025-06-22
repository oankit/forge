import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Text,
  Title,
  Rows,
  Alert,
  Scrollable,
  Columns,
  Column
} from '@canva/app-ui-kit';
import { auth } from '@canva/user';
import { requestOpenExternalUrl } from '@canva/platform';

interface CodeDisplayProps {
  code: string;
  title?: string;
  language?: string;
  onClear?: () => void;
}

type DeployStatus = 'idle' | 'deploying' | 'deployed' | 'error';

interface DeployState {
  status: DeployStatus;
  deploymentUrl: string;
  error: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({
  code,
  title = 'Generated Code',
  language = 'typescript',
  onClear,
}) => {
  const intl = useIntl();
  const [copySuccess, setCopySuccess] = useState(false);
  const [deployState, setDeployState] = useState<DeployState>({
    status: 'idle',
    deploymentUrl: '',
    error: '',
  });

  const handleCopyCode = async () => {
    console.log('[CODE_DISPLAY] Attempting to copy code to clipboard, length:', code.length);
    try {
      await navigator.clipboard.writeText(code);
      console.log('[CODE_DISPLAY] Code copied to clipboard successfully');
      setCopySuccess(true);
      
      // Reset copy success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch {
      console.log('[CODE_DISPLAY] Clipboard API failed, using fallback method');
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        console.log('[CODE_DISPLAY] Code copied using fallback method');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {
        console.error('[CODE_DISPLAY] Fallback copy method also failed');
        // Fallback copy failed - silently handle error
      }
      document.body.removeChild(textArea);
    }
  };

  const downloadCode = () => {
    const filename = `generated-component.${language === 'typescript' ? 'tsx' : 'jsx'}`;
    console.log('[CODE_DISPLAY] Starting code download as:', filename, 'size:', code.length, 'characters');
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('[CODE_DISPLAY] Code download initiated successfully');
  };

  const handleDeployAndPreview = async () => {
    try {
      console.log('[CODE_DISPLAY] Starting deployment process');
      setDeployState({ status: 'deploying', deploymentUrl: '', error: '' });
      
      // Get Canva user token for authentication
      const token = await auth.getCanvaUserToken();
      
      // Generate component and project names
      const componentName = 'GeneratedComponent';
      const projectName = `canva-component-${Date.now().toString(36)}`;
      
      const requestBody = {
        code,
        componentName,
        projectName,
        framework: 'next' as const,
      };
      
      console.log('[CODE_DISPLAY] Making deployment request to /api/deploy');
      const response = await fetch('http://localhost:3001/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Deployment failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[CODE_DISPLAY] Deployment successful:', data.deploymentUrl);
      
      setDeployState({
        status: 'deployed',
        deploymentUrl: data.deploymentUrl,
        error: '',
      });
      
      // Open the deployment URL in a new tab for preview
      if (data.deploymentUrl) {
        await requestOpenExternalUrl({ url: `https://${data.deploymentUrl}` });
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Deployment failed';
      console.error('[CODE_DISPLAY] Deployment failed:', errorMessage);
      setDeployState({
        status: 'error',
        deploymentUrl: '',
        error: errorMessage,
      });
    }
  };

  const resetDeploy = () => {
    setDeployState({
      status: 'idle',
      deploymentUrl: '',
      error: '',
    });
  };

  if (!code) {
    return null;
  }

  return (
    <Box padding="2u">
      <Rows spacing="2u">
        {/* Header */}
        <Columns alignY="center" spacing="2u">
          <Column>
            <Title size="medium">{title}</Title>
          </Column>
          <Column width="content">
            <Columns spacing="1u">
              <Column width="content">
                <Button
                  variant="secondary"
                  onClick={handleCopyCode}
                  disabled={!code}
                >
                  {copySuccess ? intl.formatMessage({
                    defaultMessage: "Copied!",
                    description: "Button text when code is successfully copied"
                  }) : intl.formatMessage({
                    defaultMessage: "Copy Code",
                    description: "Button to copy the generated code"
                  })}
                </Button>
              </Column>
              <Column width="content">
                <Button
                  variant="secondary"
                  onClick={downloadCode}
                  disabled={!code}
                >
                  {intl.formatMessage({
                    defaultMessage: "Download",
                    description: "Button to download the generated code"
                  })}
                </Button>
              </Column>
              <Column width="content">
                <Button
                  variant="primary"
                  onClick={handleDeployAndPreview}
                  disabled={!code || deployState.status === 'deploying'}
                >
                  {deployState.status === 'deploying' 
                    ? intl.formatMessage({
                        defaultMessage: "Deploying...",
                        description: "Button text while deploying"
                      })
                    : intl.formatMessage({
                        defaultMessage: "Deploy & Preview",
                        description: "Button to deploy and preview the generated code"
                      })}
                </Button>
              </Column>
              {onClear && (
                <Column width="content">
                  <Button
                    variant="tertiary"
                    onClick={onClear}
                  >
                    {intl.formatMessage({
                      defaultMessage: "Clear",
                      description: "Button to clear the generated code"
                    })}
                  </Button>
                </Column>
              )}
              {deployState.status === 'deployed' && (
                <Column width="content">
                  <Button
                    variant="secondary"
                    onClick={resetDeploy}
                  >
                    {intl.formatMessage({
                      defaultMessage: "Reset Deploy",
                      description: "Button to reset deployment state"
                    })}
                  </Button>
                </Column>
              )}
            </Columns>
          </Column>
        </Columns>

        {/* Copy Success Alert */}
        {copySuccess && (
          <Alert tone="positive" title={intl.formatMessage({
            defaultMessage: "Copied!",
            description: "Alert title when code is copied"
          })}>
            {intl.formatMessage({
              defaultMessage: "Code has been copied to your clipboard.",
              description: "Success message when code is copied"
            })}
          </Alert>
        )}

        {/* Deployment Success Alert */}
        {deployState.status === 'deployed' && (
          <Alert tone="positive" title={intl.formatMessage({
            defaultMessage: "Deployment Successful!",
            description: "Alert title when deployment is successful"
          })}>
            <Rows spacing="1u">
              <Text>
                {intl.formatMessage({
                  defaultMessage: "Your code has been deployed successfully and opened in a new tab for preview.",
                  description: "Success message when deployment is completed"
                })}
              </Text>
              {deployState.deploymentUrl && (
                <Text size="small" tone="secondary">
                  {intl.formatMessage({
                    defaultMessage: "Deployment URL: {url}",
                    description: "Label showing the deployment URL"
                  }, { url: `https://${deployState.deploymentUrl}` })}
                </Text>
              )}
            </Rows>
          </Alert>
        )}

        {/* Deployment Error Alert */}
        {deployState.status === 'error' && (
          <Alert tone="critical" title={intl.formatMessage({
            defaultMessage: "Deployment Failed",
            description: "Alert title when deployment fails"
          })}>
            <Rows spacing="1u">
              <Text>
                {intl.formatMessage({
                  defaultMessage: "Failed to deploy your code. Please try again.",
                  description: "Error message when deployment fails"
                })}
              </Text>
              {deployState.error && (
                <Text size="small" tone="secondary">
                  {intl.formatMessage({
                    defaultMessage: "Error: {error}",
                    description: "Label showing the deployment error"
                  }, { error: deployState.error })}
                </Text>
              )}
            </Rows>
          </Alert>
        )}

        {/* Code Display */}
        <Box 
          border="standard" 
          borderRadius="standard" 
          background="neutralLow"
          padding="2u"
        >
          <div style={{ maxHeight: "400px", overflow: "auto" }}>
            <Scrollable>
            <Box>
              <Text size="small" tone="secondary">
                {intl.formatMessage({
                  defaultMessage: "Language: {language}",
                  description: "Label showing the programming language"
                }, { language: language.toUpperCase() })}
              </Text>
              <Box 
                padding="1u" 
                background="neutral"
                borderRadius="standard"
              >
                <div
                  style={{
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  <pre style={{ margin: 0, padding: 0 }}>
                    <code>{code}</code>
                  </pre>
                </div>
              </Box>
            </Box>
            </Scrollable>
          </div>
        </Box>

        {/* Code Statistics */}
        <Columns spacing="2u">
          <Column>
            <Text size="small" tone="secondary">
              {intl.formatMessage({
                defaultMessage: "Lines: {lineCount}",
                description: "Number of lines in the code"
              }, { lineCount: code.split('\n').length })}
            </Text>
          </Column>
          <Column width="content">
            <Text size="small" tone="secondary">
              {intl.formatMessage({
                defaultMessage: "Characters: {charCount}",
                description: "Number of characters in the code"
              }, { charCount: code.length })}
            </Text>
          </Column>
        </Columns>

        {/* Usage Instructions */}
        <Alert tone="info" title={intl.formatMessage({
          defaultMessage: "Usage Instructions",
          description: "Title for usage instructions alert"
        })}>
          <Text size="small">
            {intl.formatMessage({
              defaultMessage: "You can copy this code and paste it into your React project, download it as a file, or deploy it directly to Vercel for instant preview. Make sure you have Tailwind CSS configured in your project for the styling to work properly.",
              description: "Instructions for using the generated code"
            })}
          </Text>
        </Alert>
      </Rows>
    </Box>
  );
};