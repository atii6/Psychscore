import { Brain } from "lucide-react";

function Sidebar() {
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
          }}
        >
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2
            className="font-bold text-lg"
            style={{ color: "var(--text-primary)" }}
          >
            PsychScore Pro
          </h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Assessment Scoring Platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
