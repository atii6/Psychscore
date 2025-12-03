import UploadPage from "@/pages/Upload";
import ReportsPage from "@/pages/Reports";
import TemplatesPage from "@/pages/Templates";
import ScoreDescriptorsPage from "@/pages/ScoreReference";
import TemplateEditor from "@/pages/TemplateEditor";
import MyDescriptorsPage from "@/pages/MyDescriptors";
import GenerateReportPage from "@/pages/GenerateReport";
import ViewReportPage from "@/pages/ViewReport";
import ManualEntryPage from "@/pages/ManualEntry";
import TestBankPage from "@/pages/TestBank";
import BulkUpdateTestBankPage from "@/pages/BulkUpdateTestBank";
import ManageTestBankVisibility from "@/pages/ManageTestBankVisibility";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";

export const ROUTES = {
  Dashboard: { component: Dashboard, path: "/dashboard", protected: true },
  Upload: { component: UploadPage, path: "/upload", protected: true },
  Reports: { component: ReportsPage, path: "/reports", protected: true },
  Templates: { component: TemplatesPage, path: "/templates", protected: true },
  ScoreReference: {
    component: ScoreDescriptorsPage,
    path: "/score-reference",
    protected: true,
  },
  TemplateEditor: {
    component: TemplateEditor,
    path: "/template-editor",
    protected: true,
  },
  MyDescriptors: {
    component: MyDescriptorsPage,
    path: "/my-descriptors",
    protected: true,
  },
  GenerateReport: {
    component: GenerateReportPage,
    path: "/generate-report",
    protected: true,
  },
  ViewReport: {
    component: ViewReportPage,
    path: "/view-report",
    protected: true,
  },
  ManualEntry: {
    component: ManualEntryPage,
    path: "/manual-entry",
    protected: true,
  },
  TestBank: { component: TestBankPage, path: "/test-bank", protected: true },
  BulkUpdateTestBank: {
    component: BulkUpdateTestBankPage,
    path: "/bulk-update-test-bank",
    protected: true,
  },
  ManageTestBankVisibility: {
    component: ManageTestBankVisibility,
    path: "/manage-test-bank-visibility",
    protected: true,
  },

  Login: { component: LoginPage, path: "/login", protected: false },
  Signup: { component: SignupPage, path: "/signup", protected: false },
};
