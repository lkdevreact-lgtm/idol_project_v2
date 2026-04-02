import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import ConnectForm from "./components/ConnectForm";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import { useVideoStore } from "./hooks/useVideoStore";
import Sidebar from "./components/Layout/Sidebar";
import FooterBar from "./components/Layout/FooterBar";

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { fetchVideos } = useVideoStore();

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  if (!isConnected) {
    return (
      <div className="w-screen h-screen relative flex items-center justify-center bg-black overflow-hidden">
        {/* Background Image */}
        <img
          src="/images/background.png"
          alt="background"
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-40 z-0"
        />
        <ConnectForm onConnectSuccess={() => setIsConnected(true)} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black/80 flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 h-full sm:h-screen sm:px-3 overflow-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </div>
      <FooterBar />
    </div>
  );
};

export default App;
