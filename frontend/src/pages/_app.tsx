import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider } from '../context/ThemeContext';
import { CategoriesProvider } from '../context/CategoriesContext';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://kit.fontawesome.com/a076d05399.js';
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <CategoriesProvider>
          <Head>
            <title>Spendio - Облік особистих витрат</title>
            <meta name="description" content="Додаток для обліку особистих витрат" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Component {...pageProps} />
        </CategoriesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp; 