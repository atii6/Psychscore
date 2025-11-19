import BulkUpdateTestBankPage from "@/pages/BulkUpdateTestBank";
import Dashboard from "@/pages/Dashboard";
import GenerateReportPage from "@/pages/GenerateReport";
import ManageTestBankVisibility from "@/pages/ManageTestBankVisibility";
import ManualEntryPage from "@/pages/ManualEntry";
import MyDescriptorsPage from "@/pages/MyDescriptors";
import ReportsPage from "@/pages/Reports";
import ScoreDescriptorsPage from "@/pages/ScoreReference";
import TemplateEditor from "@/pages/TemplateEditor";
import TemplatesPage from "@/pages/Templates";
import TestBankPage from "@/pages/TestBank";
import UploadPage from "@/pages/Upload";
import ViewReportPage from "@/pages/ViewReport";

const ROUTES = {
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

export default ROUTES;
