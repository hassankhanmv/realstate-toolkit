import { useEffect } from "react";
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSubmit,
  data,
} from "react-router";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { getSupabaseServer } from "@/lib/supabase.server";
import { signUpUser } from "@repo/supabase";
import { signupSchema } from "@/utils/validations/auth";
import { setUser, setError } from "@/store/slices/authSlice";
import type { Route } from "./+types/index";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return data(null, { status: 302, headers: { Location: "/dashboard" } });
  }

  return data(null, { headers });
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validation = signupSchema.safeParse({
    name,
    email,
    password,
    confirmPassword,
  });

  if (!validation.success) {
    return data({ error: validation.error.issues[0].message }, { status: 400 });
  }

  const { supabase, headers } = getSupabaseServer(request);

  const { data: authData, error } = await signUpUser(supabase, {
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    return data({ error: error.message }, { status: 400, headers });
  }

  return data({ success: true, user: authData.user }, { status: 200, headers });
};

export default function Signup() {
  const { t } = useTranslation();
  const actionData = useActionData<typeof action>() as {
    error?: string;
    success?: boolean;
    user?: any;
  };
  const navigation = useNavigation();
  const submit = useSubmit();
  const dispatch = useDispatch();

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) {
      toast.error(t("error"), {
        description: actionData.error,
      });
      dispatch(setError(actionData.error));
    } else if (actionData?.success) {
      toast.success(t("success"), {
        description: "Account created! Redirecting...",
      });
      dispatch(setUser(actionData.user));
      window.location.href = "/dashboard";
    }
  }, [actionData, dispatch, t]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    submit(formData, { method: "post" });
  };

  return (
    <AuthLayout title={t("signup.title")} subtitle={t("signup.subtitle")}>
      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <Form method="post" onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("signup.name_label")}</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder={t("placeholders.full_name")}
                    type="text"
                    autoCapitalize="words"
                    autoComplete="name"
                    autoCorrect="off"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("signup.email_label")}</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder={t("placeholders.email")}
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t("signup.password_label")}</Label>
                  <PasswordInput
                    id="password"
                    name="password"
                    placeholder={t("placeholders.password")}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">
                    {t("signup.confirm_password_label")}
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder={t("placeholders.confirm_password")}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("signup.submit_button")}
                </Button>
              </div>
            </Form>
            <div className="text-center text-sm text-muted-foreground">
              {t("already_have_account")}{" "}
              <Link
                to="/login"
                className="underline underline-offset-4 hover:text-primary"
              >
                {t("login.title")}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
