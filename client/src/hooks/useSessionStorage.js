// Citation:
// Source: https://usehooks.com/useLocalStorage/
// Date: 07/09/2022
// Modified to use sessionStorage instead of localStorage
// For future release it will maybe be better to use local storage
// But for testing in my browsers I need storage by tab, not browser
import { useState } from 'react';

const PREFIX = "image-game-";


export default function useSessionStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  
  key = PREFIX + key
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.sessionStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}