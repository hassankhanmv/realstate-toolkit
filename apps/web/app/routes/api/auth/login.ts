import { data } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";

import { signInUser, type Profile } from "@repo/supabase";
import { loginSchema } from "@/utils/validations/auth";
import { sendEmail, getLoginNotificationEmail } from "@repo/email";
import type { Route } from "./+types/login";

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = loginSchema.safeParse({ email, password });

  if (!validation.success) {
    return data({ error: validation.error.issues[0].message }, { status: 400 });
  }

  const { supabase, headers } = getSupabaseServer(request);
  const { data: authData, error } = await signInUser(supabase, {
    email,
    password,
  });

  if (error) {
    return data({ error: error.message }, { status: 400, headers });
  }
  return data({ user: authData.user }, { status: 200, headers });
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return data({ user }, { status: 200, headers });
  }

  return data({ user: null }, { status: 200, headers });
};
