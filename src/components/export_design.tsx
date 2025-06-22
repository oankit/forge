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
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  
  // Status phrases for the animated ticker
  const statusPhrases = [
    // --- Technical & Nerdy ---
    "Compiling the pixels...",
    "Transpiling design to JSX...",
    "Resolving component dependencies...",
    "Reticulating splines...",
    "Deconstructing the DOM tree...",
    "Calibrating the AI matrix...",
    "Buffering the render props...",
    "Optimizing the build output...",
    "Warming up the serverless functions...",
    "Synchronizing quantum states...",
    "Re-aligning the flux capacitor...",
    "Polishing the TypeScript interfaces...",
    "Running Prettier... twice.",
  
    // --- Agentic & AI-Focused ---
    "Consulting the AI architect...",
    "The agent is on the case...",
    "Initiating cognitive cycle...",
    "Running neural network inference...",
    "Parsing visual vectors...",
    "Synthesizing code from concept...",
    "Engaging heuristic algorithms...",
    "The AI is pondering your design...",
    "Training a tiny model on your button...",
    "Waking up the AI... it's a heavy sleeper.",
    "Asking the silicon for its opinion...",
  
    // --- Witty & Fun ---
    "Summoning the code spirits...",
    "Teaching the AI about rounded corners...",
    "Don't worry, the AI is a professional...",
    "Pretending to be a human developer...",
    "Adding just one more `div`...",
    "Arguing with the linter...",
    "Hiding my API keys...",
    "Searching for a missing semicolon...",
    "Looks like you've been working hard...",
    "Generating some ✨magic✨...",
    "Brewing some fresh code...",
    
    // --- Classic & Gaming-Inspired ---
    "Generating your component...",
    "Doing some behind-the-scenes magic...",
    "Still working on it...",
    "Making it developer-ready...",
    "Assembling the final touches...",
    "Polishing things up...",
    "Getting everything just right...",
    "Running it through our AI brain...",
    "Typing... kind of.",
    "Loading... please wait.",
    "Constructing additional pylons...",
    "Warp drive charging...",
    "Building terrain..."
  ];

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



  const isLoading = ['exporting', 'generating'].includes(exportState.status);
  const isCompleted = exportState.status === 'completed';
  const hasError = exportState.status === 'error';
  
  // Animate the status ticker when loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentStatusIndex((prevIndex) => 
          (prevIndex + 1) % statusPhrases.length
        );
      }, 1800); // Cycle every 1.8 seconds
    } else {
      setCurrentStatusIndex(0); // Reset when not loading
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading, statusPhrases.length]);

  return (
    <Box padding="2u">
      <Rows spacing="2u">
        {/* Description - Hidden during loading */}
        {!isLoading && (
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
        )}

        {/* Code Generation Prompt - Hidden during loading */}
        {!isLoading && (
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
        )}

        {/* Loading Indicator with Animated Status Ticker */}
        {isLoading && (
          <Box>
            <Rows spacing="2u" align="center">
              <LoadingIndicator size="medium" />
              <div 
                style={{
                  height: '48px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    transform: `translateY(-${currentStatusIndex * 48}px)`,
                    transition: 'transform 0.5s ease-in-out'
                  }}
                >
                  {statusPhrases.map((phrase, index) => (
                    <div
                      key={index}
                      style={{
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Title size="small">{phrase}</Title>
                    </div>
                  ))}
                </div>
              </div>
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