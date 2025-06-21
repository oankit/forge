import { defineMessages } from "@formatjs/intl";

export const ContextMessages = defineMessages({
  /** Messages related to handling errors that occur during operations. */
  appErrorGeneral: {
    defaultMessage: "An unexpected error occurred. Please try again later.",
    description:
      "A message to indicate that an unexpected error occurred, but no more information is available",
  },

  /** Messages related to prompts and user input validation. */
  promptMissingErrorMessage: {
    defaultMessage: "Please describe what you want to create",
    description:
      "An error message to indicate that the prompt was empty and should be supplied",
  },
});
