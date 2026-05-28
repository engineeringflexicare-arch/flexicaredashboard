import { useState } from "react";

import {
  Settings2,
  Bell,
  RefreshCcw,
  Factory,
  Save,
  RotateCcw,
} from "lucide-react";

import { FLOORS } from "../constants/floors";

// ===============================================
// TYPES
// ===============================================

type AppSettings = {
  defaultFloor: string;

  refreshInterval: number;

  enableNotifications: boolean;
};

// ===============================================
// STORAGE
// ===============================================

const STORAGE_KEY = "appSettings";

// ===============================================
// DEFAULT SETTINGS
// ===============================================

const DEFAULTS: AppSettings = {
  defaultFloor: FLOORS[0] || "Manufacturing_Floor",

  refreshInterval: 30,

  enableNotifications: false,
};

// ===============================================
// SETTINGS PAGE
// ===============================================

export default function Settings() {
  // ===========================================
  // STATES
  // ===========================================

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return DEFAULTS;
      }

      return JSON.parse(raw) as AppSettings;
    } catch (error) {
      console.error("Failed loading settings", error);

      return DEFAULTS;
    }
  });

  const [saved, setSaved] = useState(false);

  // ===========================================
  // UPDATE SETTINGS
  // ===========================================

  const update = (patch: Partial<AppSettings>) => {
    setSettings((current) => ({
      ...current,

      ...patch,
    }));

    setSaved(false);
  };

  // ===========================================
  // SAVE SETTINGS
  // ===========================================

  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,

        JSON.stringify(settings),
      );

      setSaved(true);

      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed saving settings", error);
    }
  };

  // ===========================================
  // RESET SETTINGS
  // ===========================================

  const handleReset = () => {
    setSettings(DEFAULTS);

    localStorage.removeItem(STORAGE_KEY);

    setSaved(true);

    setTimeout(() => setSaved(false), 1500);
  };

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Settings2 className="text-blue-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>

                <p className="text-gray-500 mt-2">
                  Manage dashboard preferences and system behavior.
                </p>
              </div>
            </div>

            {saved && (
              <div className="bg-green-100 border border-green-200 text-green-700 px-5 py-3 rounded-2xl text-sm font-medium">
                Settings Saved Successfully
              </div>
            )}
          </div>
        </div>

        {/* SETTINGS PANEL */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="space-y-8">
            {/* DEFAULT FLOOR */}

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Factory className="text-blue-600" size={18} />

                <label className="text-sm font-semibold text-gray-700">
                  Default Floor
                </label>
              </div>

              <select
                className="w-full border border-gray-300 rounded-2xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.defaultFloor}
                onChange={(e) =>
                  update({
                    defaultFloor: e.target.value,
                  })
                }
              >
                {FLOORS.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* REFRESH INTERVAL */}

            <div>
              <div className="flex items-center gap-3 mb-3">
                <RefreshCcw className="text-orange-600" size={18} />

                <label className="text-sm font-semibold text-gray-700">
                  Auto Refresh Interval
                </label>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={5}
                  max={300}
                  className="w-40 border border-gray-300 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={settings.refreshInterval}
                  onChange={(e) =>
                    update({
                      refreshInterval: Math.max(
                        5,

                        Number(e.target.value) || 5,
                      ),
                    })
                  }
                />

                <span className="text-sm text-gray-500">seconds</span>
              </div>
            </div>

            {/* NOTIFICATIONS */}

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Bell className="text-green-600" size={18} />

                <label className="text-sm font-semibold text-gray-700">
                  Notifications
                </label>
              </div>

              <label className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) =>
                    update({
                      enableNotifications: e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />

                <span className="text-gray-700">
                  Enable maintenance and emergency alerts
                </span>
              </label>
            </div>

            {/* ACTION BUTTONS */}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition"
              >
                <Save size={18} />
                Save Settings
              </button>

              <button
                onClick={handleReset}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl flex items-center gap-2 transition"
              >
                <RotateCcw size={18} />
                Reset Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
