import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Save, AlertCircle } from "lucide-react";
import Form from "@/components/form/Form";
import { GridItem } from "@/components/ui/Grid";
import z from "zod";
import AssessmentInformationCard from "@/components/pageComponents/upload/AssessmentInformationCard";
import RaterInformationCard from "@/components/pageComponents/upload/RaterInformationCard";
import ManualScoreCard from "@/components/pageComponents/manual-entry/ManualScoreCard";
import FormButton from "@/components/form/Fields/FormButton";
import useCreateAssessment from "@/hooks/assessments/useCreateAssessment";
import type { GenderType } from "@/utilitites/types/Assessment";
import {
  ASSESSMENT_STATUS,
  GENDER,
  PRONOUN_SETS,
} from "@/utilitites/constants";
import type { ScoreType } from "@/utilitites/types/TestSubtestDefinitions";
import CreateAssessmentHeader from "@/components/pageComponents/manual-entry/CreateAssessmentHeader";
import useUserStore from "@/store/userStore";

export type ScoresType = {
  subtest_name: string;
  score_type: string;
  composite_score: number;
  percentile_rank: number;
  scaled_score?: number;
  descriptor: string;
};

export type TestType = {
  test_name: string;
  scores: ScoresType[];
};

export const assessmentValidationSchema = z.object({
  client_first_name: z.string().min(1, "First name is required"),
  client_last_name: z.string().min(1, "Last name is required"),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  subjective_pronoun: z.string().optional(),
  objective_pronoun: z.string().optional(),
  possessive_pronoun: z.string().optional(),
  test_date: z.string().optional(),
  rater1_first_name: z.string().optional(),
  rater1_last_name: z.string().optional(),
  rater1_suffix: z.string().optional(),
  rater2_first_name: z.string().optional(),
  rater2_last_name: z.string().optional(),
  rater2_suffix: z.string().optional(),
});

export type AssessmentValidationSchemaType = z.infer<
  typeof assessmentValidationSchema
>;
const { subjective, objective, possessive } = PRONOUN_SETS[GENDER.FEMALE];

export const assessmentInitialValues = {
  client_first_name: "",
  client_last_name: "",
  gender: GENDER.FEMALE,
  date_of_birth: "",
  subjective_pronoun: subjective,
  objective_pronoun: objective,
  possessive_pronoun: possessive,
  test_date: "",
  rater1_first_name: "",
  rater1_last_name: "",
  rater1_suffix: "",
  rater2_first_name: "",
  rater2_last_name: "",
  rater2_suffix: "",
  showRater2: [],
};

export default function ManualEntryPage() {
  const navigate = useNavigate();
  const User = useUserStore(React.useCallback((state) => state.user, []));

  const {
    mutateAsync: createAssessment,
    isPending,
    isError,
    error,
  } = useCreateAssessment();
  const [tests, setTests] = React.useState<TestType[]>([]);

  const handleSubmit = async (values: AssessmentValidationSchemaType) => {
    const allScores = tests.flatMap((test) => {
      if (!test.test_name) {
        return [];
      }
      return test.scores.map((score) => ({
        ...score,
        test_name: test.test_name,
        score_type: score.score_type as ScoreType,
      }));
    });

    const assessment = {
      ...values,
      gender: values.gender as GenderType,
      file_urls: [],
      extracted_scores: allScores,
      status: ASSESSMENT_STATUS.PROCESSED,
      is_active: true,
      is_sample: false,
      created_by_id: User?.id,
      created_by: User?.email,
    };

    try {
      await createAssessment({ assessment });
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Failed to create assessment", error);
    }
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-4xl mx-auto">
        <CreateAssessmentHeader
          title="Manual Score Entry"
          description="Enter assessment scores directly without uploading a file."
          onAction={() => navigate(createPageUrl("Dashboard"))}
        />

        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center gap-2">
              <AlertCircle size={18} />
              {error.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Form
            initialValues={assessmentInitialValues}
            validationSchema={assessmentValidationSchema}
            onSubmit={handleSubmit}
          >
            <GridItem>
              <AssessmentInformationCard />
            </GridItem>

            <GridItem>
              <RaterInformationCard />
            </GridItem>

            <GridItem>
              <ManualScoreCard tests={tests} setTests={setTests} />
            </GridItem>

            <GridItem className="flex justify-end pt-4">
              <FormButton
                disabled={isPending}
                className="px-8 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                }}
              >
                <Save className="w-5 h-5 mr-2" />
                {isPending ? "Saving..." : "Save Assessment"}
              </FormButton>
            </GridItem>
          </Form>
        </div>
      </div>
    </div>
  );
}
