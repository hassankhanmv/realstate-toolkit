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
import { signInUser } from "@repo/supabase";
import { loginSchema } from "@/utils/validations/auth";
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

  return data({ success: true, user: authData.user }, { status: 200, headers });
};

export default function Login() {
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
        description: "Login successful! Redirecting...",
      });
      dispatch(setUser(actionData.user));
      setTimeout(() => {
        // window.location.href = "/dashboard";
      }, 1000);
    }
  }, [actionData, dispatch, t]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    submit(formData, { method: "post" });
  };

  return (
    <AuthLayout title={t("login.title")} subtitle={t("login.subtitle")}>
      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <Form method="post" onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("login.email_label")}</Label>
                  <Input
                    id="email"
                    placeholder={t("placeholders.email")}
                    type="email"
                    name="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">
                      {t("login.password_label")}
                    </Label>
                    <Link
                      to="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-muted-foreground"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <PasswordInput
                    id="password"
                    name="password"
                    placeholder={t("placeholders.password")}
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
                  {t("login.submit_button")}
                </Button>
              </div>
            </Form>
            <div className="text-center text-sm text-muted-foreground">
              {t("dont_have_account")}{" "}
              <Link
                to="/signup"
                className="underline underline-offset-4 hover:text-primary"
              >
                {t("signup.signup_title")}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
