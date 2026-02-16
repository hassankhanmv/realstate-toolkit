"use client";

import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Persist direction change to documentElement
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            className,
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={cn(
            i18n.language === "en" && "bg-accent/10 text-accent-foreground",
          )}
        >
          <span className="flex items-center w-full">
            English
            {i18n.language === "en" && (
              <Check className="ms-auto h-4 w-4 text-accent" />
            )}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("ar")}
          className={cn(
            i18n.language === "ar" && "bg-accent/10 text-accent-foreground",
          )}
        >
          <span className="flex items-center w-full">
            العربية
            {i18n.language === "ar" && (
              <Check className="ms-auto h-4 w-4 text-accent" />
            )}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
