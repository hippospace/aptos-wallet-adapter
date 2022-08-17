import { useEffect, useState } from 'react';

export const useSSR = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
    }
  }, []);

  return {
    isClient
  };
};
