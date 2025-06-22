import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Text,
  Rows,
  Columns,
  Column,
  Alert,
  LoadingIndicator,
  FormField,
  MultilineInput,
  Title
} from '@canva/app-ui-kit';
import { requestExport } from '@canva/design';
import { auth } from '@canva/user';
import { useAppContext } from 'src/context';
import { Code2, Rocket, Brain } from 'lucide-react';

interface ExportDesignProps {
  onCodeGenerated: (code: string) => void;
}

export const ExportDesign: React.FC<ExportDesignProps> = ({ onCodeGenerated }) => {
  const intl = useIntl();
  const { setAppError } = useAppContext();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [streamingCode, setStreamingCode] = useState<string>('');
  const [messageIndex, setMessageIndex] = useState(0);
  const statusMessages = [
    "🔄 Generating layout structure...",
    "🧠 Mapping props and logic...",
    "🎯 Finalizing interactions and responsiveness...",
    "🧩 Assembling your component..."
  ];
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const exportFormat = 'png'; // Always use PNG for best quality and transparency support

  // Stream code generation with real-time updates
  const streamCodeGeneration = async (imageDataURL: string, prompt?: string) => {
    setIsStreaming(true);
    setStreamingCode('');
    setError(null);

    try {
      // Debug logging
      console.log('[STREAM] Starting code generation with imageDataURL length:', imageDataURL.length);
      console.log('[STREAM] ImageDataURL starts with:', imageDataURL.substring(0, 50));
      console.log('[STREAM] Prompt:', prompt || instructions);

      const response = await fetch('http://localhost:3001/api/generate/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.getCanvaUserToken()}`,
        },
        body: JSON.stringify({
          imageDataURL,
          prompt: prompt || instructions,
        }),
      });

      if (!response.ok) {
        // Log the error response for debugging
        const errorText = await response.text();
        console.error('[STREAM] Error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let accumulatedCode = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedCode += chunk;
        setStreamingCode(accumulatedCode);
      }

      // Set final generated code
      setGeneratedCode(accumulatedCode);
      setStreamingCode('');
    } catch (error) {
      console.error('Streaming error:', error);
      setError(error instanceof Error ? error.message : 'Failed to stream code generation');
    } finally {
      setIsStreaming(false);
    }
  };

  // Rotate status messages every 3 seconds
  useEffect(() => {
    if (!isStreaming) return;
    
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % statusMessages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isStreaming, statusMessages.length]);

  const getCharacterCountMessage = () => {
    const count = streamingCode.length;
    if (count < 1000) {
      return `Streaming ${count.toLocaleString()} characters of code...`;
    } else if (count < 5000) {
      return `Still generating... ${count.toLocaleString()} characters so far`;
    } else {
      return `You've got ${count.toLocaleString()} characters of code so far – almost done!`;
    }
  };

  const exportDesignAsImage = async (): Promise<string> => {
    try {
      console.log('[EXPORT] Starting design export as image');
      
      const result = await requestExport({
        acceptedFileTypes: [exportFormat],
      });
      
      if (result.status === 'completed' && result.exportBlobs.length > 0) {
        console.log('[EXPORT] Design export completed successfully');
        
        // Convert blob URL to base64 data URL
        const blobUrl = result.exportBlobs[0].url;
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        console.error('[EXPORT] Export was cancelled or failed');
        throw new Error('Export was cancelled or failed');
      }
    } catch (error) {
      throw new Error(`Failed to export design: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };



  const handleExportAndGenerate = async () => {
    try {
      setIsExporting(true);
      setIsGenerating(false);
      setError(null);
      setGeneratedCode(null);
      setStreamingCode('');
      
      // Step 1: Export design as image
      const imageUrl = await exportDesignAsImage();

      setIsExporting(false);
      
      // Step 2: Stream code generation from image
      await streamCodeGeneration(imageUrl, instructions);
      
      // Notify parent component if code was generated
      if (generatedCode) {
        onCodeGenerated(generatedCode);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      setIsExporting(false);
      setIsGenerating(false);
      setIsStreaming(false);
      setAppError(errorMessage);
    }
  };

  const resetExport = () => {
    setIsExporting(false);
    setIsGenerating(false);
    setIsStreaming(false);

    setGeneratedCode(null);
    setStreamingCode('');
    setError(null);
  };

  const getStatusMessage = () => {
    if (isExporting) {
      return intl.formatMessage({
        defaultMessage: "Exporting design...",
        description: "Status message during design export"
      });
    }
    if (generatedCode) {
      return intl.formatMessage({
        defaultMessage: "Code generation completed!",
        description: "Status message when process is completed"
      });
    }
    if (error) {
      return intl.formatMessage({
        defaultMessage: "Export failed",
        description: "Status message when export fails"
      });
    }
    return '';
  };

  const isLoading = isExporting || isGenerating || isStreaming;
  const isCompleted = !!generatedCode && !isLoading;
  const hasError = !!error;

  return (
    <Box padding="2u">
      <Rows spacing="2u">
        {/* Hide description and form when loading */}
        {!isLoading && (
          <>
            <Columns spacing="1u" alignY="start">
              <Column width="content">
                <Box paddingTop="0.5u">
                  <Rocket size={16} />
                </Box>
              </Column>
              <Column>
                <Text>
                  {intl.formatMessage({
                    defaultMessage: "Generate React component code from your current design using AI.",
                    description: "Description for the code generation functionality"
                  })}
                </Text>
              </Column>
            </Columns>


            {/* Code Generation Prompt */}
            <FormField
              label={
                <Columns spacing="1u" alignY="start">
                  <Column width="content">
                    <Box paddingTop="0.5u">
                      <Brain size={16} />
                    </Box>
                  </Column>
                  <Column>
                    {intl.formatMessage({
                      defaultMessage: "Instructions (Optional)",
                      description: "Label for code generation prompt input"
                    })}
                  </Column>
                </Columns>
              }
              value={instructions}
              control={(props) => (
                <MultilineInput
                  {...props}
                  placeholder={intl.formatMessage({
                    defaultMessage: "e.g., Use Tailwind CSS and Flexbox layout",
                    description: "Placeholder for code generation prompt"
                  })}
                  onChange={setInstructions}
                  maxLength={500}
                  minRows={3}
                />
              )}
            />
          </>
        )}

        {/* Progress Indicator */}
        {isLoading && !isStreaming && (
          <Box>
            <Rows spacing="2u" align="center">
              <LoadingIndicator size="medium" />
              <Title size="small">{getStatusMessage()}</Title>
            </Rows>
          </Box>
        )}

        {/* Generation Progress Display */}
        {isStreaming && (
          <Box>
            <Rows spacing="2u" align="center">
              <LoadingIndicator size="medium" />
              <Title 
                size="small" 
              >
                {statusMessages[messageIndex]}
              </Title>
              <Text 
                size="small" 
                tone="secondary"
              >
                {getCharacterCountMessage()}
              </Text>
            </Rows>
          </Box>
        )}

        {/* Error Alert */}
        {hasError && (
          <Alert tone="critical" title={intl.formatMessage({
            defaultMessage: "Export Failed",
            description: "Title for export error alert"
          })}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {isCompleted && (
          <Alert tone="positive" title={intl.formatMessage({
            defaultMessage: "Success!",
            description: "Title for success alert"
          })}>
            {intl.formatMessage({
              defaultMessage: "Your design has been exported and code has been generated successfully.",
              description: "Success message for completed export"
            })}
          </Alert>
        )}

        {/* Action Buttons */}
        <Rows spacing="1u">
          {!isLoading && (
            <Button
              variant="primary"
              onClick={handleExportAndGenerate}
              icon={() => <Code2 size={16} />}
              stretch={true}
            >
              {intl.formatMessage({
                defaultMessage: "Export & Generate Code",
                description: "Button to start code generation"
              })}
            </Button>
          )}
          
          {(hasError || isCompleted) && (
            <Button
              variant="secondary"
              onClick={resetExport}
              stretch={true}
            >
              {intl.formatMessage({
                defaultMessage: "Start Over",
                description: "Button to reset the export process"
              })}
            </Button>
          )}
        </Rows>

        {/* Helper text below button */}
        {!isLoading && !isCompleted && !hasError && (
          <Text size="small" tone="tertiary">
            {intl.formatMessage({
              defaultMessage: "A pop-up will ask for export size. Just click 'Export' to continue.",
              description: "Helper text about the export dialog"
            })}
          </Text>
        )}

      </Rows>
    </Box>
  );
};