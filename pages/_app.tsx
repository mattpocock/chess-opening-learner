import { Box, ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { useAsyncLoadScript } from "../lib/useAsyncLoadScript";

function MyApp({ Component, pageProps }: AppProps) {
  const hasLoaded = useAsyncLoadScript({
    src: "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js",
  });

  if (!hasLoaded) return null;

  return (
    <>
      <ChakraProvider>
        <Box p={6}>
          <Component {...pageProps} />
        </Box>
      </ChakraProvider>
    </>
  );
}
export default MyApp;
