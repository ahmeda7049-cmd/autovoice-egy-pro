import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker immediately to cache app for 100% offline usage
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('OBD2 App: New content available, updated in background.');
  },
  onOfflineReady() {
    console.log('OBD2 App: Ready to work completely offline without internet connection!');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
