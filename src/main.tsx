import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Корневой элемент #root не найден');
}

createRoot(container).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
);
