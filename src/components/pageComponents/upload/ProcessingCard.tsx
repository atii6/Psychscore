import CustomContentCard from "@/components/shared/CustomContentCard";
import { LoaderPinwheel } from "lucide-react";

type Props = {};

function ProcessingCard({}: Props) {
  return (
    <CustomContentCard>
      <LoaderPinwheel
        className="w-12 h-12 animate-spin mx-auto mb-4"
        style={{ color: "var(--secondary-blue)" }}
      />
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        Processing Assessment Files
      </h3>
      <p style={{ color: "var(--text-secondary)" }}>
        Extracting scores and analyzing content...
      </p>
    </CustomContentCard>
  );
}

export default ProcessingCard;
