import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X } from "lucide-react";

export default function PreviewModal({ isOpen, onClose, content, templateName, placeholders }) {
  // Sample data for preview
  const sampleData = {
    "{{client_first_name}}": "John",
    "{{client_last_name}}": "Smith",
    "{{subjective_pronoun}}": "he",
    "{{objective_pronoun}}": "him",
    "{{possessive_pronoun}}": "his",
    "{{test_name}}": "WISC-V",
    "{{test_date}}": "March 15, 2024",
    "{{fsiq_score}}": "105",
    "{{fsiq_percentile}}": "63",
    "{{fsiq_descriptor}}": "Average",
    "{{vci_score}}": "110",
    "{{vci_percentile}}": "75",
    "{{vci_descriptor}}": "High Average",
    "{{pri_score}}": "95",
    "{{wmi_score}}": "100",
    "{{psi_score}}": "108"
  };

  const replaceContent = (text) => {
    let replacedText = text;
    Object.entries(sampleData).forEach(([placeholder, value]) => {
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      replacedText = replacedText.replace(regex, `<span class="bg-yellow-200 px-1 rounded font-semibold">${value}</span>`);
    });
    return replacedText;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview: {templateName}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Preview Note:</strong> This shows how your template will look with sample data. 
              Highlighted values show where placeholders will be replaced with actual assessment data.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: replaceContent(content || "No content yet. Start writing your template!")
              }}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Active Placeholders:</h4>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((p, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {p.placeholder}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}