import React from "react";
import PreAuthLayout from "./PreAuthLayout";
import PostAuthLayout from "./PostAuthLayout";
import useUserStore from "@/store/userStore";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const user = useUserStore(React.useCallback((state) => state.user, []));
  const isLoading = useUserStore(
    React.useCallback((state) => state.loading, [])
  );
  const initializeUser = useUserStore(
    React.useCallback((state) => state.initializeUser, [])
  );

  React.useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  if (isLoading) return <div>Loading...</div>;

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
