import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';

export const handleError = (
  error: unknown,
  fallback: string = 'Error occurred'
) => {
  console.error('Store error:', error);
  if (isAxiosError(error)) {
    toast.error(error.response?.data?.message ?? fallback);
    return;
  }
  toast.error(fallback);
};
