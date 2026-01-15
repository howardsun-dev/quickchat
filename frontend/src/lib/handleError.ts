import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';

export const handleError = (
  error: unknown,
  fallback: string = 'Error occurred'
) => {
  if (isAxiosError(error) && error.response?.status === 401) {
    console.log('Unauthorized access - 401');
    return;
  }

  if (isAxiosError(error)) {
    toast.error(error.response?.data?.message ?? fallback);
    return;
  }
  toast.error(fallback);

  return fallback;
};
