import { AppInitialProps } from 'next/app';
import React, { ComponentType } from 'react';
import { Provider } from 'react-redux';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import defaultTheme from '../lib/theme';
import store from '../src/store';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: ${(props) => props.theme.colors.text};
  }

  p {
    margin: 0;
  }

  a {
    color: inherit;
    text-decoration: 0;
  }

  button {
    border: 0;
    padding: 0;
    color: inherit;
    background: 0;
  }
`;

const MyApp = ({
  Component,
  pageProps,
}: {
  Component: ComponentType<AppInitialProps>;
  pageProps: AppInitialProps;
}): JSX.Element => (
  <Provider store={store}>
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyle />
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...pageProps} />
    </ThemeProvider>
  </Provider>
);

export default MyApp;
