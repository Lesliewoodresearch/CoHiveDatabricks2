import { useState, useEffect } from 'react';
import ProcessWireframe from "./components/ProcessWireframe";
import { Login } from "./components/Login";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Set favicon with a larger hexagon
  useEffect(() => {
    // Create SVG hexagon favicon that fills the space
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:1" />
            <stop offset="25%" style="stop-color:#C74AFF;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#4A9DFF;stop-opacity:1" />
            <stop offset="75%" style="stop-color:#4AFFDB;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FFD93D;stop-opacity:1" />
          </linearGradient>
        </defs>
        <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="url(#hexGradient)" stroke="none"/>
      </svg>
    `;
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = url;
    document.head.appendChild(link);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <ProcessWireframe />
    </div>
  );
}