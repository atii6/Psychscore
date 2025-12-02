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

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
  const user = useUserStore(React.useCallback((state) => state.user, []));
  return (
    <Layout>
      <Routes>
        {Object.values(ROUTES).map(
          ({ path, component: Component, protected: isProtected }) => {
            if (isProtected) {
              return (
                <Route
                  key={path}
                  path={path}
                  element={
                    user ? <Component /> : <Navigate to="/Login" replace />
                  }
                />
              );
            } else {
              return (
                <Route
                  key={path}
                  path={path}
                  element={
                    user ? <Navigate to="/Dashboard" replace /> : <Component />
                  }
                />
              );
            }
          }
        )}
        <Route
          path="*"
          element={<Navigate to={user ? "/Dashboard" : "/Login"} replace />}
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
