import React, { createContext, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { ContextMessages as Messages } from "./context.messages";

export interface AppContextType {
  appError: string;
  setAppError: (value: string) => void;
  loadingApp: boolean;
  setLoadingApp: (value: boolean) => void;

  jobId: string;
  setJobId: (value: string) => void;
  promptInput: string;
  setPromptInput: (value: string) => void;
  promptInputError: string;
  setPromptInputError: (value: string) => void;

  generatedCode: string;
  setGeneratedCode: (value: string) => void;
}

export const AppContext = createContext<AppContextType>({
  appError: "",
  setAppError: () => {},
  loadingApp: true,
  setLoadingApp: () => {},

  jobId: "",
  setJobId: () => {},
  promptInput: "",
  setPromptInput: () => {},
  promptInputError: "",
  setPromptInputError: () => {},

  generatedCode: "",
  setGeneratedCode: () => {},
});

/**
 * Provides application-wide state and methods using React Context.
 * @param {object} props - The props object.
 * @param {React.ReactNode} props.children - The children components wrapped by the provider.
 * @returns {JSX.Element} The provider component.
 * @description This provider component wraps the entire application to provide application-wide state and methods using React Context.
 * It manages state related to app errors, loading status, user input for prompts, image styles, and generated images.
 * It exposes these state values and setter methods to its child components via the AppContext.
 * For more information on React Context, refer to the official React documentation: {@link https://react.dev/learn/passing-data-deeply-with-context}.
 */
export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const [appError, setAppError] = useState<string>("");
  const [loadingApp, setLoadingApp] = useState<boolean>(true); // set to true to prevent ui flash on load

  const [jobId, setJobId] = useState<string>("");
  const [promptInput, setPromptInput] = useState<string>("");
  const [promptInputError, setPromptInputError] = useState<string>("");

  const [generatedCode, setGeneratedCode] = useState<string>("");
  const intl = useIntl();

  // Set loading to false on component mount
  useEffect(() => {
    setLoadingApp(false);
  }, []);



  const setPromptInputHandler = (value: string) => {
    if (
      promptInputError ===
      intl.formatMessage(Messages.promptMissingErrorMessage)
    ) {
      setPromptInputError("");
    }
    if (value === "") {
      setPromptInputError("");
    }

    setPromptInput(value);
  };

  const value: AppContextType = {
    appError,
    setAppError,
    loadingApp,
    setLoadingApp,

    jobId,
    setJobId,
    promptInput,
    setPromptInput: setPromptInputHandler,
    promptInputError,
    setPromptInputError,

    generatedCode,
    setGeneratedCode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
