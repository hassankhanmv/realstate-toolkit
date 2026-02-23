import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import { type PropertyFormValues } from "@/validations/property";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const errorClasses = "text-[11px] font-semibold text-red-500 mt-1";

export function PropertyPublishing({
  form,
}: {
  form: UseFormReturn<PropertyFormValues>;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6">
      <FormField
        control={form.control}
        name="publishing.is_published"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border bg-transparent p-4">
            <div>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("properties.fields.is_published")}
              </FormLabel>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Make this listing visible to clients
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="cursor-pointer data-[state=checked]:bg-accent focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="publishing.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">
              {t("properties.fields.description")}
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the property..."
                className="min-h-[140px] resize-none rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
                {...field}
              />
            </FormControl>
            <FormMessage className={errorClasses} />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="publishing.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">
              {t("properties.fields.notes")}
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Internal notes, not visible to clients..."
                className="min-h-[100px] resize-none rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
                {...field}
              />
            </FormControl>
            <FormMessage className={errorClasses} />
          </FormItem>
        )}
      />
    </div>
  );
}
