import {
  LayoutDashboard,
  Settings,
  ClipboardList,
  Bell,
  ChevronRight,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  BarChart3,
  Factory,
  Boxes,
} from "lucide-react";

interface SidebarProps {
  activePage: string;

  setActivePage: (page: string) => void;

  collapsed: boolean;

  setCollapsed: (value: boolean) => void;

  mobileSidebarOpen: boolean;

  setMobileSidebarOpen: (value: boolean) => void;
}

export default function Sidebar({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}: SidebarProps) {
  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },

    {
      name: "Supervisor",
      icon: ClipboardList,
    },

    {
      name: "Analytics",
      icon: BarChart3,
    },

    {
      name: "Manufacturing Floor",
      icon: Factory,
    },

    {
      name: "Assembly Floor",
      icon: Boxes,
    },

    {
      name: "Settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* ========================= */}
      {/* MOBILE NAVBAR */}
      {/* ========================= */}

      <div className="md:hidden fixed top-0 left-0 right-0 z-70 bg-[#111827] border-b border-gray-800 px-4 py-3 flex items-center justify-between shadow-lg">
        {/* LOGO */}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
            <img src="/logo.svg" alt="Logo" className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-white font-bold text-sm">Flexi Care</h1>

            <p className="text-gray-400 text-[10px]">Production Monitoring</p>
          </div>
        </div>

        {/* MENU BUTTON */}

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="bg-[#1f2937] p-2 rounded-xl text-white"
        >
          {mobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ========================= */}
      {/* MOBILE OVERLAY */}
      {/* ========================= */}

      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="
            fixed
            inset-0
            bg-black/50
            z-40
            md:hidden
          "
          style={{
            top: "72px",
          }}
        />
      )}

      {/* ========================= */}
      {/* MOBILE DROPDOWN MENU */}
      {/* ========================= */}

      <div
        className={`
          fixed
          top-18
          left-3
          right-3
          z-60
          md:hidden
          bg-[#111827]
          rounded-3xl
          shadow-2xl
          border
          border-gray-800
          overflow-hidden
          transition-all
          duration-300

          ${
            mobileSidebarOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-5 pointer-events-none"
          }
        `}
      >
        {/* STATUS */}

        {/* <div className="p-4 border-b border-gray-800">
          <div className="bg-[#1f2937] rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">
                System Status
              </span>

              <Wifi
                size={18}
                className="text-green-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

              <span className="font-semibold text-sm text-green-400">
                Online
              </span>
            </div>
          </div>
        </div> */}

        {/* MENU */}

        <div className="p-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive = activePage === item.name;

            return (
              <button
                key={item.name}
                onClick={() => {
                  setActivePage(item.name);

                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 ${
                  isActive ? "bg-blue-600" : "hover:bg-[#1f2937]"
                }`}
              >
                {/* LEFT */}

                <div className="flex items-center gap-3">
                  <Icon
                    size={20}
                    className={isActive ? "text-white" : "text-gray-400"}
                  />

                  <span
                    className={
                      isActive ? "text-white font-medium" : "text-gray-300"
                    }
                  >
                    {item.name}
                  </span>
                </div>

                {/* RIGHT */}

                <ChevronRight
                  size={16}
                  className={isActive ? "text-white" : "text-gray-500"}
                />
              </button>
            );
          })}
        </div>

        {/* FOOTER */}

        <div className="p-4 border-t border-gray-800">
          <div className="bg-[#1f2937] rounded-2xl p-3">
            <div className="flex items-center gap-3 mb-2">
              <Bell size={18} className="text-yellow-400" />

              <h3 className="font-semibold text-white">Alerts</h3>
            </div>

            <p className="text-xs text-gray-400">No active machine alerts</p>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ========================= */}

      <div
        className={`
          hidden md:flex
          h-screen
          bg-[#111827]
          text-white
          flex-col
          shadow-2xl
          border-r
          border-gray-800
          transition-all
          duration-300

          ${collapsed ? "w-24" : "w-72"}
        `}
      >
        {/* HEADER */}

        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {/* LOGO */}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <img src="/logo.svg" alt="Logo" className="w-6 h-6" />
              </div>

              {!collapsed && (
                <div>
                  <h1 className="text-[16px] font-bold tracking-wide">
                    Flexi Care Factory
                  </h1>

                  <p className="text-sm text-gray-400">Production Monitoring</p>
                </div>
              )}
            </div>

            {/* TOGGLE */}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-[#1f2937] p-2 rounded-xl transition-all"
            >
              {collapsed ? (
                <PanelLeftOpen size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </button>
          </div>
        </div>

        {/* STATUS */}

        {/* {!collapsed && (
          <div className="px-4 py-4 border-b border-gray-800">
            <div className="bg-[#1f2937] rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">System Status</span>

                <Wifi size={18} className="text-green-400" />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

                <span className="font-semibold text-sm text-green-400">
                  Online
                </span>
              </div>
            </div>
          </div>
        )} */}

        {/* MENU */}

        <div className="flex-1 px-3 py-5 overflow-y-auto">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 px-2">
              Navigation
            </p>
          )}

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive = activePage === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => setActivePage(item.name)}
                  className={`group w-full flex items-center ${
                    collapsed ? "justify-center" : "justify-between"
                  } px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-blue-600 shadow-lg shadow-blue-600/30"
                      : "hover:bg-[#1f2937]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className={`${isActive ? "text-white" : "text-gray-400"}`}
                    />

                    {!collapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </div>

                  {!collapsed && (
                    <ChevronRight size={16} className="text-gray-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ALERT */}

        {!collapsed && (
          <div className="px-3 pb-5">
            <div className="bg-[#1f2937] rounded-2xl p-3 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Bell size={18} className="text-yellow-400" />

                <h3 className="font-semibold">Alerts</h3>
              </div>

              <p className="text-xs text-gray-400">No active machine alerts</p>
            </div>
          </div>
        )}

        {/* FOOTER */}

        <div className="p-5 border-t border-gray-800">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Flexicare</p>

                <p className="text-xs text-gray-500">Industrial IoT System</p>
              </div>

              <div className="text-xs text-gray-500">v1.0</div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Menu size={20} className="text-gray-500" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
