import React from "react";
import { Link } from "react-router-dom";
import Form from "@/components/form/Form";
import z from "zod";
import FormTextField from "@/components/form/Fields/FormTextField";
import FormButton from "@/components/form/Fields/FormButton";
import { GridItem } from "@/components/ui/Grid";
import { USER_ROLES } from "@/utilitites/constants";
import useRegister from "@/hooks/auth/useRegisterUser";

export default function SignupPage() {
  const { mutateAsync: registerNewUser, isPending: isLoading } = useRegister();

  const initialValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(8),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  type ValidationSchema = z.infer<typeof validationSchema>;

  const handleSubmit = async (values: ValidationSchema) => {
    const user = {
      full_name: values.name,
      email: values.email,
      password: values.password,
      role: USER_ROLES.USER,
    };

    const res = await registerNewUser(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full flex items-center justify-center">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2a0a3114e_logo.png" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Create Account
              </h1>
              <p className="text-sm text-gray-600 mt-1">Join PsychScore Pro</p>
            </div>
          </div>
          <Form
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <FormTextField
              name="name"
              label="Full Name"
              placeholder="John Doe"
            />

            <FormTextField
              name="email"
              label="Email"
              placeholder="john@gmail.com"
            />

            <FormTextField
              name="password"
              label="Password"
              placeholder="••••••••"
            />
            <FormTextField
              name="confirmPassword"
              label="Confirm Password"
              placeholder="••••••••"
            />
            <GridItem>
              <FormButton
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isLoading ? "Creating account..." : "Sign up"}
              </FormButton>
            </GridItem>
          </Form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/Login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
