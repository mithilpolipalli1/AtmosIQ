import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Overview from "./pages/Overview";
import Anomalies from "./pages/Anomalies";
import Trends from "./pages/Trends";
import MapView from "./pages/MapView";
import AIInsights from "./pages/AIInsights";
import DeliveryAdvisory from "./pages/DeliveryAdvisory";
import Home from "./pages/Home";
import { warmUpBackend } from "./api/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("Home");

  // Fire warm-up ping immediately on app load — wakes Render before user clicks anything
  useEffect(() => {
    warmUpBackend();
  }, []);

  // Keep state for city globally
  const [globalCity, setGlobalCity] = useState("Hyderabad");

  const renderContent = () => {
    switch(activeTab) {
      case "Home":
        return <Home onDiscover={() => setActiveTab("Overview")} />;
      case "Overview":
        return <Overview globalCity={globalCity} setGlobalCity={setGlobalCity} />;
      case "Anomalies":
        return <Anomalies globalCity={globalCity} setGlobalCity={setGlobalCity} />;
      case "Trends":
        return <Trends globalCity={globalCity} setGlobalCity={setGlobalCity} />;
      case "Map":
        return <MapView globalCity={globalCity} setGlobalCity={setGlobalCity} />;
      case "AI Insights":
        return <AIInsights globalCity={globalCity} setGlobalCity={setGlobalCity} />;
      case "Delivery API":
        return <DeliveryAdvisory globalCity={globalCity} setGlobalCity={setGlobalCity} />;
      default:
        return <Overview globalCity={globalCity} setGlobalCity={setGlobalCity} />;
    }
  }

  // If we are on the Home page, show ONLY the Home content for a clean landing experience
  if (activeTab === "Home") {
    return (
      <div className="min-h-screen bg-[#070913] text-slate-100 font-sans tracking-wide">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#070913] text-slate-100 font-sans tracking-wide">

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <Header />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>

      </div>
    </div>
  );
}