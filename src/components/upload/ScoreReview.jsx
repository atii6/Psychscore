
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Edit, Save, X, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ALL DESCRIPTOR HELPER FUNCTIONS (getDescriptorFromPercentile, getDescriptorAndPercentile, getScaledScoreDescriptor) HAVE BEEN MOVED TO Upload.js
// THIS COMPONENT WILL NOW ONLY RENDER THE PRE-PROCESSED DATA.

export default function ScoreReview({ 
  extractedData, 
  clientName, 
  onUpdateScores, 
  allScores, 
  allowDelete = false, 
  isSaving,
  selectedScores, 
  onToggleScoreSelection, 
  onToggleAllScores,
  onDeleteSelectedScores 
}) {
  const [scores, setScores] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);

  useEffect(() => {
    if (extractedData?.scores) {
      // The scores are now pre-processed in Upload.js, so we just set them directly.
      setScores(extractedData.scores);
    }
  }, [extractedData]);

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleSave = (index) => {
    const updatedScore = scores[index];
    
    // We remove the auto-recalculation logic here, as descriptor assignment is now handled upstream.
    // The user can still manually edit, and that change will be saved.
    
    setEditingIndex(-1);
    
    // Update parent component with changes if callback provided
    if (onUpdateScores && allScores) {
      const updatedAllScores = [...allScores];
      const scoreIndex = updatedAllScores.findIndex(s => 
        s.test_name === extractedData.test_name && 
        s.subtest_name === updatedScore.subtest_name
      );
      if (scoreIndex !== -1) {
        updatedAllScores[scoreIndex] = updatedScore;
        onUpdateScores(updatedAllScores);
      } else {
        // Fallback for cases where an existing score might not be found by subtest_name (e.g., if subtest_name itself was edited)
        // In a more robust system, each score would have a unique ID.
        // For now, if not found, we assume it might be a new score or an edge case.
        // A simple re-map is safer than pushing a duplicate if identification logic is complex.
        const updatedAllScoresAfterEdit = updatedAllScores.map(s => 
          (s.test_name === extractedData.test_name && s.subtest_name === scores[index].subtest_name) 
          ? updatedScore 
          : s
        );
        onUpdateScores(updatedAllScoresAfterEdit);
      }
    }
  };

  const handleDelete = (index) => {
    const scoreToDelete = scores[index];
    const scoreKey = `${extractedData.test_name}__${scoreToDelete.subtest_name}`;
    onDeleteSelectedScores([scoreKey]); // Use the new prop for deletion
  };

  const handleScoreChange = (index, field, value) => {
    setScores(prev => prev.map((score, i) => 
      i === index ? { 
        ...score, 
        [field]: field.includes('score') ? parseFloat(value) || 0 : value 
      } : score
    ));
  };

  const handleDescriptorChange = (index, value) => {
    setScores(prev => prev.map((score, i) => 
      i === index ? { 
        ...score, 
        descriptor: value,
        manual_descriptor_override: true // Mark as manually overridden
      } : score
    ));
  };

  const getDescriptorColor = (descriptor) => {
    if (!descriptor) return "bg-gray-100 text-gray-800 border-gray-200";
    const lowerCaseDescriptor = descriptor.toLowerCase().trim();

    switch (lowerCaseDescriptor) {
      case "extremely high": return "bg-purple-100 text-purple-800 border-purple-200";
      case "very high": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "above average": return "bg-green-100 text-green-800 border-green-200";
      case "average": return "bg-blue-100 text-blue-800 border-blue-200";
      case "below average": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "very low": return "bg-orange-100 text-orange-800 border-orange-200";
      case "extremely low": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const allInThisTableSelected = scores.every(score => selectedScores.has(`${extractedData.test_name}__${score.subtest_name}`));
  const someInThisTableSelected = scores.some(score => selectedScores.has(`${extractedData.test_name}__${score.subtest_name}`));
  const selectedScoresForThisTestCount = scores.filter(score => selectedScores.has(`${extractedData.test_name}__${score.subtest_name}`)).length; 

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Subtest/Index</TableHead>
            <TableHead className="font-semibold">Score</TableHead>
            <TableHead className="font-semibold">Percentile</TableHead>
            <TableHead className="font-semibold">Descriptor</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scores.map((score, index) => {
            const scoreKey = `${extractedData.test_name}__${score.subtest_name}`;
            const isSelected = selectedScores.has(scoreKey);
            
            return (
            <TableRow key={index} className="hover:bg-gray-50" data-state={isSelected ? "selected" : ""}>
              <TableCell className="font-medium">
                {editingIndex === index ? (
                  <Input
                    value={score.subtest_name || ""}
                    onChange={(e) => handleScoreChange(index, 'subtest_name', e.target.value)}
                    className="h-8"
                  />
                ) : (
                  score.subtest_name
                )}
              </TableCell>
              <TableCell>
                {editingIndex === index ? (
                  <Input
                    type="number"
                    value={score.scaled_score || score.composite_score || ""}
                    onChange={(e) => handleScoreChange(index, score.scaled_score ? 'scaled_score' : 'composite_score', e.target.value)}
                    className="h-8 w-20"
                  />
                ) : (
                  <div>
                    <span className="font-semibold">
                      {score.scaled_score || score.composite_score}
                    </span>
                    {score.scaled_score && (
                      <span className="text-xs text-gray-500 ml-1">(SS)</span>
                    )}
                    {score.composite_score && (
                      <span className="text-xs text-gray-500 ml-1">(Std)</span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>
                  <span className="text-sm font-medium">{score.percentile_rank}%</span>
                  {score.percentile_range && (
                    <span className="text-xs text-gray-500 block">{score.percentile_range}%ile</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {editingIndex === index ? (
                  <Input
                    value={score.descriptor || ""}
                    onChange={(e) => handleDescriptorChange(index, e.target.value)}
                    className="h-8 w-32"
                    placeholder="Custom descriptor"
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant="outline" 
                      className={`font-medium ${getDescriptorColor(score.descriptor)} border text-xs`}
                    >
                      {score.descriptor}
                    </Badge>
                    {score.manual_descriptor_override && (
                      <span className="text-xs text-blue-600 font-medium">*</span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleScoreSelection(scoreKey)}
                    aria-label={`Select row for ${score.subtest_name}`}
                  />
                  {editingIndex === index ? (
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSave(index)}
                        className="w-7 h-7"
                      >
                        <Save className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingIndex(-1)}
                        className="w-7 h-7"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(index)}
                        className="w-7 h-7"
                        disabled={selectedScores.size > 0} 
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {allowDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-7 h-7 text-red-600 hover:bg-red-50"
                              disabled={selectedScores.size > 0} 
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent style={{backgroundColor: 'var(--card-background)'}}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Score Entry?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{score.subtest_name}"? This will remove it from the final assessment.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(index)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Score
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
      
      {/* Table Footer with bulk actions */}
      {allowDelete && selectedScoresForThisTestCount > 0 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allInThisTableSelected ? true : (someInThisTableSelected ? 'indeterminate' : false)}
                onCheckedChange={(checked) => onToggleAllScores(checked, extractedData.test_name, scores)}
                aria-label="Select all rows for this test"
              />
              <span className="text-sm text-gray-600">
                {selectedScoresForThisTestCount === scores.length ? 'All selected' : `${selectedScoresForThisTestCount} selected`}
              </span>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => {
                const scoreKeysToDelete = scores
                  .filter(score => selectedScores.has(`${extractedData.test_name}__${score.subtest_name}`))
                  .map(score => `${extractedData.test_name}__${score.subtest_name}`);
                
                onDeleteSelectedScores(scoreKeysToDelete); 
              }}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedScoresForThisTestCount})
            </Button>
          </div>
        </div>
      )}
      
      {scores.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No scores available for this test.
        </div>
      )}
      
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600">
        * indicates manually edited descriptor
      </div>
    </div>
  );
}
