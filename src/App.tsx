import { useState } from "react";

import Sidebar from "./components/Sidebar";

import Supervisor from "./pages/Supervisor";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import ManufacturingFloor from "./pages/ManufacturingFloor";
import AssemblyFloor from "./pages/AssemblyFloor.tsx";
import Settings from "./pages/Settings";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [collapsed, setCollapsed] = useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case "Supervisor":
        return <Supervisor />;

      case "Analytics":
        return <Analytics />;

      case "Manufacturing Floor":
        return <ManufacturingFloor />;

      case "Assembly Floor":
        return <AssemblyFloor />;

      case "Settings":
        return <Settings />;

      case "Dashboard":
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-[#f3f4f6]">
      {/* SIDEBAR */}

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />

      {/* PAGE CONTENT */}

      <div className="flex-1 overflow-auto h-screen">{renderPage()}</div>
    </div>
  );
}

export default App;
