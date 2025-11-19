import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Dashboard from "./Dashboard";
import ManageTestBankVisibility from "./ManageTestBankVisibility";
import Layout from "@/components/layout";
import ROUTES from "@/utilitites/constants/routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CACHE_AND_STALE_TIME } from "@/utilitites/constants/queryConstants";
import { Toaster } from "sonner";

function _getCurrentPage(url: string) {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split("/").pop();
  if (urlLastPart?.includes("?")) {
    urlLastPart = urlLastPart.split("?")[0];
  }

  const pageName = Object.keys(ROUTES).find(
    (page) => page.toLowerCase() === urlLastPart?.toLowerCase()
  );
  return pageName || Object.keys(ROUTES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/Dashboard" element={<Dashboard />} />

        <Route path="/Upload" element={<ROUTES.Upload />} />

        <Route path="/Reports" element={<ROUTES.Reports />} />

        <Route path="/Templates" element={<ROUTES.Templates />} />

        <Route path="/ScoreReference" element={<ROUTES.ScoreReference />} />

        <Route path="/TemplateEditor" element={<ROUTES.TemplateEditor />} />

        <Route path="/MyDescriptors" element={<ROUTES.MyDescriptors />} />

        <Route path="/GenerateReport" element={<ROUTES.GenerateReport />} />

        <Route path="/ViewReport" element={<ROUTES.ViewReport />} />

        <Route path="/ManualEntry" element={<ROUTES.ManualEntry />} />

        <Route path="/TestBank" element={<ROUTES.TestBank />} />

        <Route
          path="/BulkUpdateTestBank"
          element={<ROUTES.BulkUpdateTestBank />}
        />

        <Route
          path="/ManageTestBankVisibility"
          element={<ManageTestBankVisibility />}
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
