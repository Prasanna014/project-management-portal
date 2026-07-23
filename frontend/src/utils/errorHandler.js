export const handleApiError = (error, setError) => {
  const message =
    error?.response?.data?.message ||
    "Something went wrong";

  setError(message);
};
