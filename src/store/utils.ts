export const initEntityState = (initialValue: any, loading = false) => ({
    loading,
    data: initialValue,
    loadFailed: false,
    error: null,
    canceler: null
});

export const entityLoadingStarted = (state: any, canceler: any) => ({
    ...state,
    canceler,
    loading: true,
    error: null,
    loadFailed: false
});

export const entityLoadingSucceeded = (state: any, data: any) => ({
    ...state,
    data,
    loading: false,
    error: null,
    loadFailed: false,
    canceler: null
});

export const entityLoadingFailed = (state: any, error: any) => ({
    ...state,
    loading: false,
    error,
    loadFailed: true,
    canceler: null
});

export const getErrorMessage = (error: any, defaultErrorMessage?: string) => {
    if (error && typeof error === 'string') return error;
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      if (
        error.response.data.message &&
        error.response.data.message.storageErrors
      ) {
        return 'problem with the image';
      }
      if (error.response.data.message && error.response.data.message.message) {
        return error.response.data.message.message;
      }
      return error.response.data.message;
    }
    if (error && error.data && error.data.message) return error.data.message;
    if (error && error.message) {
      return error.message;
    }
    if (defaultErrorMessage) return defaultErrorMessage;
    return 'oops something went wrong';
  };