import React, { useState, useEffect } from "react";
// import { GeneratedReport, User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Loader2, FileWarning, Clock } from "lucide-react";
import { format } from "date-fns";

export default function ViewReportPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false); // New state for expired reports

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
      loadReport(id);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadReport = async (id) => {
    setIsLoading(true);
    const reportData = await GeneratedReport.filter({ id }, null, 1);

    if (reportData && reportData.length > 0) {
      const loadedReport = reportData[0];
      // Calculate 30 days ago from now
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Check if the report's created_date is older than 30 days ago
      if (new Date(loadedReport.created_date) < thirtyDaysAgo) {
        // Report is expired. Delete it and set expired state.
        await GeneratedReport.delete(loadedReport.id);
        setIsExpired(true);
      } else {
        setReport(loadedReport);
      }
    }

    setIsLoading(false);
  };

  const handleDownload = async () => {
    if (!report) return;

    // Get user preferences for font
    const currentUser = await User.me();
    const fontFamily = currentUser?.report_font_family || "Times New Roman";

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${report.report_title}</title>
        <style>
          @page {
            size: 8.5in 11in; /* US Letter */
            margin: 1in;
          }
          body { font-family: '${fontFamily}', Times, serif; font-size: 12pt; }
          .score-table { border-collapse: collapse; width: 100%; font-family: sans-serif; margin-bottom: 20px; }
          .score-table th, .score-table td { border: 1px solid #000; padding: 8px; text-align: left; }
          .score-table th { background-color: #f2f2f2; }
          .score-table-caption { caption-side: top; text-align: center; font-weight: bold; font-size: 1.2em; margin-bottom: 10px; color: #000 !important; }
        </style>
      </head>
      <body>
    `;

    const footer = "</body></html>";
    const sourceHTML = header + report.report_content + footer;

    const source =
      "data:application/vnd.ms-word;charset=utf-8," +
      encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${report.client_name} - Report.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: "var(--primary-blue)" }}
        />
      </div>
    );
  }

  // New conditional rendering for expired reports
  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <Clock className="w-16 h-16 text-orange-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Report Expired</h2>
        <p className="text-gray-600 mb-6">
          For security and data privacy, reports are automatically deleted after
          30 days.
        </p>
        <Button onClick={() => navigate(createPageUrl("Reports"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FileWarning className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
        <p className="text-gray-600 mb-6">
          The requested report could not be found.
        </p>
        <Button onClick={() => navigate(createPageUrl("Reports"))}>
          Back to Reports
        </Button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Reports"))}
              className="rounded-xl border-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {report.report_title}
              </h1>
              <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
                Generated on{" "}
                {format(new Date(report.created_date), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
          <Button
            onClick={handleDownload}
            className="px-6 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
            }}
          >
            <Download className="w-5 h-5 mr-2" />
            Download (.doc)
          </Button>
        </div>

        <Card
          className="border-0 shadow-lg rounded-2xl"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose max-w-none p-4 border rounded-lg bg-white"
              dangerouslySetInnerHTML={{ __html: report.report_content }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
