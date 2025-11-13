import React from "react";
import AccountSettingsModal from "@/components/account/AccountSettingsModal";
import Sidebar from "./Sidebar";
import NavigationMenu from "./NavigationMenu";
import SidebarFooter from "./SidebarFooter";

export default function Layout({ children, currentPageName }) {
  const [showAccountSettings, setShowAccountSettings] = React.useState(false);

  return (
    <>
      <style>{`
        :root {
          --primary-blue: #1e40af;
          --secondary-blue: #3b82f6;
          --light-blue: #dbeafe;
          --accent-blue: #60a5fa;
          --text-primary: #1f2937;
          --text-secondary: #6b7280;
          --background: #f8fafc;
          --card-background: #ffffff;
        }
      `}</style>
      <div
        className="min-h-screen flex w-full"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Always Visible Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <Sidebar />

          {/* Navigation Menu */}
          <NavigationMenu />

          {/* Sidebar Footer */}
          <SidebarFooter setShowAccountSettings={setShowAccountSettings} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
    </>
  );
}
