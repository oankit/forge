import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Text,
  Rows,
  Alert,
  Columns,
  Column,
} from '@canva/app-ui-kit';
import { Copy, Check, Upload, SquareCode } from 'lucide-react';
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

// Simple syntax highlighting function for React/TypeScript
const highlightCode = (code: string, language: string): string => {
  // This is a simplified version - in production, you might want to use a proper parser
  let highlighted = code;
  
  if (language === 'typescript' || language === 'javascript' || language === 'tsx' || language === 'jsx') {
    // Keywords
    const keywords = [
      'import', 'from', 'export', 'const', 'let', 'var', 'function', 'return', 'if', 'else',
      'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'class', 'extends',
      'new', 'this', 'super', 'static', 'async', 'await', 'try', 'catch', 'finally',
      'throw', 'typeof', 'instanceof', 'void', 'delete', 'interface', 'type', 'enum',
      'implements', 'public', 'private', 'protected', 'readonly', 'as', 'React', 'useState',
      'useEffect', 'default'
    ];
    
    // Escape HTML
    highlighted = highlighted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Highlight strings (both single and double quotes) - Quiet Light theme
    highlighted = highlighted.replace(
      /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g,
      '<span style="color: #448C27;">$1</span>'
    );
    
    // Highlight comments - Quiet Light theme
    highlighted = highlighted.replace(
      /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
      '<span style="color: #AAAAAA; font-style: italic;">$1</span>'
    );
    
    // Highlight numbers - Quiet Light theme
    highlighted = highlighted.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      '<span style="color: #9C5D27;">$1</span>'
    );
    
    // Highlight keywords - Quiet Light theme
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlighted = highlighted.replace(
        regex,
        '<span style="color: #4B69C6; font-weight: 600;">$1</span>'
      );
    });
    
    // Highlight JSX tags - Quiet Light theme
    highlighted = highlighted.replace(
      /(&lt;\/?)[\w-]+([^&]*?)(&gt;)/g,
      (match, open, tag, attrs, close) => {
        let highlightedAttrs = attrs;
        // Highlight attribute names - Quiet Light theme
        highlightedAttrs = highlightedAttrs.replace(
          /(\w+)=/g,
          '<span style="color: #7A3E9D;">$1</span>='
        );
        return `<span style="color: #4B69C6;">${open}${tag}</span>${highlightedAttrs}<span style="color: #4B69C6;">${close}</span>`;
      }
    );
    
    // Highlight function names - Quiet Light theme
    highlighted = highlighted.replace(
      /\b(\w+)\s*(?=\()/g,
      '<span style="color: #AA3731; font-weight: bold;">$1</span>'
    );
  }
  
  return highlighted;
};

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
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'absolute';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {
        // Fallback copy failed
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDeployAndPreview = async () => {
    try {
      setDeployState({ status: 'deploying', deploymentUrl: '', error: '' });
      
      const token = await auth.getCanvaUserToken();
      const componentName = 'GeneratedComponent';
      const projectName = `canva-component-${Date.now().toString(36)}`;
      
      const requestBody = {
        code,
        componentName,
        projectName,
        framework: 'next' as const,
      };
      
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
      
      setDeployState({
        status: 'deployed',
        deploymentUrl: data.deploymentUrl,
        error: '',
      });
      
      if (data.deploymentUrl) {
        await requestOpenExternalUrl({ url: `https://${data.deploymentUrl}` });
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Deployment failed';
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

  const highlightedCode = highlightCode(code, language);
  const lineCount = code.split('\n').length;

  if (!code) {
    return null;
  }

  return (
    <Box padding="2u">
      <Rows spacing="2u">


        {/* Deployment Status Alerts */}
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

        {/* Code Display Box */}
        <Box 
          border="standard" 
          borderRadius="standard" 
          padding="0"
        >
          {/* Code Header with Copy Button */}
          <Box 
            padding="0.5u"
          >
            <Columns alignY="center" spacing="1u">
              <Column>
                <Columns alignY="center" spacing="0.5u">
                  <Column width="content">
                    <div style={{ display: 'flex', alignItems: 'center', height: '16px' }}>
                      <SquareCode size={14} />
                    </div>
                  </Column>
                  <Column>
                    <div style={{ display: 'flex', alignItems: 'center', height: '16px' }}>
                      <Text size="xsmall" tone="secondary">
                        {intl.formatMessage({
                          defaultMessage: "{lineCount} lines",
                          description: "Code line count display"
                        }, { lineCount })}
                      </Text>
                    </div>
                  </Column>
                </Columns>
              </Column>
              <Column width="content">
                <Button
                  variant="tertiary"
                  onClick={handleCopyCode}
                  icon={() => copySuccess ? <Check size={16} /> : <Copy size={16} />}
                >
                  {copySuccess ? intl.formatMessage({
                    defaultMessage: "Copied!",
                    description: "Button text when code is successfully copied"
                  }) : intl.formatMessage({
                    defaultMessage: "Copy",
                    description: "Button to copy the generated code"
                  })}
                </Button>
              </Column>
            </Columns>
          </Box>

          {/* Code Content */}
          <Box padding="0">
            <div
              style={{
                backgroundColor: '#F9FAFB', // Updated background color
                fontFamily: '"Roboto Mono", Consolas, Monaco, "Courier New", monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                overflowX: 'auto',
                maxHeight: '350px',
                overflowY: 'auto',
                padding: '12px'
              }}
            >
              <pre style={{ margin: 0, padding: 0, color: '#333333', fontWeight: '540' }}>
                <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
              </pre>
            </div>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Columns spacing="1u" alignY="center">
          <Column width="content">
            <Button
              variant="primary"
              onClick={handleDeployAndPreview}
              disabled={!code || deployState.status === 'deploying'}
              icon={() => <Upload size={16} />}
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
        </Columns>

        {/* Usage Instructions */}
        <Alert tone="info" title={intl.formatMessage({
          defaultMessage: "Usage Instructions",
          description: "Title for usage instructions alert"
        })}>
          <Text size="small">
            {intl.formatMessage({
              defaultMessage: "You can copy this code and paste it into your React project, or deploy it directly to Vercel for instant preview. Make sure you have Tailwind CSS configured in your project for the styling to work properly.",
              description: "Instructions for using the generated code"
            })}
          </Text>
        </Alert>
      </Rows>
    </Box>
  );
};