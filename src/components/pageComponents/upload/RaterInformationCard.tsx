import CheckboxField from "@/components/form/Fields/CheckboxField";
import FormTextField from "@/components/form/Fields/FormTextField";
import CustomContentCard from "@/components/shared/CustomContentCard";
import { Grid } from "@/components/ui/Grid";
import { Brain } from "lucide-react";
import { useFormContext } from "react-hook-form";

type Props = {};

function RaterInformationCard({}: Props) {
  const { watch } = useFormContext();
  const showRater2 = watch("showRater2")[0];

  return (
    <CustomContentCard
      title="Rater Information (Optional)"
      description="Add information for parents, guardians, or other raters who
                    completed rating forms"
      Icon={Brain}
      iconProps={{
        className: "w-6 h-6",
        style: { color: "var(--secondary-blue)" },
      }}
    >
      <div className="space-y-4">
        <h4 className="font-medium" style={{ color: "var(--text-primary)" }}>
          Rater 1
        </h4>

        <Grid>
          <FormTextField size={2} name="rater1_first_name" label="First Name" />
          <FormTextField
            size={2}
            name="rater1_last_name"
            label="Last Name"
            placeholder="Optional"
          />
          <FormTextField
            size={2}
            name="rater1_suffix"
            label="Suffix"
            placeholder="Jr., Sr., III"
          />
          <CheckboxField
            name="showRater2"
            label=""
            options={[{ value: true, label: "Add Optional Rater 2" }]}
          />
        </Grid>
        {showRater2 && (
          <div className="space-y-4 pl-6 border-l-2 border-blue-200">
            <h4
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Rater 2
            </h4>

            <Grid>
              <>
                <FormTextField
                  size={2}
                  name="rater2_first_name"
                  label="First Name"
                />
                <FormTextField
                  size={2}
                  name="rater2_last_name"
                  label="Last Name"
                  placeholder="Optional"
                />
                <FormTextField
                  size={2}
                  name="rater2_suffix"
                  label="Suffix"
                  placeholder="Jr., Sr., III"
                />
              </>
            </Grid>
          </div>
        )}
      </div>
    </CustomContentCard>
  );
}

export default RaterInformationCard;
