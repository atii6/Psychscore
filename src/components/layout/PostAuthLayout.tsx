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
        className="h-screen flex w-full overflow-hidden"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <Sidebar />
          <NavigationMenu />
          <SidebarFooter setShowAccountSettings={setShowAccountSettings} />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      <AccountSettingsModal
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
    </>
  );
}

export default PostAuthLayout;
