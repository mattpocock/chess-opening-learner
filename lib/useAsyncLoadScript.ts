import { useEffect, useState } from "react";

interface UseAsyncLoadScriptParams {
  src: string;
}

/**
 * Used to asynchronously load an external script file
 * via a CDN. Useful for loading in Paddle, Matterport etc.
 */
export const useAsyncLoadScript = ({ src }: UseAsyncLoadScriptParams) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    const scriptElement = document.createElement("script");
    scriptElement.src = src;
    scriptElement.onload = () => setHasLoaded(true);

    // TODO - double check that this works with IE11
    document.body.appendChild(scriptElement);
  }, [src]);

  return hasLoaded;
};
