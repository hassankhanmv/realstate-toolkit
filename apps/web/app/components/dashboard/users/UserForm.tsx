import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetcher } from "react-router";
import type { Profile } from "@repo/supabase";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Maximize2, Minimize2, AlertCircle } from "lucide-react";
import { userFormSchema, type UserFormValues } from "@/validations/user";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: Profile;
}

export function UserForm({ open, onOpenChange, user }: UserFormProps) {
  const { t } = useTranslation();
  const formFetcher = useFetcher();
  const isSubmitting = formFetcher.state === "submitting";
  const [isMaximized, setIsMaximized] = useState(false);
  const wasSubmitting = useRef(false);

  const form = useForm<any>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role: "agent",
      is_disabled: false,
      expiry_date: null,
      permissions: {
        properties: { view: true, edit: false, create: false, delete: false },
        leads: { view: true, edit: false, create: false, delete: false },
        users: { view: false, edit: false, create: false, delete: false },
        analytics: false,
        profile: true,
      },
      notifications: { on_login: false, on_disable: true, on_expiry: true },
    },
  });

  useEffect(() => {
    const safeParse = (val: any, fallback: any) => {
      if (!val) return fallback;
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch (e) {
          return fallback;
        }
      }
      return val;
    };

    if (user && open) {
      form.reset({
        full_name: user.full_name || "",
        email: (user as any).email || "", // Assuming email is either joined or passed in
        password: "", // Always empty for edit
        role: user.role || "agent",
        is_disabled: user.is_disabled || false,
        expiry_date: user.expiry_date ? new Date(user.expiry_date) : null,
        permissions: safeParse(user.permissions, {
          properties: { view: true, edit: false, create: false, delete: false },
          leads: { view: true, edit: false, create: false, delete: false },
          users: { view: false, edit: false, create: false, delete: false },
          analytics: false,
          profile: true,
        }),
        notifications: safeParse(user.notifications, {
          on_login: false,
          on_disable: true,
          on_expiry: true,
        }),
      });
    } else if (open) {
      form.reset({
        full_name: "",
        email: "",
        password: "",
        role: "agent",
        is_disabled: false,
        expiry_date: null,
        permissions: {
          properties: { view: true, edit: false, create: false, delete: false },
          leads: { view: true, edit: false, create: false, delete: false },
          users: { view: false, edit: false, create: false, delete: false },
          analytics: false,
          profile: true,
        },
        notifications: { on_login: false, on_disable: true, on_expiry: true },
      });
    }
  }, [user, open, form]);

  useEffect(() => {
    if (formFetcher.state === "submitting") {
      wasSubmitting.current = true;
    }
  }, [formFetcher.state]);

  useEffect(() => {
    if (
      formFetcher.state === "idle" &&
      formFetcher.data &&
      wasSubmitting.current
    ) {
      wasSubmitting.current = false;
      const data = formFetcher.data as any;
      if (data.error) {
        toast.error(data.error);
      } else if (data.data || data.success) {
        toast.success(
          user ? t("users.success.updated") : t("users.success.created"),
        );
        onOpenChange(false);
      }
    }
  }, [formFetcher.state, formFetcher.data, onOpenChange, user]);

  const onSubmit = (data: any) => {
    const method = user ? "PUT" : "POST";
    const action = user ? `/api/users/${user.id}` : "/api/users";

    // Ensure empty strings for dates are sent as null so Zod coercion doesn't fail on empty strings
    const payload = { ...data };
    if (payload.expiry_date === "") {
      payload.expiry_date = null;
    }

    formFetcher.submit(
      { data: JSON.stringify(payload) },
      { method, action, encType: "application/json" },
    );
  };

  const isExpired =
    user?.expiry_date && new Date(user.expiry_date) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`p-0 bg-card border-border shadow-xl rounded-xl sm:rounded-2xl transition-all duration-300 flex flex-col ${
          isMaximized
            ? "w-[95vw] max-w-none h-[95vh]"
            : "sm:max-w-[750px] w-[95vw] h-[85vh] sm:h-[800px] max-h-[90vh]"
        }`}
      >
        <div className="absolute ltr:right-12 rtl:left-12 top-3 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsMaximized(!isMaximized)}
            className="h-8 w-8 rounded-full opacity-70 transition-colors hover:opacity-100 focus:outline-none hover:bg-muted cursor-pointer"
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle Size</span>
          </Button>
        </div>

        <DialogHeader className="px-4 sm:px-8 pt-6 pb-2 shrink-0 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="space-y-1 text-start">
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                {user ? t("users.form.edit_title") : t("users.form.add_title")}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {user ? t("users.form.edit_desc") : t("users.form.add_desc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isExpired && (
          <div className="px-4 sm:px-8 py-3 bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-900 flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">
              {t("users.form.expired_alert")}
            </p>
          </div>
        )}

        <Tabs
          defaultValue="details"
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="px-4 sm:px-8 pt-3 pb-0 shrink-0 border-b border-border/40">
            <TabsList className="h-9 p-0 bg-transparent border-none w-full justify-start gap-6">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 font-medium text-muted-foreground shadow-none data-[state=active]:border-accent data-[state=active]:text-foreground select-none hover:text-foreground transition-colors cursor-pointer"
              >
                {t("users.form.tabs.details")}
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 font-medium text-muted-foreground shadow-none data-[state=active]:border-accent data-[state=active]:text-foreground select-none hover:text-foreground transition-colors cursor-pointer"
              >
                {t("users.form.tabs.permissions")}
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 font-medium text-muted-foreground shadow-none data-[state=active]:border-accent data-[state=active]:text-foreground select-none hover:text-foreground transition-colors cursor-pointer"
              >
                {t("users.form.tabs.notifications")}
              </TabsTrigger>
            </TabsList>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
              autoComplete="off"
            >
              <TabsContent
                value="details"
                className="flex-1 overflow-y-auto m-0 outline-none px-4 sm:px-8 py-6 space-y-4"
              >
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("users.form.fields.full_name")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-9 rounded-md border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("users.form.fields.email")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="new-password"
                            disabled={!!user}
                            {...field}
                            className="h-9 rounded-md border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("users.form.fields.password")}{" "}
                          {user && (
                            <span className="text-xs text-muted-foreground font-normal">
                              {t("users.form.fields.password_help")}
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="new-password"
                            {...field}
                            className="h-9 rounded-md border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <FormField
                    control={form.control}
                    name="is_disabled"
                    render={({ field }) => (
                      <FormItem
                        className="flex flex-row items-center justify-between rounded-lg border border-border bg-transparent p-4 transition-colors hover:bg-muted/30 cursor-pointer"
                        onClick={() => field.onChange(!field.value)}
                      >
                        <div className="space-y-0.5 pointer-events-none">
                          <FormLabel className="text-sm font-medium">
                            {t("users.form.fields.disable_account")}
                          </FormLabel>
                          <p className="text-[13px] text-muted-foreground">
                            {t("users.form.fields.disable_account_desc")}
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-pointer"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiry_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border bg-transparent p-4">
                        <div className="space-y-0.5 w-full">
                          <FormLabel className="text-sm font-medium">
                            {t("users.form.fields.expiry_date")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              value={
                                field.value
                                  ? new Date(field.value)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? new Date(e.target.value)
                                    : null,
                                )
                              }
                              className="h-9 mt-2 rounded-md border-border bg-transparent w-full"
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent
                value="permissions"
                className="flex-1 overflow-y-auto m-0 outline-none px-4 sm:px-8 py-6 space-y-6"
              >
                <div className="grid gap-6">
                  {["properties", "leads", "users"].map((module) => (
                    <div
                      key={module}
                      className="bg-muted/30 border border-border rounded-lg p-5"
                    >
                      <h4 className="text-base font-semibold text-foreground mb-4 capitalize">
                        {t(`users.form.permissions.${module}`)}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {["view", "edit", "create", "delete"].map((action) => (
                          <FormField
                            key={`${module}.${action}`}
                            control={form.control}
                            name={`permissions.${module as "properties" | "leads" | "users"}.${action as "view" | "edit" | "create" | "delete"}`}
                            render={({ field }) => (
                              <FormItem
                                className="flex flex-row items-center space-x-3 space-y-0 bg-background border border-border/50 rounded-md p-3 hover:bg-accent/10 transition-colors cursor-pointer"
                                onClick={() =>
                                  form.setValue(
                                    `permissions.${module as "properties" | "leads" | "users"}.${action as "view" | "edit" | "create" | "delete"}`,
                                    !field.value,
                                    { shouldDirty: true },
                                  )
                                }
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value as boolean}
                                    onCheckedChange={field.onChange}
                                    onClick={(e) => e.stopPropagation()}
                                    className="cursor-pointer"
                                  />
                                </FormControl>
                                <FormLabel className="font-medium text-sm capitalize cursor-pointer m-0">
                                  {t(`users.form.permissions.${action}`)}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-accent/5 border border-accent/20 rounded-lg p-5">
                  <h4 className="text-base font-semibold text-foreground mb-4">
                    {t("users.form.permissions.global_settings")}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <FormField
                      control={form.control}
                      name="permissions.analytics"
                      render={({ field }) => (
                        <FormItem
                          className="flex flex-row items-center space-x-3 space-y-0 bg-background border border-border/50 rounded-md p-4 hover:bg-accent/10 transition-colors cursor-pointer"
                          onClick={() => field.onChange(!field.value)}
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                              onClick={(e) => e.stopPropagation()}
                              className="cursor-pointer"
                            />
                          </FormControl>
                          <FormLabel className="font-medium cursor-pointer m-0">
                            {t("users.form.permissions.analytics")}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permissions.profile"
                      render={({ field }) => (
                        <FormItem
                          className="flex flex-row items-center space-x-3 space-y-0 bg-background border border-border/50 rounded-md p-4 hover:bg-accent/10 transition-colors cursor-pointer"
                          onClick={() => field.onChange(!field.value)}
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                              onClick={(e) => e.stopPropagation()}
                              className="cursor-pointer"
                            />
                          </FormControl>
                          <FormLabel className="font-medium cursor-pointer m-0">
                            {t("users.form.permissions.profile")}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="notifications"
                className="flex-1 overflow-y-auto m-0 outline-none px-4 sm:px-8 py-6 space-y-4"
              >
                <FormField
                  control={form.control}
                  name="notifications.on_login"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-center justify-between rounded-lg border border-border bg-transparent p-4 transition-colors hover:bg-muted/30 cursor-pointer"
                      onClick={() => field.onChange(!field.value)}
                    >
                      <div className="space-y-0.5 pointer-events-none">
                        <FormLabel className="text-sm font-medium">
                          {t("users.form.notifications.on_login")}
                        </FormLabel>
                        <p className="text-[13px] text-muted-foreground">
                          {t("users.form.notifications.on_login_desc")}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notifications.on_disable"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-center justify-between rounded-lg border border-border bg-transparent p-4 transition-colors hover:bg-muted/30 cursor-pointer"
                      onClick={() => field.onChange(!field.value)}
                    >
                      <div className="space-y-0.5 pointer-events-none">
                        <FormLabel className="text-sm font-medium">
                          {t("users.form.notifications.on_disable")}
                        </FormLabel>
                        <p className="text-[13px] text-muted-foreground">
                          {t("users.form.notifications.on_disable_desc")}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notifications.on_expiry"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-center justify-between rounded-lg border border-border bg-transparent p-4 transition-colors hover:bg-muted/30 cursor-pointer"
                      onClick={() => field.onChange(!field.value)}
                    >
                      <div className="space-y-0.5 pointer-events-none">
                        <FormLabel className="text-sm font-medium">
                          {t("users.form.notifications.on_expiry")}
                        </FormLabel>
                        <p className="text-[13px] text-muted-foreground">
                          {t("users.form.notifications.on_expiry_desc")}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <div className="flex items-center justify-end gap-3 px-4 sm:px-8 py-4 border-t border-border/50 shrink-0 bg-card z-10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="h-9 px-4 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {t("users.form.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-6 rounded-md text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm min-w-[100px] transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("users.form.saving")}
                    </div>
                  ) : (
                    t("users.form.save")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
