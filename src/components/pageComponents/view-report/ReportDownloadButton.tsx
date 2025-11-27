import { Button } from "@/components/ui/button";
import { GeneratedReport } from "@/utilitites/types/GeneratedReports";
import { Download } from "lucide-react";

type Props = { reportData: GeneratedReport };

function ReportDownloadButton({ reportData }: Props) {
  const handleDownload = () => {
    if (!reportData) return;

    const fontFamily = "Times New Roman";

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${reportData.report_title}</title>
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
    const sourceHTML = header + reportData.report_content + footer;

    const source =
      "data:application/vnd.ms-word;charset=utf-8," +
      encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${reportData.client_name} - Report.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
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
  );
}

export default ReportDownloadButton;
