import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Upload, FileText, BookOpen, BarChart3, Plus } from "lucide-react";

const quickActions = [
  {
    title: "Upload Assessment",
    description: "Upload and extract scores from files",
    icon: Upload,
    href: "Upload",
    color: "blue"
  },
  {
    title: "Create Template",
    description: "Build narrative report templates",
    icon: BookOpen,
    href: "Templates",
    color: "purple"
  },
  {
    title: "View Reports",
    description: "Generate and manage reports",
    icon: FileText,
    href: "Reports",
    color: "green"
  },
  {
    title: "Score Reference",
    description: "Lookup scoring guidelines",
    icon: BarChart3,
    href: "ScoreReference", 
    color: "orange"
  }
];

export default function QuickActions() {
  return (
    <Card className="border-0 shadow-lg rounded-2xl" style={{backgroundColor: 'var(--card-background)'}}>
      <CardHeader>
        <CardTitle style={{color: 'var(--text-primary)'}}>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action) => (
          <Link key={action.title} to={createPageUrl(action.href)} className="block">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200"
            >
              <div className="flex items-start gap-3 w-full min-w-0">
                <div className={`p-2 rounded-lg shrink-0 ${{
                  blue: 'bg-blue-100',
                  purple: 'bg-purple-100', 
                  green: 'bg-green-100',
                  orange: 'bg-orange-100'
                }[action.color]}`}>
                  <action.icon className={`w-4 h-4 ${{
                    blue: 'text-blue-600',
                    purple: 'text-purple-600',
                    green: 'text-green-600', 
                    orange: 'text-orange-600'
                  }[action.color]}`} />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-medium text-sm leading-tight mb-1" style={{color: 'var(--text-primary)'}}>{action.title}</p>
                  <p className="text-xs leading-tight break-words" style={{color: 'var(--text-secondary)'}}>{action.description}</p>
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}