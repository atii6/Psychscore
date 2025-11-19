import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, Brain, Clock, CheckCircle2, Plus } from "lucide-react";

import useGetAllAssessments from "@/hooks/assessments/useGetAllAssessments";
import useGetAllGeneratedReports from "@/hooks/generated-reports/useGetAllGeneratedReports";
import { AssessmentType } from "@/utilitites/types/Assessment";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentAssessments from "@/components/dashboard/RecentAssessments";
import QuickActions from "@/components/dashboard/QuickActions";

export default function Dashboard() {
  const { data: Assessment, isLoading: isLoadingAssessments } =
    useGetAllAssessments();
  const { data: GeneratedReports, isLoading: isLoadingGeneratedReports } =
    useGetAllGeneratedReports();

  const isLoading = isLoadingGeneratedReports || isLoadingAssessments;

  const handleGenerateReport = async (assessment: AssessmentType) => {
    // Navigate to Reports page to handle the generation
    window.location.href = createPageUrl(`Reports?generate=${assessment.id}`);
  };

  // Calculate monthly stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const assessmentsThisMonth = Assessment?.filter(
    (a) => new Date(a.created_date || "") >= startOfMonth
  ).length;
  const reportsThisMonth = GeneratedReports?.filter(
    (r) => new Date(r.created_date || "") >= startOfMonth
  ).length;
  const processingThisMonth = Assessment?.filter(
    (a) =>
      a.status === "processed" && new Date(a.created_date || "") >= startOfMonth
  ).length;

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Assessment Dashboard
            </h1>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              Manage psychological assessments and generate reports
            </p>
          </div>
          <Link to={createPageUrl("Upload")}>
            <Button
              className="flex items-center gap-2 px-6 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
              }}
            >
              <Plus className="w-5 h-5" />
              New Assessment
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Assessments This Month"
            value={assessmentsThisMonth || 0}
            icon={FileText}
            color="blue"
            trend="Current month"
          />
          <StatsCard
            title="Reports This Month"
            value={reportsThisMonth || 0}
            icon={CheckCircle2}
            color="green"
            trend="Current month"
          />
          <StatsCard
            title="Processing This Month"
            value={processingThisMonth || 0}
            icon={Clock}
            color="orange"
            trend="Ready for reports"
          />
          <StatsCard
            title="Templates"
            value={Assessment?.length || 0}
            icon={Brain}
            color="purple"
            trend="Available for use"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Assessments */}
          <div className="lg:col-span-2">
            <RecentAssessments
              assessments={Assessment || []}
              isLoading={isLoading}
              onGenerateReport={handleGenerateReport}
              generatedReports={GeneratedReports || []}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
