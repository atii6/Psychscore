import React from "react";
import FormSelectField from "@/components/form/Fields/FormSelectField";
import FormTextField from "@/components/form/Fields/FormTextField";
import CustomContentCard from "@/components/shared/CustomContentCard";
import { Grid } from "@/components/ui/Grid";
import { GENDER_OPTIONS, PRONOUN_SETS } from "@/utilitites/constants";
import { Brain } from "lucide-react";
import { useFormContext } from "react-hook-form";

type Props = {};

function AssessmentInformationCard({}: Props) {
  const { watch, setValue } = useFormContext();
  const gender = watch("gender");

  React.useEffect(() => {
    if (PRONOUN_SETS[gender]) {
      const { subjective, objective, possessive } = PRONOUN_SETS[gender];
      setValue("subjective_pronoun", subjective);
      setValue("objective_pronoun", objective);
      setValue("possessive_pronoun", possessive);
    }
  }, [gender]);

  return (
    <CustomContentCard
      title="Client & Assessment Information"
      Icon={Brain}
      iconProps={{
        className: "w-6 h-6",
        style: { color: "var(--secondary-blue)" },
      }}
    >
      <Grid>
        <FormTextField size={3} name="client_first_name" label="First Name" />
        <FormTextField size={3} name="client_last_name" label="Last Name" />

        <FormSelectField
          size={3}
          name="gender"
          options={GENDER_OPTIONS}
          label="Gender"
        />
        <FormTextField
          size={3}
          name="date_of_birth"
          label="Date of Birth"
          type="date"
        />

        <FormTextField
          size={2}
          name="subjective_pronoun"
          label="Subjective Pronoun"
        />
        <FormTextField
          size={2}
          name="objective_pronoun"
          label="Objective Pronoun"
        />
        <FormTextField
          size={2}
          name="possessive_pronoun"
          label="Possessive Pronoun"
        />

        <FormTextField name="test_date" label="Test Date" type="date" />
      </Grid>
    </CustomContentCard>
  );
}

export default AssessmentInformationCard;
