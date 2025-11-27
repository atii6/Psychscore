import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { FileWarning } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ReportNotFoundCard() {
  const navigate = useNavigate();
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

export default ReportNotFoundCard;
