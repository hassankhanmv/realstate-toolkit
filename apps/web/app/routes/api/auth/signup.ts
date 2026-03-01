import { data } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { signUpUser } from "@repo/supabase";
import { signupSchema } from "@/utils/validations/auth";
import type { Route } from "./+types/signup";

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const full_name =
    (formData.get("full_name") as string) || (formData.get("name") as string);
  const role = formData.get("role") as string;
  const company_name = formData.get("company_name") as string | null;

  const validation = signupSchema.safeParse({
    email,
    password,
    confirmPassword,
    full_name,
    role,
    company_name,
  });

  if (!validation.success) {
    return data({ error: validation.error.issues[0].message }, { status: 400 });
  }

  const { supabase, headers } = getSupabaseServer(request);
  const { data: authData, error } = await signUpUser(supabase, {
    email,
    password,
    options: {
      data: {
        full_name,
        role,
        company_name,
      },
    },
  });

  if (error) {
    return data({ error: error.message }, { status: 400, headers });
  }

  return data({ user: authData.user }, { status: 201, headers });
};
