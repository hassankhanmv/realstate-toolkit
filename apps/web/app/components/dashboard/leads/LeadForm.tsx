import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Maximize2, Minimize2, History } from "lucide-react";

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
  defaultPropertyId?: string;
  properties?: Array<{ id: string; title: string }>;
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
  properties = [],
}: LeadFormProps) {
  const { t } = useTranslation();
  const formFetcher = useFetcher();
  const historyFetcher = useFetcher();
  const isSubmitting = formFetcher.state === "submitting";
  const [isMaximized, setIsMaximized] = useState(false);
  const wasSubmitting = useRef(false);

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
        // api/leads returns { data: newLead } or { data: updatedLead }
        toast.success(
          t(`leads.actions.${lead ? "edit" : "add_new"}`, "Success"),
        );
        onOpenChange(false);
      }
    }
  }, [formFetcher.state, formFetcher.data, onOpenChange, t, lead]);

  const onSubmit = (data: FormValues) => {
    const method = lead ? "PUT" : "POST";
    const action = lead ? `/api/leads/${lead.id}` : "/api/leads";
    formFetcher.submit(data, { method, action, encType: "application/json" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`p-0 bg-card border-border shadow-xl transition-all duration-300 flex flex-col ${
          isMaximized
            ? "w-[95vw] max-w-none h-[95vh]"
            : "sm:max-w-[650px] w-[95vw] h-[85vh] sm:h-[700px] max-h-[90vh]"
        }`}
      >
        <div className="absolute right-12 top-3 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsMaximized(!isMaximized)}
            className="h-8 w-8 rounded-full opacity-70 transition-colors hover:opacity-100 focus:outline-none hover:bg-muted cursor-pointer"
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

        <DialogHeader className="px-8 pt-6 pb-2 shrink-0 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="space-y-1 text-start">
              <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                {lead
                  ? t("leads.actions.edit", "Edit Lead")
                  : t("leads.actions.add_new", "Add Lead")}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {lead
                  ? "Update details or view history."
                  : "Enter details for a new lead."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {lead ? (
          <Tabs
            defaultValue="details"
            className="flex flex-col flex-1 overflow-hidden"
            onValueChange={(val) => {
              if (
                val === "history" &&
                historyFetcher.state === "idle" &&
                !historyFetcher.data?.events
              ) {
                historyFetcher.load(`/api/leads/${lead.id}/events`);
              }
            }}
          >
            <div className="px-8 pt-3 pb-0 shrink-0 border-b border-border/40">
              <TabsList className="h-9 p-0 bg-transparent border-none w-full justify-start gap-6">
                <TabsTrigger
                  value="details"
                  className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 font-medium text-muted-foreground shadow-none data-[state=active]:border-accent data-[state=active]:text-foreground data-[state=active]:shadow-none select-none cursor-pointer hover:text-foreground transition-colors"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 font-medium text-muted-foreground shadow-none data-[state=active]:border-accent data-[state=active]:text-foreground data-[state=active]:shadow-none select-none cursor-pointer hover:text-foreground transition-colors"
                >
                  History
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="details"
              className="flex flex-col flex-1 overflow-hidden m-0 data-[state=inactive]:hidden outline-none"
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit as any)}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  {/* Scrollable Form Body */}
                  <div className="px-8 pb-6 pt-4 overflow-y-auto flex-1 space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("leads.fields.name", "Name")}
                          </FormLabel>
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
                            <FormLabel>
                              {t("leads.fields.phone", "Phone")}
                            </FormLabel>
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
                            <FormLabel>
                              {t("leads.fields.email", "Email")}
                            </FormLabel>
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
                </form>
              </Form>
            </TabsContent>

            <TabsContent
              value="history"
              className="flex flex-col flex-1 overflow-hidden m-0 data-[state=inactive]:hidden outline-none bg-muted/10 relative"
            >
              <div className="absolute top-4 right-8 z-20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    historyFetcher.load(`/api/leads/${lead.id}/events`)
                  }
                  className="h-8 gap-2 bg-background cursor-pointer"
                  disabled={historyFetcher.state !== "idle"}
                >
                  <History
                    className={`h-4 w-4 ${historyFetcher.state !== "idle" ? "animate-spin" : ""}`}
                  />
                  {t("common.refresh", "Refresh")}
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 border-t border-border/40">
                {historyFetcher.state !== "idle" &&
                !historyFetcher.data?.events ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : historyFetcher.data?.events?.length > 0 ? (
                  <div className="relative mt-8 space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {historyFetcher.data.events.map((event: any, i: number) => (
                      <div
                        key={event.id}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-accent text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          <History className="h-4 w-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border border-border p-4 rounded-xl shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm capitalize text-foreground">
                              {event.event_type.replace("_", " ")}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(event.created_at).toLocaleDateString()}{" "}
                              {new Date(event.created_at).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>
                          {event.old_value || event.new_value ? (
                            <div className="bg-muted/30 p-2.5 rounded-lg text-sm flex gap-3 items-center border border-border/40 mt-1">
                              {event.old_value && (
                                <span className="line-through text-muted-foreground decoration-muted-foreground/50">
                                  {event.old_value}
                                </span>
                              )}
                              {event.old_value && event.new_value && (
                                <span className="text-muted-foreground/60 text-xs text-center w-4 shrink-0">
                                  →
                                </span>
                              )}
                              {event.new_value && (
                                <span className="text-foreground font-medium bg-background px-1.5 py-0.5 rounded shadow-sm border border-border/60">
                                  {event.new_value}
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mt-8">
                      <History className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        No History Found
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Changes to this lead will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* SHARED FOOTER FOR BOTH TABS WHEN EDITING PROFILES */}
            <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-border/50 shrink-0 bg-card z-10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-10 px-5 rounded-lg font-medium text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {t("common.actions.cancel", "Cancel")}
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit as any)}
                disabled={isSubmitting}
                className="h-10 px-8 rounded-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm min-w-[120px] transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("common.actions.save", "Save")
                )}
              </Button>
            </div>
          </Tabs>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit as any)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="px-8 pb-6 pt-2 overflow-y-auto flex-1 space-y-4">
                {/* Scrollable Area goes here - the code above already includes it, but since we wrapped it we need the non-tabbed version for New leads */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("leads.fields.name", "Name")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John Doe"
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
                        <FormLabel>
                          {t("leads.fields.phone", "Phone")}
                        </FormLabel>
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
                        <FormLabel>
                          {t("leads.fields.email", "Email")}
                        </FormLabel>
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
                            <SelectItem value="Website">
                              {t("leads.source.Website", "Website")}
                            </SelectItem>
                            <SelectItem value="WhatsApp">
                              {t("leads.source.WhatsApp", "WhatsApp")}
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
                  name="property_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("leads.fields.property", "Property Assignment")}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-lg border-border bg-transparent focus:ring-1 focus:ring-offset-0 focus:ring-accent transition-colors">
                            <SelectValue placeholder="Assign to a property (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem
                            value="none"
                            className="italic text-muted-foreground"
                          >
                            Unassigned
                          </SelectItem>
                          {properties.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        {t("leads.fields.follow_up", "Follow-Up Date")}
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

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("leads.fields.message", "Initial Message")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="resize-none h-24 rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
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
                      <FormLabel>{t("leads.fields.notes", "Notes")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Optional internal notes..."
                          className="resize-none h-24 rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Fixed Footer */}
              <div className="border-t border-border/50 bg-muted/20 px-8 py-4 shrink-0 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent/90 text-white min-w-[100px] shadow-sm transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("common.saving", "Saving")}...</span>
                    </div>
                  ) : (
                    t("common.save", "Save Lead")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
