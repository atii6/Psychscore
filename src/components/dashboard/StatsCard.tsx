import { Card, CardHeader } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const colorVariants = {
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-600",
  },
  green: {
    bg: "bg-green-500",
    light: "bg-green-50",
    text: "text-green-600",
  },
  orange: {
    bg: "bg-orange-500",
    light: "bg-orange-50",
    text: "text-orange-600",
  },
  purple: {
    bg: "bg-purple-500",
    light: "bg-purple-50",
    text: "text-purple-600",
  },
};

type StatusCardProps = {
  title: string;
  value: number;
  icon: any;
  color: keyof typeof colorVariants;
  trend?: string;
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: StatusCardProps) {
  const colors = colorVariants[color] || colorVariants.blue;

  return (
    <Card
      className="border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300"
      style={{ backgroundColor: "var(--card-background)" }}
    >
      <CardHeader className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {title}
            </p>
            <p
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {value}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${colors.light}`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            <span className="text-green-600 font-medium">{trend}</span>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
