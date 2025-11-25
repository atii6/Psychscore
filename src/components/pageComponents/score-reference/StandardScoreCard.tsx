import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CLINICAL_SCORE_REFERENCE,
  COLOR_CLASSES,
} from "@/utilitites/constants/scoreReferenceConstants";
import { BarChart3 } from "lucide-react";

function StandardScoreCard() {
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
          {CLINICAL_SCORE_REFERENCE.title}
        </CardTitle>
        <p style={{ color: "var(--text-secondary)" }}>
          {CLINICAL_SCORE_REFERENCE.subtitle}
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
                  Standard Score
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
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Clinical Interpretation
                </th>
              </tr>
            </thead>
            <tbody>
              {CLINICAL_SCORE_REFERENCE.ranges.map((range, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td
                    className="py-3 px-4 font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {range.standardScore}
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
                  <td
                    className="py-3 px-4 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {range.description}
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

export default StandardScoreCard;
