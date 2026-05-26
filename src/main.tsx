import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import 'antd/dist/antd.css';
import { ThemeProvider } from 'styled-components';
import App from './App';
import { RootStore } from './stores/RootStore';
import { RootStoreProvider } from './stores/RootStoreContext';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';

const rootStore = new RootStore();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider componentSize="middle">
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <RootStoreProvider store={rootStore}>
          <App />
        </RootStoreProvider>
      </ThemeProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
