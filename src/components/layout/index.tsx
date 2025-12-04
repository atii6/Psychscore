import React from "react";
import PreAuthLayout from "./PreAuthLayout";
import PostAuthLayout from "./PostAuthLayout";
import useUserStore from "@/store/userStore";
import { useLocation } from "react-router-dom";

type LayoutProps = {
  children: React.ReactNode;
};

const PUBLIC_ROUTES = ["/login", "/signup"];

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const user = useUserStore(React.useCallback((state) => state.user, []));
  const isLoading = useUserStore(
    React.useCallback((state) => state.loading, [])
  );
  const initializeUser = useUserStore(
    React.useCallback((state) => state.initializeUser, [])
  );
  const isUserInitialized = useUserStore(
    React.useCallback((state) => state.initialized, [])
  );
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname?.startsWith(route)
  );

  React.useEffect(() => {
    if (!isUserInitialized && !isPublicRoute) {
      initializeUser();
    }
  }, [initializeUser]);

  if (isLoading)
    return (
      <div className="w-full h-screen flex justify-center items-center bg-transparent">
        <div className="w-56 h-24 animate-fadeInOut">
          <img
            src="/psychscore_logo.png"
            alt="Logo"
            className="w-full h-full object-contain animate-fadeInOut"
          />
        </div>
      </div>
    );

  if (!user) {
    return <PreAuthLayout>{children}</PreAuthLayout>;
  }

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

      <PostAuthLayout>{children}</PostAuthLayout>
    </>
  );
}
