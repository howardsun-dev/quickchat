import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';

export const handleError = (
  error: unknown,
  fallback: string = 'Error occurred'
) => {
  if (isAxiosError(error)) {
    toast.error(error.response?.data?.message ?? fallback);
    return;
  }
  toast.error(fallback);
};
