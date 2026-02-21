import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TEMPLATES = [
  { key: "initial_contact", label: "Initial Contact" },
  { key: "follow_up", label: "Follow-Up" },
  { key: "viewing_invite", label: "Viewing Invite" },
  { key: "price_update", label: "Price Update" },
];

interface WhatsAppTemplateProps {
  phone: string;
  name: string;
  propertyTitle?: string;
}

// Compact icon button with popover menu instead of a wide Select dropdown
export const WhatsAppTemplateButton = memo(function WhatsAppTemplateButton({
  phone,
  name,
  propertyTitle,
}: WhatsAppTemplateProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleSend = (templateKey: string) => {
    const message = t(`leads.templates.${templateKey}`, {
      name,
      property: propertyTitle || "your property",
    });
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{t("leads.templates.title")}</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-44 p-1"
        onClick={(e) => e.stopPropagation()}
      >
        {TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.key}
            type="button"
            className="w-full text-left text-xs px-2.5 py-1.5 rounded-sm hover:bg-secondary cursor-pointer transition-colors"
            onClick={() => handleSend(tmpl.key)}
          >
            {tmpl.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
});
