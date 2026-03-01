import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const target = profile?.role === "buyer" ? "/portal" : "/dashboard";
    return data(null, {
      status: 302,
      headers: { ...headers, Location: target },
    });
  }

  return data(null, { headers });
};

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Sign Up | Real Estate Toolkit" },
    {
      name: "description",
      content: "Sign up for a new account.",
    },
  ];
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const full_name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const company_name = formData.get("company_name") as string | null;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validation = signupSchema.safeParse({
    full_name,
    email,
    role,
    company_name,
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
    options: {
      data: {
        full_name,
        role: validation.data.role,
        company_name:
          validation.data.role === "company_owner"
            ? validation.data.company_name
            : undefined,
      },
    },
  });

  if (error) {
    return data({ error: error.message }, { status: 400, headers });
  }

  // Create a user object with a stub profile for immediate state update
  const userWithProfile = {
    ...authData.user,
    profile: {
      id: authData.user.id,
      full_name,
      role: validation.data.role,
      company_name:
        validation.data.role === "company_owner" ? company_name : null,
    } as any,
  };

  return data(
    { success: true, user: userWithProfile },
    { status: 200, headers },
  );
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

  const [role, setRole] = useState<"company_owner" | "buyer" | "">("");

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) {
      const translatedError = t(actionData.error) || actionData.error;
      toast.error(t("error"), {
        description: translatedError,
      });
      dispatch(setError(translatedError));
    } else if (actionData?.success) {
      toast.success(t("success"), {
        description: "Account created! Redirecting...",
      });
      dispatch(setUser(actionData.user));

      const role = (actionData.user as any)?.profile?.role;
      const target = role === "buyer" ? "/portal" : "/dashboard";

      setTimeout(() => {
        window.location.href = target;
      }, 1000);
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
                  <Label htmlFor="role">{t("signup.account_type")}</Label>
                  <Select
                    name="role"
                    value={role}
                    onValueChange={(val: any) => setRole(val)}
                    required
                  >
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue
                        placeholder={t("signup.select_account_type")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company_owner">
                        {t("signup.role_broker")}
                      </SelectItem>
                      <SelectItem value="buyer">
                        {t("signup.role_buyer")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {role === "company_owner" && (
                  <div className="grid gap-2 animate-in fade-in zoom-in-95 duration-200">
                    <Label htmlFor="company_name">
                      {t("signup.company_name")}
                    </Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      placeholder={t("signup.company_placeholder")}
                      type="text"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                )}
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
