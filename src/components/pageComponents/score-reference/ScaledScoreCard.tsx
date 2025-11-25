import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  COLOR_CLASSES,
  SCALED_SCORE_REFERENCE,
} from "@/utilitites/constants/scoreReferenceConstants";
import { BarChart3 } from "lucide-react";

type Props = {};

function ScaledScoreCard({}: Props) {
  return (
    <Card
      className="border-0 shadow-lg rounded-2xl"
      style={{ backgroundColor: "var(--card-background)" }}
    >
      <CardHeader>
        <CardTitle
          className="flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          <BarChart3
            className="w-6 h-6"
            style={{ color: "var(--secondary-blue)" }}
          />
          {SCALED_SCORE_REFERENCE.title}
        </CardTitle>
        <p style={{ color: "var(--text-secondary)" }}>
          {SCALED_SCORE_REFERENCE.subtitle}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Scaled Score Range
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Percentile
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Descriptive Term
                </th>
              </tr>
            </thead>
            <tbody>
              {SCALED_SCORE_REFERENCE.ranges.map((range, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td
                    className="py-3 px-4 font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {range.scaledScore}
                  </td>
                  <td
                    className="py-3 px-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {range.percentile}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      className={`${
                        COLOR_CLASSES[range.color as keyof typeof COLOR_CLASSES]
                      } border font-medium`}
                    >
                      {range.descriptor}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default ScaledScoreCard;
