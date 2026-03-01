import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const inquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  message: z.string().min(5, "Message is required"),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface InquiryFormProps {
  propertyId: string;
  propertyTitle?: string;
  userId?: string | null;
  userName?: string;
  userEmail?: string;
}

export function InquiryForm({
  propertyId,
  propertyTitle,
  userId,
  userName,
  userEmail,
}: InquiryFormProps) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: userName ?? "",
      email: userEmail ?? "",
      phone: "",
      message: propertyTitle
        ? t("portal.inquiry.default_message", {
            title: propertyTitle,
            defaultValue: `I'm interested in "${propertyTitle}". Please send me more details.`,
          })
        : "",
    },
  });

  const onSubmit = useCallback(
    async (data: InquiryFormData) => {
      setSubmitting(true);

      try {
        const res = await fetch("/api/portal/inquire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            propertyId,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to submit inquiry");
        }

        toast.success(
          t(
            "portal.inquiry.success",
            "Inquiry sent successfully! An agent will contact you shortly.",
          ),
          {
            style: {
              background: "#302B25",
              color: "#fff",
              border: "none",
            },
          },
        );
        reset();
      } catch {
        toast.error(
          t(
            "portal.inquiry.error",
            "Failed to send inquiry. Please try again.",
          ),
          {
            style: {
              background: "#7f1d1d",
              color: "#fff",
              border: "none",
            },
          },
        );
      } finally {
        setSubmitting(false);
      }
    },
    [propertyId, reset, t],
  );

  return (
    <div className="bg-white border border-border/60 rounded-lg p-6">
      {/* Gold accent line */}
      <div className="w-10 h-0.5 bg-[#C4903D] rounded mb-4" />

      <h3 className="text-[17px] font-bold text-foreground mb-1 tracking-tight">
        {t("portal.inquiry.title", "Interested in this property?")}
      </h3>
      <p className="text-[13px] text-muted-foreground mb-5 leading-relaxed">
        {t(
          "portal.inquiry.subtitle",
          "Send your inquiry and an agent will get back to you.",
        )}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="inquiry-name" className="text-[13px] font-semibold">
            {t("portal.inquiry.name", "Full Name")} *
          </Label>
          <Input
            id="inquiry-name"
            {...register("name")}
            placeholder={t("portal.inquiry.name_placeholder", "Your name")}
            className="h-10 text-[14px] border-border/60 focus:border-[#C4903D] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {errors.name && (
            <p className="text-[12px] text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inquiry-email" className="text-[13px] font-semibold">
            {t("portal.inquiry.email", "Email")} *
          </Label>
          <Input
            id="inquiry-email"
            type="email"
            {...register("email")}
            placeholder={t(
              "portal.inquiry.email_placeholder",
              "your@email.com",
            )}
            className="h-10 text-[14px] border-border/60 focus:border-[#C4903D] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {errors.email && (
            <p className="text-[12px] text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inquiry-phone" className="text-[13px] font-semibold">
            {t("portal.inquiry.phone", "Phone")}
          </Label>
          <Input
            id="inquiry-phone"
            type="tel"
            {...register("phone")}
            placeholder={t(
              "portal.inquiry.phone_placeholder",
              "+971 50 000 0000",
            )}
            className="h-10 text-[14px] border-border/60 focus:border-[#C4903D] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="inquiry-message"
            className="text-[13px] font-semibold"
          >
            {t("portal.inquiry.message", "Message")} *
          </Label>
          <Textarea
            id="inquiry-message"
            {...register("message")}
            placeholder={t(
              "portal.inquiry.message_placeholder",
              "Tell us what you're looking for...",
            )}
            rows={3}
            className="text-[14px] border-border/60 focus:border-[#C4903D] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {errors.message && (
            <p className="text-[12px] text-destructive">
              {errors.message.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-[#302B25] hover:bg-[#3d352c] text-white font-semibold text-[14px] rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {t("portal.inquiry.submit", "Send Inquiry")}
        </button>
      </form>
    </div>
  );
}
