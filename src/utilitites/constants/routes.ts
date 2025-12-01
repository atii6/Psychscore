import Dashboard from "@/pages/Dashboard";
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
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";

export const ROUTES = {
  Dashboard: { component: Dashboard, path: "/Dashboard", protected: true },
  Upload: { component: UploadPage, path: "/Upload", protected: true },
  Reports: { component: ReportsPage, path: "/Reports", protected: true },
  Templates: { component: TemplatesPage, path: "/Templates", protected: true },
  ScoreReference: {
    component: ScoreDescriptorsPage,
    path: "/ScoreReference",
    protected: true,
  },
  TemplateEditor: {
    component: TemplateEditor,
    path: "/TemplateEditor",
    protected: true,
  },
  MyDescriptors: {
    component: MyDescriptorsPage,
    path: "/MyDescriptors",
    protected: true,
  },
  GenerateReport: {
    component: GenerateReportPage,
    path: "/GenerateReport",
    protected: true,
  },
  ViewReport: {
    component: ViewReportPage,
    path: "/ViewReport",
    protected: true,
  },
  ManualEntry: {
    component: ManualEntryPage,
    path: "/ManualEntry",
    protected: true,
  },
  TestBank: { component: TestBankPage, path: "/TestBank", protected: true },
  BulkUpdateTestBank: {
    component: BulkUpdateTestBankPage,
    path: "/BulkUpdateTestBank",
    protected: true,
  },
  ManageTestBankVisibility: {
    component: ManageTestBankVisibility,
    path: "/ManageTestBankVisibility",
    protected: true,
  },

  Login: { component: LoginPage, path: "/Login", protected: false },
  Signup: { component: SignupPage, path: "/Signup", protected: false },
};
