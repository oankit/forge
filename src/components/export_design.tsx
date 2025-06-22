import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Text,
  Rows,
  Columns,
  Column,
  Alert,
  ProgressBar,
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

type ExportStatus = 'idle' | 'exporting' | 'generating' | 'completed' | 'error';

interface ExportState {
  status: ExportStatus;
  progress: number;
  error: string;
  exportedImageUrl: string;
  generatedCode: string;
}

export const ExportDesign: React.FC<ExportDesignProps> = ({ onCodeGenerated }) => {
  const intl = useIntl();
  const { setAppError } = useAppContext();
  
  const [exportState, setExportState] = useState<ExportState>({
    status: 'idle',
    progress: 0,
    error: '',
    exportedImageUrl: '',
    generatedCode: '',
  });
  
  const exportFormat = 'png'; // Always use PNG for best quality and transparency support
  const [codePrompt, setCodePrompt] = useState('');

  const updateExportState = (updates: Partial<ExportState>) => {
    setExportState(prev => ({ ...prev, ...updates }));
  };

  const exportDesignAsImage = async (): Promise<string> => {
    try {
      console.log('[EXPORT] Starting design export as image');
      updateExportState({ status: 'exporting', progress: 25 });
      
      const result = await requestExport({
        acceptedFileTypes: [exportFormat],
      });
      
      if (result.status === 'completed' && result.exportBlobs.length > 0) {
        console.log('[EXPORT] Design export completed successfully');
        updateExportState({ progress: 40 });
        
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

  const generateCodeFromImage = async (imageUrl: string, prompt: string): Promise<string> => {
    try {
      console.log('[EXPORT] Starting code generation from image, prompt length:', prompt?.length || 0);
      console.log('[EXPORT] Image URL format:', imageUrl.substring(0, 50) + '...');
      console.log('[EXPORT] Image URL starts with data:image/:', imageUrl.startsWith('data:image/'));
      updateExportState({ status: 'generating', progress: 75 });
      
      console.log('[EXPORT] Getting Canva user token for authentication');
      const token = await auth.getCanvaUserToken();
      
      const requestBody = {
        imageDataURL: imageUrl,
        prompt: prompt || 'Generate React component code for this design',
      };
      
      console.log('[EXPORT] Request body keys:', Object.keys(requestBody));
      console.log('[EXPORT] Making API request to /api/generate');
      
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[EXPORT] API request failed:', response.status, response.statusText);
        console.error('[EXPORT] Error response body:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[EXPORT] Code generation API response received, code length:', (data.code || data.text || '').length);
      updateExportState({ progress: 100 });
      
      return data.code || data.text || 'No code generated';
    } catch (error) {
      throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExportAndGenerate = async () => {
    try {
      updateExportState({ 
        status: 'exporting', 
        progress: 0, 
        error: '', 
        exportedImageUrl: '', 
        generatedCode: '' 
      });
      
      // Step 1: Export design as image
      const imageUrl = await exportDesignAsImage();
      updateExportState({ exportedImageUrl: imageUrl });
      
      // Step 2: Generate code from image
      const generatedCode = await generateCodeFromImage(imageUrl, codePrompt);
      
      updateExportState({ 
        status: 'completed', 
        generatedCode,
        progress: 100 
      });
      
      // Notify parent component
      onCodeGenerated(generatedCode);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      updateExportState({ 
        status: 'error', 
        error: errorMessage,
        progress: 0 
      });
      setAppError(errorMessage);
    }
  };

  const resetExport = () => {
    updateExportState({
      status: 'idle',
      progress: 0,
      error: '',
      exportedImageUrl: '',
      generatedCode: '',
    });
  };

  const getStatusMessage = () => {
    switch (exportState.status) {
      case 'exporting':
        return intl.formatMessage({
          defaultMessage: "Exporting design...",
          description: "Status message during design export"
        });
      case 'generating':
        return intl.formatMessage({
          defaultMessage: "Generating code with AI...",
          description: "Status message during code generation"
        });
      case 'completed':
        return intl.formatMessage({
          defaultMessage: "Code generation completed!",
          description: "Status message when process is completed"
        });
      case 'error':
        return intl.formatMessage({
          defaultMessage: "Export failed",
          description: "Status message when export fails"
        });
      default:
        return '';
    }
  };

  const isLoading = ['exporting', 'generating'].includes(exportState.status);
  const isCompleted = exportState.status === 'completed';
  const hasError = exportState.status === 'error';

  return (
    <Box padding="2u">
      <Rows spacing="2u">
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
          value={codePrompt}
          control={(props) => (
            <MultilineInput
              {...props}
              placeholder={intl.formatMessage({
                defaultMessage: "e.g., Use Tailwind CSS and Flexbox layout",
                description: "Placeholder for code generation prompt"
              })}
              onChange={setCodePrompt}
              maxLength={500}
              minRows={3}
            />
          )}
        />

        {/* Progress Indicator */}
        {isLoading && (
          <Box>
            <Rows spacing="1u">
              <ProgressBar value={exportState.progress} />
              <Rows align="center" spacing="2u">
                <Title size="small">{getStatusMessage()}</Title>
              </Rows>
            </Rows>
          </Box>
        )}

        {/* Error Alert */}
        {hasError && (
          <Alert tone="critical" title={intl.formatMessage({
            defaultMessage: "Export Failed",
            description: "Title for export error alert"
          })}>
            {exportState.error}
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