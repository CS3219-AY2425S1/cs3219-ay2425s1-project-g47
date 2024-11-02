import type { AppProps, AppContext } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";

import { User } from "@/types/user";
import axios from "@/utils/axios";
import { UserProvider } from "@/context/UserContext";
import { fontSans, fontMono } from "@/config/fonts";
import "@/styles/globals.css";

const queryClient = new QueryClient();

interface CustomAppProps extends AppProps {
  initialUser: User | null;
}

function App({ Component, pageProps, initialUser }: CustomAppProps) {
  const router = useRouter();

  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider navigate={router.push}>
        <NextThemesProvider>
          <UserProvider initialUser={initialUser}>
            <Component {...pageProps} />
          </UserProvider>
        </NextThemesProvider>
      </NextUIProvider>
    </QueryClientProvider>
  );
}

// Define the return type of getInitialProps
App.getInitialProps = async (appContext: AppContext): Promise<{ initialUser: User | null; pageProps: any }> => {
  const appProps = await App.getInitialProps(appContext);
  let initialUser = null;

  try {
    // Use the cookie from the request header to verify the token server-side
    const res = await axios.get<User>("/user-service/auth/verify-token", {
      headers: appContext.ctx.req ? { cookie: appContext.ctx.req.headers.cookie } : undefined,
    });
    initialUser = res.data;
  } catch (error) {
    console.error("Error fetching user:", error);
  }

  return { ...appProps, initialUser };
};

export default App;

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
