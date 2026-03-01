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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
      name: user?.profile?.full_name || user?.user_metadata?.full_name || "",
      company_name:
        user?.profile?.company_name || user?.user_metadata?.company_name || "",
    },
  });

  const [isResetDialogVisible, setIsResetDialogVisible] = useState(false);
  const [resetNote, setResetNote] = useState("");
  const [isRequestingReset, setIsRequestingReset] = useState(false);

  // Check if current user is a managed child agent
  // Previously we used admin_id != null. Now company_id defines the tenant.
  // If their company_id is not their own user id, they are managed by someone else.
  const isManagedAgent = user?.profile?.company_id !== user?.id;

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  // Reset form values when user data is loaded from Redux
  useEffect(() => {
    if (user) {
      reset({
        name: user.profile?.full_name || user.user_metadata?.full_name || "",
        company_name:
          user.profile?.company_name || user.user_metadata?.company_name || "",
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
      // 1. Update SQL profiles table
      const { error: profileError } = await (supabase.from("profiles") as any)
        .update({
          full_name: data.name,
          company_name: data.company_name, // Even if disabled, this tracks Admin input logic
        })
        .eq("id", user!.id);

      if (profileError) throw profileError;

      // 2. Sync Auth metadata
      const { data: updatedUser, error: authError } =
        await supabase.auth.updateUser({
          data: {
            full_name: data.name,
            company_name: data.company_name,
          },
        });

      if (authError) throw authError;

      if (updatedUser.user) {
        // Hydrate UI State through redux
        dispatch(
          setUser({
            ...updatedUser.user,
            profile: {
              ...user!.profile,
              full_name: data.name,
              company_name: data.company_name,
            } as any,
          }),
        );
        toast.success(t("profile.success_message"));
        reset(data); // Clear dirty state
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(t("profile.error_message"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!user) return;

    if (passwordForm.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsResettingPassword(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      toast.error(t("profile.error_message"));
      setIsResettingPassword(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.password,
      });

      if (error) throw error;

      toast.success(t("profile.reset_password_success"));
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(t("profile.reset_password_error"));
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!user) return;
    setIsRequestingReset(true);

    try {
      const response = await fetch("/api/users/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note: resetNote }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("profile.request_reset_error"));
      }

      toast.success(data.message || t("profile.request_reset_success"));
      setIsResetDialogVisible(false);
      setResetNote("");
    } catch (error: any) {
      console.error("Password reset request error:", error);
      toast.error(error.message || t("profile.request_reset_error"));
    } finally {
      setIsRequestingReset(false);
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
                disabled={isManagedAgent}
                className={
                  isManagedAgent ? "bg-slate-50 cursor-not-allowed" : ""
                }
                title={
                  isManagedAgent
                    ? "Company name is locked by your administrator"
                    : ""
                }
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
          {isManagedAgent ? (
            <Dialog
              open={isResetDialogVisible}
              onOpenChange={setIsResetDialogVisible}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  {t("profile.request_reset_title")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("profile.request_reset_title")}</DialogTitle>
                  <DialogDescription>
                    {t("profile.request_reset_desc")}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea
                    placeholder={t("profile.request_reset_note_placeholder")}
                    value={resetNote}
                    onChange={(e) => setResetNote(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsResetDialogVisible(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={handleRequestPasswordReset}
                    disabled={isRequestingReset}
                  >
                    {isRequestingReset
                      ? t("profile.sending_request_button")
                      : t("profile.send_request_button")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <form
              onSubmit={handleResetPassword}
              className="space-y-4 max-w-sm ml-0"
            >
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={passwordForm.password}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  disabled={isResettingPassword}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  disabled={isResettingPassword}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                disabled={
                  isResettingPassword ||
                  !passwordForm.password ||
                  !passwordForm.confirmPassword
                }
                className="w-full md:w-auto"
              >
                {isResettingPassword
                  ? t("profile.resetting_password")
                  : t("profile.reset_password_button")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
