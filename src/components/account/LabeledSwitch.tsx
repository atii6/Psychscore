import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type LabeledSwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelStyle?: string;
};

export default function LabeledSwitch({
  label,
  checked,
  onChange,
  labelStyle,
}: LabeledSwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <Switch id="show-titles" checked={checked} onCheckedChange={onChange} />
      <Label
        htmlFor="show-titles"
        className={cn("font-medium transition-colors duration-200", labelStyle)}
      >
        {label}
      </Label>
    </div>
  );
}
