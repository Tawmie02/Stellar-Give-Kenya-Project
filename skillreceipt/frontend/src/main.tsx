import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { WalletProvider } from './context/WalletContext';
import { ProjectProvider } from './context/ProjectContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <ProjectProvider>
          <App />
        </ProjectProvider>
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
