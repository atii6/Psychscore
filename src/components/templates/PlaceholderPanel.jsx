
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Copy, Search, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as lodash from 'lodash';

export default function PlaceholderPanel({ testType, placeholders = [], onInsertPlaceholder, onCreateCustomPlaceholder, readOnly = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    testBank: true,
    custom: true,
    conditional: true // Added conditional section to state
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filter and group placeholders
  const filteredPlaceholders = placeholders.filter(p =>
    p.placeholder.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const basicPlaceholders = filteredPlaceholders.filter(p =>
    p.data_source !== "scores" && !p.testBank && !p.custom
  );

  const testBankPlaceholders = filteredPlaceholders.filter(p => p.testBank);

  const customPlaceholders = filteredPlaceholders.filter(p => p.custom);

  // Group Test Bank placeholders by subtest
  const groupedTestBankPlaceholders = lodash.groupBy(testBankPlaceholders, (placeholder) => {
    const match = placeholder.placeholder.match(/{{(.+)_(score|percentile|descriptor)}}/)
    return match ? match[1] : 'other';
  });

  const handleInsertPlaceholder = (placeholder) => {
    if (readOnly) return;
    onInsertPlaceholder(placeholder);
  };

  const handleInsertConditional = (exampleText) => {
    if (readOnly) return;
    onInsertPlaceholder(exampleText);
  };

  return (
    <Card className="border-0 shadow-lg rounded-2xl sticky top-4" style={{backgroundColor: 'var(--card-background)'}}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{color: 'var(--text-primary)'}}>
          <Copy className="w-5 h-5" style={{color: 'var(--secondary-blue)'}} />
          Available Placeholders
          {readOnly && (
            <Badge className="ml-auto bg-gray-100 text-gray-600">View Only</Badge>
          )}
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search placeholders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {/* Conditional Logic Section */}
        <div>
          <button
            onClick={() => toggleSection('conditional')}
            className="flex items-center gap-2 text-sm font-semibold mb-2 hover:text-blue-600 transition-colors"
            style={{color: 'var(--text-primary)'}}
          >
            {expandedSections.conditional ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Conditional Logic
            <Popover>
              <PopoverTrigger asChild>
                <button className="ml-auto" onClick={(e) => e.stopPropagation()}>
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-semibold">Conditional Placeholders</h4>
                  <p className="text-sm text-gray-600">
                    Use conditional logic to show different text based on score values.
                  </p>
                  <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                    {`{{IF:score_name:operator:value:true_text:false_text}}`}
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>Operators:</strong> &gt;=, &lt;=, &gt;, &lt;, ==, !=
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Example:</strong> If ASRS score ≥ 4, show "was indicative", else show "was not indicative"
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </button>
          {expandedSections.conditional && (
            <div className="space-y-2 ml-6">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-medium mb-2">Example: ASRS Score Interpretation</p>
                <div className="bg-white p-2 rounded text-xs font-mono mb-2 break-all">
                  {`{{IF:asrs_total_score:>=:4:was indicative of ADHD symptoms:was not indicative of ADHD symptoms}}`}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => handleInsertConditional('{{IF:asrs_total_score:>=:4:was indicative of ADHD symptoms:was not indicative of ADHD symptoms}}')}
                  disabled={readOnly}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Insert Example
                </Button>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-medium mb-2">Example: Generic Score Check</p>
                <div className="bg-white p-2 rounded text-xs font-mono mb-2 break-all">
                  {`{{IF:score_name:>:10:above threshold:below threshold}}`}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => handleInsertConditional('{{IF:score_name:>:10:above threshold:below threshold}}')}
                  disabled={readOnly}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Insert Template
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Basic Placeholders */}
        {basicPlaceholders.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('basic')}
              className="flex items-center gap-2 text-sm font-semibold mb-2 hover:text-blue-600 transition-colors"
              style={{color: 'var(--text-primary)'}}
            >
              {expandedSections.basic ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Basic Information
            </button>
            {expandedSections.basic && (
              <div className="space-y-2 ml-6">
                {basicPlaceholders.map((placeholder, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-gray-600 truncate">{placeholder.placeholder}</p>
                      <p className="text-xs text-gray-500">{placeholder.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleInsertPlaceholder(placeholder.placeholder)}
                      className="ml-2 shrink-0 h-7 w-7 p-0"
                      disabled={readOnly}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Test Bank Score Placeholders */}
        {Object.keys(groupedTestBankPlaceholders).length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('testBank')}
              className="flex items-center gap-2 text-sm font-semibold mb-2 hover:text-blue-600 transition-colors"
              style={{color: 'var(--text-primary)'}}
            >
              {expandedSections.testBank ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Test Bank Scores
              <Badge className="bg-blue-100 text-blue-700 text-xs">
                {testType}
              </Badge>
            </button>
            {expandedSections.testBank && (
              <div className="space-y-3 ml-6">
                {Object.entries(groupedTestBankPlaceholders).map(([subtestKey, placeholders]) => {
                  if (subtestKey === 'other') return null;

                  const subtestName = placeholders[0]?.description?.replace(/(Score|Percentile|Descriptor)$/, '').trim() || subtestKey;
                  const scorePlaceholder = placeholders.find(p => p.placeholder.includes('_score'));
                  const percentilePlaceholder = placeholders.find(p => p.placeholder.includes('_percentile'));
                  const descriptorPlaceholder = placeholders.find(p => p.placeholder.includes('_descriptor'));

                  return (
                    <div key={subtestKey} className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
                      <h4 className="text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>{subtestName}</h4>
                      <div className="grid grid-cols-3 gap-1">
                        {scorePlaceholder && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInsertPlaceholder(scorePlaceholder.placeholder)}
                            className="text-xs h-7 px-2 bg-blue-50 border-blue-200 hover:bg-blue-100"
                            disabled={readOnly}
                          >
                            Score
                          </Button>
                        )}
                        {percentilePlaceholder && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInsertPlaceholder(percentilePlaceholder.placeholder)}
                            className="text-xs h-7 px-2 bg-green-50 border-green-200 hover:bg-green-100"
                            disabled={readOnly}
                          >
                            %ile
                          </Button>
                        )}
                        {descriptorPlaceholder && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInsertPlaceholder(descriptorPlaceholder.placeholder)}
                            className="text-xs h-7 px-2 bg-purple-50 border-purple-200 hover:bg-purple-100"
                            disabled={readOnly}
                          >
                            Desc
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Custom Placeholders */}
        {customPlaceholders.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('custom')}
              className="flex items-center gap-2 text-sm font-semibold mb-2 hover:text-blue-600 transition-colors"
              style={{color: 'var(--text-primary)'}}
            >
              {expandedSections.custom ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Custom Placeholders
            </button>
            {expandedSections.custom && (
              <div className="space-y-2 ml-6">
                {customPlaceholders.map((placeholder, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-gray-600 truncate">{placeholder.placeholder}</p>
                      <p className="text-xs text-gray-500">{placeholder.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleInsertPlaceholder(placeholder.placeholder)}
                      className="ml-2 shrink-0 h-7 w-7 p-0"
                      disabled={readOnly}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No results message */}
        {searchTerm && filteredPlaceholders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No placeholders found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Empty state for Test Bank placeholders */}
        {!testType && Object.keys(groupedTestBankPlaceholders).length === 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            <p>Define subtests in the Test Bank for this test type to see score placeholders here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
