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
  Column,
} from '@canva/app-ui-kit';

interface CodeDisplayProps {
  code: string;
  title?: string;
  language?: string;
  onClear?: () => void;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({
  code,
  title = 'Generated Code',
  language = 'typescript',
  onClear,
}) => {
  const intl = useIntl();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      
      // Reset copy success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {
        // Fallback copy failed - silently handle error
      }
      document.body.removeChild(textArea);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-component.${language === 'typescript' ? 'tsx' : 'jsx'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              defaultMessage: "Copy this code and paste it into your React project. Make sure you have Tailwind CSS configured in your project for the styling to work properly.",
              description: "Instructions for using the generated code"
            })}
          </Text>
        </Alert>
      </Rows>
    </Box>
  );
};