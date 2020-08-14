import { useEffect } from "react";

/**
 * This hook listens to a key code and triggers a callback based
 * on that event
 */
function useOnKeyDown(key, handler) {
  useEffect(() => {
    const listener = (event) => {
      const keyName = event.key || null;
      const keyCode = event.keyCode || null;
      if (key === keyCode || key === keyName) {
        handler(event);
      }
    };

    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [key, handler]);
}

export default useOnKeyDown;
