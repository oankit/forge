import React, { createContext, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { getRemainingCredits } from "src/api";
import { ContextMessages as Messages } from "./context.messages";

export interface AppContextType {
  appError: string;
  setAppError: (value: string) => void;
  creditsError: string;
  setCreditsError: (value: string) => void;
  loadingApp: boolean;
  setLoadingApp: (value: boolean) => void;

  jobId: string;
  setJobId: (value: string) => void;
  remainingCredits: number;
  setRemainingCredits: (value: number) => void;
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
  creditsError: "",
  setCreditsError: () => {},
  loadingApp: true,
  setLoadingApp: () => {},

  jobId: "",
  setJobId: () => {},
  remainingCredits: 0,
  setRemainingCredits: () => {},
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
 * It manages state related to app errors, loading status, remaining credits, user input for prompts, image styles, and generated images.
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
  const [remainingCredits, setRemainingCredits] = useState<number>(0);
  const [promptInput, setPromptInput] = useState<string>("");
  const [promptInputError, setPromptInputError] = useState<string>("");

  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [creditsError, setCreditsError] = useState<string>("");
  const intl = useIntl();

  // Fetches initial data on component mount
  useEffect(() => {
    const fetchDataOnMount = async () => {
      try {
        setLoadingApp(true);

        // Fetch remaining credits
        try {
          const { credits } = await getRemainingCredits();
          setRemainingCredits(credits);
        } catch (error) {
          setAppError(
            intl.formatMessage(Messages.appErrorGetRemainingCreditsFailed),
          );
          // eslint-disable-next-line no-console
          console.error("Error fetching remaining credits:", error);
        }
      } catch (error) {
        setAppError(intl.formatMessage(Messages.appErrorGeneral));
        // eslint-disable-next-line no-console
        console.error("Error fetching data:", error);
      } finally {
        setLoadingApp(false);
      }
    };

    fetchDataOnMount();
  }, []);

  // Manages errors related to remaining credits
  useEffect(() => {
    if (loadingApp || remainingCredits > 0) {
      setCreditsError("");
      return;
    }

    const errorMessage = intl.formatMessage(Messages.alertNotEnoughCredits);

    setCreditsError(errorMessage);
  }, [loadingApp, remainingCredits]);

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
    creditsError,
    setCreditsError,
    loadingApp,
    setLoadingApp,

    jobId,
    setJobId,
    remainingCredits,
    setRemainingCredits,
    promptInput,
    setPromptInput: setPromptInputHandler,
    promptInputError,
    setPromptInputError,

    generatedCode,
    setGeneratedCode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
