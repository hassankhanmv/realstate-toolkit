import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import {
  type PropertyFormValues,
  PROPERTY_TYPES,
  PROPERTY_STATUSES,
} from "@/validations/property";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const inputBaseClasses =
  "h-9 text-sm text-foreground rounded-md border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors";
const errorClasses = "text-[11px] font-semibold text-red-500 mt-1";

export function PropertyBasicInfo({
  form,
}: {
  form: UseFormReturn<PropertyFormValues>;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6">
      <FormField
        control={form.control}
        name="basicInfo.title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">
              {t("properties.fields.title")}
            </FormLabel>
            <FormControl>
              <Input
                className={inputBaseClasses}
                placeholder="e.g. Modern 2BR in Downtown"
                {...field}
              />
            </FormControl>
            <FormMessage className={errorClasses} />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="basicInfo.price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                {t("properties.fields.price")} (AED)
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
          name="basicInfo.location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                {t("properties.fields.location")}
              </FormLabel>
              <FormControl>
                <Input
                  className={inputBaseClasses}
                  placeholder="e.g. Dubai Marina"
                  {...field}
                />
              </FormControl>
              <FormMessage className={errorClasses} />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="basicInfo.type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                {t("properties.fields.type")}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    className={`cursor-pointer ${inputBaseClasses}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                      className="cursor-pointer"
                    >
                      {t(`properties.types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className={errorClasses} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="basicInfo.status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                {t("properties.fields.status")}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    className={`cursor-pointer ${inputBaseClasses}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROPERTY_STATUSES.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="cursor-pointer"
                    >
                      {t(`properties.statuses.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className={errorClasses} />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
