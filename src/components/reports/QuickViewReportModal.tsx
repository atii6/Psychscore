import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { GeneratedReport } from "@/utilitites/types/GeneratedReports";

type QuickViewReportModalProps = {
  report: GeneratedReport | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function QuickViewReportModal({
  report,
  isOpen,
  onClose,
}: QuickViewReportModalProps) {
  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-white shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl font-bold text-gray-800">
            {report.report_title}
          </DialogTitle>
          <DialogDescription>
            Quick preview of the generated report. For full options, view the
            dedicated report page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: report.report_content }}
          />
        </div>
        <DialogFooter className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
