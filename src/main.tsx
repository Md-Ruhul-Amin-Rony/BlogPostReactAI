import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './app/store';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      {/* <BrowserRouter> */}
      <HashRouter>
        
        <App />
      </HashRouter>
      {/* </BrowserRouter> */}
    </Provider>
  </StrictMode>
);