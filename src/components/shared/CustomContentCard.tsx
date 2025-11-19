import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconProps?: React.SVGProps<SVGSVGElement>;
  cardStyles?: string;
  contentContainerStyles?: string;
};

function CustomContentCard({
  children,
  title,
  description,
  Icon,
  iconProps,
  cardStyles,
  contentContainerStyles,
}: Props) {
  return (
    <Card
      className={cn(
        "border-0 shadow-lg rounded-2xl bg-[var(--card-background)]",
        cardStyles
      )}
    >
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle
              className="flex items-center gap-2 text-xl"
              style={{ color: "var(--text-primary)" }}
            >
              {Icon && <Icon {...iconProps} />}
              {title}
            </CardTitle>
          )}

          {description && (
            <CardDescription
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      {children && (
        <CardContent className={cn("space-y-6", contentContainerStyles)}>
          {children}
        </CardContent>
      )}
    </Card>
  );
}

export default CustomContentCard;
