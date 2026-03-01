import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonProps {
  title: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, url, className }: ShareButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`${title}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }, [title, shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // User cancelled
      }
    }
  }, [title, shareUrl]);

  // Use native share on mobile if available
  if (typeof navigator !== "undefined" && navigator.share) {
    return (
      <button
        onClick={handleNativeShare}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground border border-border/60 rounded-lg transition-colors ${className}`}
      >
        <Share2 className="h-4 w-4" />
        {t("portal.detail.share", "Share")}
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground border border-border/60 rounded-lg transition-colors ${className}`}
        >
          <Share2 className="h-4 w-4" />
          {t("portal.detail.share", "Share")}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleWhatsApp} className="gap-2.5">
          <MessageCircle className="h-4 w-4 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy} className="gap-2.5">
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied
            ? t("portal.detail.copied", "Copied!")
            : t("portal.detail.copy_link", "Copy Link")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
