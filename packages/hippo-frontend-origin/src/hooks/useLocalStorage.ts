import { useCallback, useState } from 'react';

export const useLocalStorage = () => {
  const useLocalStorageState = <T>(
    key: string,
    defaultState: T,
    session?: boolean
  ): [T, (T: any) => void] => {
    const storage = session ? sessionStorage : localStorage;
    const [state, setState] = useState(() => {
      let storedState = storage.getItem(key);
      if (storedState) {
        return JSON.parse(storedState || '');
      }
      return defaultState;
    });

    const setLocalStorageState = useCallback(
      (newState: any) => {
        setState(newState);
        if (newState === null) {
          storage.removeItem(key);
        } else {
          storage.setItem(key, JSON.stringify(newState));
        }
      },
      [key, storage]
    );

    return [state, setLocalStorageState];
  };

  return { useLocalStorageState };
};
