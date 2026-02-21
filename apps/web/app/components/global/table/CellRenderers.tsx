import { memo } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { MessageCircle, Phone, Mail, ExternalLink } from "lucide-react";

/* ─── Name Cell ─── */
interface NameCellProps {
  name: string;
}
export const NameCell = memo(function NameCell({ name }: NameCellProps) {
  return (
    <div className="font-medium truncate" title={name}>
      {name}
    </div>
  );
});

/* ─── Contact Cell (WhatsApp / Phone / Email icons) ─── */
interface ContactCellProps {
  phone?: string | null;
  email?: string | null;
}
export const ContactCell = memo(function ContactCell({
  phone,
  email,
}: ContactCellProps) {
  if (!phone && !email) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      {phone && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://wa.me/${phone}`, "_blank");
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">WhatsApp</p>
          </TooltipContent>
        </Tooltip>
      )}

      {phone && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`tel:${phone}`, "_self");
              }}
            >
              <Phone className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">{phone}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {email && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-zinc-600 hover:text-zinc-700 hover:bg-zinc-100"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`mailto:${email}`, "_self");
              }}
            >
              <Mail className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">{email}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
});

/* ─── Property Link Cell (blue text + ExternalLink icon) ─── */
interface PropertyLinkCellProps {
  propertyId?: string | null;
  title?: string | null;
}
export const PropertyLinkCell = memo(function PropertyLinkCell({
  propertyId,
  title,
}: PropertyLinkCellProps) {
  if (!title || !propertyId) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <Link
      to={`/dashboard/properties/${propertyId}`}
      className="group inline-flex items-center gap-1.5 max-w-[200px] hover:text-accent transition-colors"
      title={title}
    >
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-accent transition-colors" />
      <span className="truncate">{title}</span>
    </Link>
  );
});

/* ─── Status Badge Cell ─── */
import { Badge } from "@/components/ui/badge";
interface StatusBadgeCellProps {
  status: string;
  label: string;
}
export const StatusBadgeCell = memo(function StatusBadgeCell({
  status,
  label,
}: StatusBadgeCellProps) {
  // Determine color classes for outlined style (matching properties table)
  let colorClass = "";
  switch (status) {
    case "New":
      colorClass = "border-blue-300 text-blue-700 bg-blue-50/50";
      break;
    case "Contacted":
      colorClass = "border-amber-300 text-amber-700 bg-amber-50/50";
      break;
    case "Viewing":
      colorClass = "border-purple-300 text-purple-700 bg-purple-50/50";
      break;
    case "Negotiation":
      colorClass = "border-cyan-300 text-cyan-700 bg-cyan-50/50";
      break;
    case "Won":
      colorClass = "border-green-300 text-green-700 bg-green-50/50";
      break;
    case "Lost":
      colorClass = "border-red-300 text-red-700 bg-red-50/50";
      break;
    default:
      colorClass = "border-border text-muted-foreground";
  }
  return (
    <Badge variant="outline" className={colorClass}>
      {label}
    </Badge>
  );
});

/* ─── Date Cell ─── */
interface DateCellProps {
  date: string;
  locale?: string;
}
export const DateCell = memo(function DateCell({
  date,
  locale = "en-US",
}: DateCellProps) {
  const d = new Date(date);
  return (
    <span>
      {d.toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </span>
  );
});
