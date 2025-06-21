import { Alert } from "@canva/app-ui-kit";
import { useAppContext } from "src/context";

export const AppError = () => {
  const { loadingApp, appError, setAppError } = useAppContext();
  if (loadingApp || !appError) {
    return;
  }

  return (
    <Alert
      tone="critical"
      onDismiss={() => setAppError("")}
    >
      {appError}
    </Alert>
  );
};
