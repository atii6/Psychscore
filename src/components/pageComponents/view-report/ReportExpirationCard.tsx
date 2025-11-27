import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ReportExpirationCard() {
  const navigate = useNavigate();
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

export default ReportExpirationCard;
