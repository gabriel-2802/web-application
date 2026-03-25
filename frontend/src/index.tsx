import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DevSupport } from '@react-buddy/ide-toolbox';
import { ComponentPreviews, useInitial } from './dev';
import { LoginContextProvider } from './context/Context';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <DevSupport
      ComponentPreviews={ComponentPreviews}
      useInitialHook={useInitial}
    >
      <LoginContextProvider>
        <App />
      </LoginContextProvider>
    </DevSupport>
  </React.StrictMode>
);
