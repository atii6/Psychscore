import { BarChart3, BookOpen, FileText, Upload } from "lucide-react";
import { PronounSets } from "../types";

export const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "other", label: "Other" },
];

export const QUICK_ACTIONS = [
  {
    title: "Upload Assessment",
    description: "Upload and extract scores from files",
    icon: Upload,
    href: "Upload",
    color: "blue",
  },
  {
    title: "Create Template",
    description: "Build narrative report templates",
    icon: BookOpen,
    href: "Templates",
    color: "purple",
  },
  {
    title: "View Reports",
    description: "Generate and manage reports",
    icon: FileText,
    href: "Reports",
    color: "green",
  },
  {
    title: "Score Reference",
    description: "Lookup scoring guidelines",
    icon: BarChart3,
    href: "ScoreReference",
    color: "orange",
  },
];

export const PRONOUN_SETS: PronounSets = {
  female: { subjective: "she", objective: "her", possessive: "her" },
  male: { subjective: "he", objective: "him", possessive: "his" },
  nonbinary: { subjective: "they", objective: "them", possessive: "their" },
  other: { subjective: "", objective: "", possessive: "" },
};

export const ASSESSMENT_STATUS = {
  UPLOADED: "uploaded",
  PROCESSED: "processed",
  REPORT_GENERATED: "report_generated",
} as const;

export const GENDER = {
  FEMALE: "female",
  MALE: "male",
  NONBINARY: "nonbinary",
  OTHER: "other",
} as const;

export const TEMPLATE_CATEGORY_LABELS = {
  cognitive: "Cognitive Assessments",
  personality: "Personality Assessments",
  behavioral: "Behavioral Assessments",
  achievement: "Achievement Assessments",
  neuropsychological: "Neuropsychological Assessments",
  "self-report": "Self-Report Measures",
} as const;

export const TEMPLATE_CATEGORY_OPTIONS = [
  { value: "cognitive", label: "Cognitive" },
  { value: "personality", label: "Personality" },
  { value: "behavioral", label: "Behavioral" },
  { value: "achievement", label: "Achievement" },
  { value: "neuropsychological", label: "Neuropsychological" },
  { value: "self-report", label: "Self-Report" },
];

export const SCORE_TYPE = {
  STANDARD: "standard",
  SCALED: "scaled",
  PERCENTILE: "percentile",
};

export const SCORE_TYPE_OPTIONS = [
  { value: "standard", label: "Standard Score" },
  { value: "scaled", label: "Scaled Score" },
];

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;
