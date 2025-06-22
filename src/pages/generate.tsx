import React, { useState } from 'react';
import { Rows, Tabs, TabList, Tab, TabPanels, TabPanel, Text, Box } from '@canva/app-ui-kit';
import { FormattedMessage} from 'react-intl';
import { AppError } from 'src/components/app_error';
import { ExportDesign } from 'src/components/export_design';
import { CodeDisplay } from 'src/components/code_display';

export const GeneratePage = () => {
  const [generatedCode, setGeneratedCode] = useState('');
  const [activeTab, setActiveTab] = useState('export');

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code);
    setActiveTab('code'); // Switch to code tab when code is generated
  };

  const handleClearCode = () => {
    setGeneratedCode('');
    setActiveTab('export');
  };

  return (
    <Rows spacing="2u">
      <AppError />
      
      <Tabs activeId={activeTab}>
        <TabList align="stretch" spacing="1u">
          <Tab id="export" onClick={() => setActiveTab('export')}>
            <FormattedMessage
              defaultMessage="Generate Code"
              description="Tab label for generating code"
            />
          </Tab>
          <Tab id="code" onClick={() => setActiveTab('code')}>
            <FormattedMessage
              defaultMessage="View Code{checkmark}"
              description="Tab label for viewing generated code with optional checkmark"
              values={{
                checkmark: generatedCode ? ' ✓' : ''
              }}
            />
          </Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel id="export">
            <ExportDesign onCodeGenerated={handleCodeGenerated} />
          </TabPanel>
          
          <TabPanel id="code">
            {generatedCode ? (
              <CodeDisplay 
                code={generatedCode} 
                language="typescript"
                onClear={handleClearCode}
              />
            ) : (
              <Box padding="3u">
                <div style={{ textAlign: 'center' }}>
                  <Text tone="secondary">
                    <FormattedMessage
                      defaultMessage="No code generated yet. Use the 'Turn into Code' tab to create code from your design."
                      description="Message shown when no code has been generated yet"
                    />
                  </Text>
                </div>
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Rows>
  );
};