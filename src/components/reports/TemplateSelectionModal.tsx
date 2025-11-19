import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";

export default function TemplateSelectionModal({ isOpen, onClose, onSelect, selectionData }) {
  const [selectedValue, setSelectedValue] = React.useState(null);
  const templates = selectionData?.templates;

  React.useEffect(() => {
    // This effect now runs on every render, satisfying the Rules of Hooks.
    // The logic inside handles whether to set a value or not.
    if (isOpen && templates && templates.length > 0) {
      // Pre-select the first option when the modal opens or templates change
      setSelectedValue(templates[0].id);
    } else if (!isOpen) {
      // Reset when modal closes
      setSelectedValue(null);
    }
  }, [isOpen, templates]);

  if (!isOpen || !selectionData) {
    return null;
  }

  const { testName } = selectionData;

  const handleSelect = () => {
    const selectedTemplate = templates.find(t => t.id === selectedValue);
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Multiple Templates Found</DialogTitle>
          <DialogDescription>
            We found multiple templates that could match the test <span className="font-bold">"{testName}"</span>. Please select the one you'd like to use.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
            <div className="space-y-4">
              {templates.map((template) => (
                <Label 
                  key={template.id} 
                  htmlFor={template.id} 
                  className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500"
                >
                  <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-base mb-2">{template.template_name}</div>
                    <div className="flex items-center flex-wrap gap-2">
                      <Badge variant="secondary">{template.test_type}</Badge>
                      <Badge variant="outline" className="capitalize">{template.category}</Badge>
                      {template.is_system_template ? (
                        <Badge className="bg-gray-100 text-gray-600">System</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">My Template</Badge>
                      )}
                    </div>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSelect} disabled={!selectedValue}>
            Use Selected Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}