import React from "react";
import Sidebar from "./Sidebar";
import NavigationMenu from "./NavigationMenu";
import SidebarFooter from "./SidebarFooter";
import AccountSettingsModal from "../account/AccountSettingsModal";

type Props = { children: React.ReactNode };

function PostAuthLayout({ children }: Props) {
  const [showAccountSettings, setShowAccountSettings] = React.useState(false);
  return (
    <>
      <div
        className="min-h-screen flex w-full"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Sidebar + Navigation */}

        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <Sidebar />
          <NavigationMenu />
          <SidebarFooter setShowAccountSettings={setShowAccountSettings} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      <AccountSettingsModal
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
    </>
  );
}

export default PostAuthLayout;
