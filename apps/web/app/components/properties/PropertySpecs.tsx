import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import { type PropertyFormValues } from "@/validations/property";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const inputBaseClasses = "h-11 rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors";
const errorClasses = "text-[11px] font-semibold text-red-500 mt-1";

export function PropertySpecs({ form }: { form: UseFormReturn<PropertyFormValues> }) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="specifications.bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                {t("properties.fields.bedrooms")}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className={inputBaseClasses}
                  min={0}
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormMessage className={errorClasses} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specifications.bathrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                {t("properties.fields.bathrooms")}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className={inputBaseClasses}
                  min={0}
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormMessage className={errorClasses} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specifications.area"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                {t("properties.fields.area")} (sqft)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className={inputBaseClasses}
                  min={0}
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormMessage className={errorClasses} />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="specifications.furnished"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-3 rounded-lg border border-border bg-transparent p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="h-5 w-5 mb-0 cursor-pointer rounded-md border-muted-foreground data-[state=checked]:bg-accent data-[state=checked]:border-accent focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0"
              />
            </FormControl>
            <FormLabel className="!mt-0 cursor-pointer text-sm font-medium text-foreground">
              {t("properties.fields.furnished")}
            </FormLabel>
          </FormItem>
        )}
      />
    </div>
  );
}