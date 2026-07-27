const asBool = (value) => String(value || "").toLowerCase() === "true";

export const USE_TASK_DETAILS_MOCK_MODE =
  import.meta.env.DEV && asBool(import.meta.env.VITE_USE_TASK_DETAILS_MOCK);
