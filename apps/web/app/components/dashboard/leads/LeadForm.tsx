import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFetcher } from "react-router";
import type { Lead } from "@repo/supabase";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
  defaultPropertyId?: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+971[0-9]{8,9}$/, "Must be a valid UAE +971 number")
    .optional()
    .or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
  status: z
    .enum(["New", "Contacted", "Viewing", "Negotiation", "Won", "Lost"])
    .default("New"),
  source: z
    .enum(["WhatsApp", "Website", "Referral", "Other", ""])
    .optional()
    .or(z.literal("")),
  property_id: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  follow_up_date: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function LeadForm({
  open,
  onOpenChange,
  lead,
  defaultPropertyId,
}: LeadFormProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const [isMaximized, setIsMaximized] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      status: "New",
      source: "",
      property_id: defaultPropertyId || "",
      notes: "",
      follow_up_date: "",
    },
  });

  useEffect(() => {
    if (lead && open) {
      form.reset({
        name: lead.name,
        email: lead.email || "",
        phone: lead.phone || "",
        message: lead.message || "",
        status: (lead.status as FormValues["status"]) || "New",
        source: (lead.source as FormValues["source"]) || "",
        property_id: lead.property_id || "",
        notes: lead.notes || "",
        follow_up_date: lead.follow_up_date || "",
      });
    } else if (open) {
      form.reset({
        name: "",
        email: "",
        phone: "",
        message: "",
        status: "New",
        source: "",
        property_id: defaultPropertyId || "",
        notes: "",
        follow_up_date: "",
      });
    }
  }, [lead, open, form]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      const data = fetcher.data as any;
      if (data.error) {
        toast.error(data.error);
      } else if (data.lead || data.success) {
        toast.success(
          t(`leads.actions.${lead ? "edit" : "add_new"}`, "Success"),
        );
        onOpenChange(false);
      }
    }
  }, [fetcher.state, fetcher.data, onOpenChange, t, lead]);

  const onSubmit = (data: FormValues) => {
    const method = lead ? "PUT" : "POST";
    const action = lead ? `/api/leads/${lead.id}` : "/api/leads";
    fetcher.submit(data, { method, action, encType: "application/json" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`p-0 bg-card border-border shadow-xl transition-all duration-300 flex flex-col ${
          isMaximized
            ? "w-[85vw] max-w-none h-[90vh]"
            : "sm:max-w-[650px] max-h-[90vh]"
        }`}
      >
        <div className="absolute right-12 top-3 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsMaximized(!isMaximized)}
            className="h-6 w-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle Size</span>
          </Button>
        </div>

        <DialogHeader className="px-8 pt-8 pb-4 shrink-0">
          <div className="space-y-1.5 text-start">
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              {lead
                ? t("leads.actions.edit", "Edit Lead")
                : t("leads.actions.add_new", "Add Lead")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {lead
                ? "Update the details for this lead."
                : "Enter the details to create a new lead."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Scrollable Form Body */}
            <div className="px-8 pb-6 pt-2 overflow-y-auto flex-1 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("leads.fields.name", "Name")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("leads.fields.phone", "Phone")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="+971XXXXXXXXX"
                          className="rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("leads.fields.email", "Email")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("leads.fields.status", "Status")}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-lg border-border bg-transparent focus:ring-1 focus:ring-offset-0 focus:ring-accent transition-colors">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="New">
                            {t("leads.status.New", "New")}
                          </SelectItem>
                          <SelectItem value="Contacted">
                            {t("leads.status.Contacted", "Contacted")}
                          </SelectItem>
                          <SelectItem value="Viewing">
                            {t("leads.status.Viewing", "Viewing")}
                          </SelectItem>
                          <SelectItem value="Negotiation">
                            {t("leads.status.Negotiation", "Negotiation")}
                          </SelectItem>
                          <SelectItem value="Won">
                            {t("leads.status.Won", "Won")}
                          </SelectItem>
                          <SelectItem value="Lost">
                            {t("leads.status.Lost", "Lost")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("leads.fields.source", "Source")}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-lg border-border bg-transparent focus:ring-1 focus:ring-offset-0 focus:ring-accent transition-colors">
                            <SelectValue placeholder="Select Source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WhatsApp">
                            {t("leads.source.WhatsApp", "WhatsApp")}
                          </SelectItem>
                          <SelectItem value="Website">
                            {t("leads.source.Website", "Website")}
                          </SelectItem>
                          <SelectItem value="Referral">
                            {t("leads.source.Referral", "Referral")}
                          </SelectItem>
                          <SelectItem value="Other">
                            {t("leads.source.Other", "Other")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("leads.fields.message", "Message")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        className="resize-none rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("leads.fields.notes", "Internal Notes")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={2}
                        placeholder={
                          t(
                            "leads.fields.notes_placeholder",
                            "Internal notes, not visible to the client...",
                          ) as string
                        }
                        className="resize-none rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="follow_up_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("leads.fields.follow_up_date", "Follow-up Date")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Sticky Action Footer (matches PropertyForm) ── */}
            <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-border/50 shrink-0 bg-card">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-10 px-5 rounded-lg font-medium text-muted-foreground hover:text-foreground"
              >
                {t("common.actions.cancel", "Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-8 rounded-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm min-w-[120px] transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("common.actions.save", "Save")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
