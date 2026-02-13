import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Layout from "@/components/layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CACHE_AND_STALE_TIME } from "@/utilitites/constants/queryConstants";
import { Toaster } from "sonner";
import { ROUTES } from "@/utilitites/constants/routes";
import useUserStore from "@/store/userStore";

function PagesContent() {
  const { user, loading, initializeUser, initialized } = useUserStore(
    React.useCallback((state) => state, []),
  );

  React.useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  if (!initialized || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-56 h-24 animate-fadeInOut">
            <img
              src="/psychscore_logo.png"
              alt="Logo"
              className="w-full h-full object-contain animate-fadeInOut"
            />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        {Object.values(ROUTES).map(
          ({ path, component: Component, protected: isProtected }) => {
            // Special handling for login route
            if (path === "/login") {
              return (
                <Route
                  key={path}
                  path={path}
                  element={
                    user ? <Navigate to="/dashboard" replace /> : <Component />
                  }
                />
              );
            }

            return (
              <Route
                key={path}
                path={path}
                element={
                  isProtected ? (
                    user ? (
                      <Component />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  ) : (
                    <Component />
                  )
                }
              />
            );
          },
        )}

        {/* Fallback Route */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </Layout>
  );
}

export default function Pages() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        ...CACHE_AND_STALE_TIME,
      },
    },
  });

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <PagesContent />
        <Toaster richColors />
      </QueryClientProvider>
    </Router>
  );
}
