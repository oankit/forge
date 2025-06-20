import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Text,
  Title,
  Rows,
  Columns,
  Column,
  Alert,
  LoadingIndicator,
  ProgressBar,
  FormField,
  MultilineInput,
  ImageCard,
} from '@canva/app-ui-kit';
import { requestExport } from '@canva/design';
import { useAppContext } from 'src/context';

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
      updateExportState({ status: 'exporting', progress: 25 });
      
      const result = await requestExport({
        acceptedFileTypes: [exportFormat],
      });
      
      if (result.status === 'completed' && result.exportBlobs.length > 0) {
        updateExportState({ progress: 50 });
        return result.exportBlobs[0].url;
      } else {
        throw new Error('Export was cancelled or failed');
      }
    } catch (error) {
      throw new Error(`Failed to export design: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateCodeFromImage = async (imageUrl: string, prompt: string): Promise<string> => {
    try {
      updateExportState({ status: 'generating', progress: 75 });
      
      const response = await fetch('/api/generate_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          prompt: prompt || 'Generate React component code for this design',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
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
        <Title size="medium">
          {intl.formatMessage({
            defaultMessage: "Export Design & Generate Code",
            description: "Title for the export design section"
          })}
        </Title>
        
        <Text>
          {intl.formatMessage({
            defaultMessage: "Export your current design and generate React component code using AI.",
            description: "Description for the export functionality"
          })}
        </Text>



        {/* Code Generation Prompt */}
        <FormField
          label={intl.formatMessage({
            defaultMessage: "Code Generation Instructions (Optional)",
            description: "Label for code generation prompt input"
          })}
          value={codePrompt}
          control={(props) => (
            <MultilineInput
              {...props}
              placeholder={intl.formatMessage({
                defaultMessage: "Describe how you want the code to be generated (e.g., 'Create a responsive React component with Tailwind CSS')...",
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
              <Text size="small">{getStatusMessage()}</Text>
              <ProgressBar value={exportState.progress} />
              <Columns spacing="1u" alignY="center">
                <Column>
                  <Box padding="1u">
                    <LoadingIndicator size="medium" />
                  </Box>
                </Column>
              </Columns>
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
        <Columns spacing="2u" alignY="center">
          <Column width="content">
            <Button
              variant="primary"
              onClick={handleExportAndGenerate}
              disabled={isLoading}
            >
              {isLoading ? intl.formatMessage({
                defaultMessage: "Processing...",
                description: "Button text while processing"
              }) : intl.formatMessage({
                defaultMessage: "Export & Generate Code",
                description: "Button to start export and code generation"
              })}
            </Button>
          </Column>
          
          {(hasError || isCompleted) && (
            <Column width="content">
              <Button
                variant="secondary"
                onClick={resetExport}
              >
                {intl.formatMessage({
                  defaultMessage: "Start Over",
                  description: "Button to reset the export process"
                })}
              </Button>
            </Column>
          )}
        </Columns>

        {/* Preview of exported image */}
        {exportState.exportedImageUrl && (
          <Box>
            <Text size="small">
              {intl.formatMessage({
                defaultMessage: "Exported Design Preview:",
                description: "Label for exported image preview"
              })}
            </Text>
            <Box 
              border="standard" 
              borderRadius="standard" 
              padding="1u"
            >
              <Columns spacing="1u" alignY="center">
                <Column>
                  <ImageCard 
                    thumbnailUrl={exportState.exportedImageUrl} 
                    alt={intl.formatMessage({
                      defaultMessage: "Exported design",
                      description: "Alt text for exported design image"
                    })}
                    ariaLabel={intl.formatMessage({
                      defaultMessage: "Exported design",
                      description: "Alt text for exported design image"
                    })}
                    onClick={() => {}}
                  />
                </Column>
              </Columns>
            </Box>
          </Box>
        )}
      </Rows>
    </Box>
  );
};