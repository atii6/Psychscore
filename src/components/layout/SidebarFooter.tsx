import { Settings } from "lucide-react";

type SidebarFooterProps = {
  setShowAccountSettings: React.Dispatch<React.SetStateAction<boolean>>;
};

function SidebarFooter({ setShowAccountSettings }: SidebarFooterProps) {
  return (
    <div className="border-t border-gray-200 p-4">
      <div
        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
        onClick={() => setShowAccountSettings(true)}
      >
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-medium text-sm">Dr</span>
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-medium text-sm truncate"
            style={{ color: "var(--text-primary)" }}
          >
            Psychologist
          </p>
          <p
            className="text-xs truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            Assessment Platform
          </p>
        </div>
        <Settings
          className="w-4 h-4"
          style={{ color: "var(--text-secondary)" }}
        />
      </div>
    </div>
  );
}

export default SidebarFooter;
