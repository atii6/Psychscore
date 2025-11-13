import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Dashboard from "./Dashboard";
import UploadPage from "./Upload";
import ReportsPage from "./Reports";
import TemplatesPage from "./Templates";
import TemplateEditor from "./TemplateEditor";
import MyDescriptorsPage from "./MyDescriptors";
import GenerateReportPage from "./GenerateReport";
import ViewReportPage from "./ViewReport";
import ManualEntryPage from "./ManualEntry";
import TestBankPage from "./TestBank";
import BulkUpdateTestBankPage from "./BulkUpdateTestBank";
import ManageTestBankVisibility from "./ManageTestBankVisibility";
import ScoreDescriptorsPage from "./ScoreReference";
import Layout from "@/components/layout";

const PAGES = {
  Dashboard: Dashboard,
  Upload: UploadPage,
  Reports: ReportsPage,
  Templates: TemplatesPage,
  ScoreReference: ScoreDescriptorsPage,
  TemplateEditor: TemplateEditor,
  MyDescriptors: MyDescriptorsPage,
  GenerateReport: GenerateReportPage,
  ViewReport: ViewReportPage,
  ManualEntry: ManualEntryPage,
  TestBank: TestBankPage,
  BulkUpdateTestBank: BulkUpdateTestBankPage,
  ManageTestBankVisibility: ManageTestBankVisibility,
};

function _getCurrentPage(url) {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) {
    urlLastPart = urlLastPart.split("?")[0];
  }

  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );
  return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/Dashboard" element={<Dashboard />} />

        <Route path="/Upload" element={<PAGES.Upload />} />

        <Route path="/Reports" element={<PAGES.Reports />} />

        <Route path="/Templates" element={<PAGES.Templates />} />

        <Route path="/ScoreReference" element={<PAGES.ScoreReference />} />

        <Route path="/TemplateEditor" element={<PAGES.TemplateEditor />} />

        <Route path="/MyDescriptors" element={<PAGES.MyDescriptors />} />

        <Route path="/GenerateReport" element={<PAGES.GenerateReport />} />

        <Route path="/ViewReport" element={<PAGES.ViewReport />} />

        <Route path="/ManualEntry" element={<PAGES.ManualEntry />} />

        <Route path="/TestBank" element={<PAGES.TestBank />} />

        <Route
          path="/BulkUpdateTestBank"
          element={<PAGES.BulkUpdateTestBank />}
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
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
