import { useEffect, useState } from 'react';
import { axiosInstance } from '../lib/axios';

export const useUserStatus = (userId: string) => {
  const [status, setStatus] = useState({ lastSeen: null });

  useEffect(() => {
    if (!userId) return;

    const fetchStatus = async () => {
      const res = await axiosInstance.get(`/user/status/${userId}`);
      setStatus(res.data);
    };

    fetchStatus();
  }, [userId]);

  return status;
};
