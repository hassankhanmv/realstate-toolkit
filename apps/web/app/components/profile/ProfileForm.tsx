import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getSupabaseBrowser } from "@/lib/supabase.client";
import { setUser } from "@/store/slices/authSlice";
import { toast } from "sonner";
import type { RootState } from "@/store/store";
import { Mail, User, Building2, KeyRound } from "lucide-react";

interface ProfileFormData {
  name: string;
  company_name: string;
}

export function ProfileForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.user_metadata?.full_name || "",
      company_name: user?.user_metadata?.company_name || "",
    },
  });

  // Reset form values when user data is loaded from Redux
  useEffect(() => {
    if (user?.user_metadata) {
      reset({
        name: user.user_metadata.full_name || "",
        company_name: user.user_metadata.company_name || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      toast.error(t("profile.error_message"));
      setIsLoading(false);
      return;
    }

    try {
      const { data: updatedUser, error } = await supabase.auth.updateUser({
        data: {
          full_name: data.name,
          company_name: data.company_name,
        },
      });

      if (error) throw error;

      if (updatedUser.user) {
        dispatch(setUser(updatedUser.user));
        toast.success(t("profile.success_message"));
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(t("profile.error_message"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;

    setIsResettingPassword(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      toast.error(t("profile.error_message"));
      setIsResettingPassword(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success(t("profile.reset_password_success"));
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(t("profile.reset_password_error"));
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("profile.title")}</CardTitle>
          <CardDescription>{t("profile.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("profile.name_label")}
              </Label>
              <Input
                id="name"
                type="text"
                {...register("name", {
                  required: t("validation.required"),
                  minLength: {
                    value: 2,
                    message: t("validation.name_min_length"),
                  },
                })}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t("profile.company_label")}
              </Label>
              <Input
                id="company_name"
                type="text"
                placeholder={t("profile.company_placeholder")}
                {...register("company_name")}
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t("profile.email_label")}
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-slate-50 cursor-not-allowed"
              />
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={!isDirty || isLoading}
              className="w-full md:w-auto"
            >
              {isLoading
                ? t("profile.saving_button")
                : t("profile.save_button")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Reset Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            {t("profile.password_section_title")}
          </CardTitle>
          <CardDescription>{t("profile.reset_password_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleResetPassword}
            disabled={isResettingPassword}
            className="w-full md:w-auto"
          >
            {isResettingPassword
              ? t("profile.resetting_password")
              : t("profile.reset_password_button")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
