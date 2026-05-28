import { ShieldCheck, Factory, Activity } from "lucide-react";

import SupervisorForm from "../components/supervisor/SupervisorForm";

// ===============================================
// SUPERVISOR PAGE
// ===============================================

export default function Supervisor() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
      {/* ===================================== */}
      {/* PAGE HEADER */}
      {/* ===================================== */}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-5 md:p-7 mb-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          {/* LEFT SIDE */}

          <div className="flex items-start gap-4">
            {/* ICON */}

            <div className="bg-blue-100 p-4 rounded-2xl shrink-0">
              <Factory className="text-blue-600" size={30} />
            </div>

            {/* TEXT */}

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
                  Supervisor Panel
                </h1>

                <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Factory Control
                </div>
              </div>

              <p className="text-gray-500 mt-3 text-sm md:text-base leading-relaxed max-w-3xl">
                Manage production lines, machine assignments, product targets,
                supervisor operations, maintenance coordination, and real-time
                factory floor activities from a centralized control panel.
              </p>
            </div>
          </div>

          {/* RIGHT STATUS */}

          <div className="flex flex-col sm:flex-row gap-4">
            {/* SYSTEM STATUS */}

            <div className="bg-green-100 border border-green-200 text-green-700 px-5 py-4 rounded-2xl flex items-center gap-3 min-w-55">
              <div className="bg-green-200 p-2 rounded-xl">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide">
                  System Status
                </p>

                <p className="font-bold text-sm md:text-base">
                  Production Active
                </p>
              </div>
            </div>

            {/* LIVE STATUS */}

            <div className="bg-blue-100 border border-blue-200 text-blue-700 px-5 py-4 rounded-2xl flex items-center gap-3 min-w-55">
              <div className="bg-blue-200 p-2 rounded-xl">
                <Activity size={22} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide">
                  Monitoring
                </p>

                <p className="font-bold text-sm md:text-base">
                  Real-time Tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================== */}
      {/* SUPERVISOR FORM */}
      {/* ===================================== */}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-4 md:p-6">
        <SupervisorForm />
      </div>
    </div>
  );
}
