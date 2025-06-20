import React, { useState } from 'react';
import { Rows, Tabs, TabList, Tab, TabPanels, TabPanel, Text } from '@canva/app-ui-kit';
import { FormattedMessage, useIntl } from 'react-intl';
import { AppError } from 'src/components/app_error';
import { ExportDesign } from 'src/components/export_design';
import { CodeDisplay } from 'src/components/code_display';

export const GeneratePage = () => {
  const intl = useIntl();
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
      
      <Tabs defaultActiveId={activeTab}>
        <TabList align="start" spacing="2u">
          <Tab id="export" onClick={() => setActiveTab('export')}>
            <Text>
              <FormattedMessage
                defaultMessage="Export & Generate Code"
                description="Tab label for exporting and generating code"
              />
            </Text>
          </Tab>
          <Tab id="code" onClick={() => setActiveTab('code')}>
            <Text>
              <FormattedMessage
                defaultMessage="Generated Code{checkmark}"
                description="Tab label for generated code with optional checkmark"
                values={{
                  checkmark: generatedCode ? ' ✓' : ''
                }}
              />
            </Text>
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
                title={intl.formatMessage({
                  defaultMessage: "Generated React Component",
                  description: "Title for the generated code display"
                })}
                language="typescript"
                onClear={handleClearCode}
              />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                <Text>
                  <FormattedMessage
                    defaultMessage="No code generated yet. Use the 'Export & Generate Code' tab to create code from your design."
                    description="Message shown when no code has been generated yet"
                  />
                </Text>
              </div>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Rows>
  );
};
