import React, { useState, useEffect } from "react";
// import { Assessment } from "@/api/entities";
// import { ReportTemplate } from "@/api/entities";
// import { GeneratedReport } from "@/api/entities"; // Added import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FileText,
  Upload,
  TrendingUp,
  Brain,
  Clock,
  CheckCircle2,
  Plus,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";

import StatsCard from "../components/dashboard/StatsCard";
import RecentAssessments from "../components/dashboard/RecentAssessments";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [assessments, setAssessments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [reports, setReports] = useState([]); // Added state for reports
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    // Updated Promise.all to include GeneratedReport.list()
    const [assessmentData, templateData, reportData] = await Promise.all([
      Assessment.list("-created_date", 20),
      ReportTemplate.list(),
      GeneratedReport.list(), // Fetch generated reports
    ]);
    setAssessments(assessmentData);
    setTemplates(templateData);
    setReports(reportData); // Set reports data
    setIsLoading(false);
  };

  const handleGenerateReport = async (assessment) => {
    console.log("Dashboard: Generate report for assessment:", assessment.id);
    // Navigate to Reports page to handle the generation
    window.location.href = createPageUrl(`Reports?generate=${assessment.id}`);
  };

  // Calculate monthly stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const assessmentsThisMonth = assessments.filter(
    (a) => new Date(a.created_date) >= startOfMonth
  ).length;
  const reportsThisMonth = reports.filter(
    (r) => new Date(r.created_date) >= startOfMonth
  ).length;
  const processingThisMonth = assessments.filter(
    (a) => a.status === "processed" && new Date(a.created_date) >= startOfMonth
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
            title="Assessments This Month" // Updated title
            value={assessmentsThisMonth} // Updated value
            icon={FileText}
            color="blue"
            trend="Current month" // Updated trend
          />
          <StatsCard
            title="Reports This Month" // Updated title
            value={reportsThisMonth} // Updated value
            icon={CheckCircle2}
            color="green"
            trend="Current month" // Updated trend
          />
          <StatsCard
            title="Processing This Month" // Updated title
            value={processingThisMonth} // Updated value
            icon={Clock}
            color="orange"
            trend="Ready for reports"
          />
          <StatsCard
            title="Templates"
            value={templates.length}
            icon={Brain}
            color="purple"
            trend="Available for use"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Assessments */}
          <div className="lg:col-span-2">
            <RecentAssessments
              assessments={assessments}
              isLoading={isLoading}
              onAssessmentUpdate={loadData}
              onGenerateReport={handleGenerateReport}
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
