import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  propertySchema,
  type PropertyFormValues,
} from "@/validations/property";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Stepper,
  StepperItem,
  StepperIndicator,
  StepperTitle,
} from "@/components/ui/stepper";
import {
  Loader2,
  Home,
  Settings2,
  Globe,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Building2,
  Info,
  AlertTriangle,
} from "lucide-react";
import { PropertyMedia } from "./PropertyMedia";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Townhouse",
  "Office",
  "Plot",
  "Commercial",
] as const;
const PROPERTY_STATUSES = [
  "For Sale",
  "For Rent",
  "Off-Plan",
  "Ready",
] as const;

interface PropertyFormProps {
  defaultValues?: Partial<PropertyFormValues>;
  onSubmit: (data: PropertyFormValues) => Promise<void>;
  isLoading?: boolean;
  onCancel: () => void;
}

type FieldName =
  | `basicInfo.${keyof PropertyFormValues["basicInfo"]}`
  | `specifications.${keyof PropertyFormValues["specifications"]}`
  | `publishing.${keyof PropertyFormValues["publishing"]}`
  | `media.${keyof PropertyFormValues["media"]}`
  | "uae.handover_date"
  | "uae.payment_plan"
  | "uae.rera_id"
  | "uae.roi_estimate";

interface StepConfig {
  id: string;
  labelKey: string;
  icon: any;
  fields: FieldName[];
}

// Ensure these perfectly match the fields rendered in each UI block below!
const BASE_STEPS: StepConfig[] = [
  {
    id: "basicInfo",
    labelKey: "properties.basics",
    icon: Home,
    fields: [
      "basicInfo.title",
      "basicInfo.price",
      "basicInfo.location",
      "basicInfo.type",
      "basicInfo.status",
    ],
  },
  {
    id: "specifications",
    labelKey: "properties.details",
    icon: Settings2,
    fields: [
      "specifications.bedrooms",
      "specifications.bathrooms",
      "specifications.area",
      "specifications.furnished",
    ],
  },
  {
    id: "media",
    labelKey: "properties.media",
    icon: ImagePlus,
    fields: ["media.urls", "media.media_urls"],
  },
  {
    id: "publishing",
    labelKey: "properties.publishing",
    icon: Globe,
    fields: [
      "publishing.is_published",
      "publishing.description",
      "publishing.notes",
    ],
  },
];

const UAE_STEP: StepConfig = {
  id: "uae",
  labelKey: "properties.off_plan_details",
  icon: Building2,
  fields: [
    "uae.handover_date",
    "uae.payment_plan",
    "uae.rera_id",
    "uae.roi_estimate",
  ],
};

export function PropertyForm({
  defaultValues,
  onSubmit,
  isLoading,
  onCancel,
}: PropertyFormProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const defaultFormState: PropertyFormValues = {
    basicInfo: {
      title: "",
      price: 0,
      location: "",
      type: "Apartment",
      status: "For Sale",
    },
    specifications: { bedrooms: 0, bathrooms: 0, area: 0, furnished: false },
    publishing: { description: "", is_published: true, notes: "" },
    media: { urls: [], media_urls: [] },
    uae: {},
  };

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: defaultValues || defaultFormState,
  });

  // Show Off-Plan step only when status is Off-Plan
  const watchedStatus = form.watch("basicInfo.status");
  const STEPS =
    watchedStatus === "Off-Plan"
      ? [...BASE_STEPS.slice(0, 3), UAE_STEP, BASE_STEPS[3]]
      : BASE_STEPS;

  // Only reset form when the actual property being edited changes, not on re-render
  const defaultsKey = JSON.stringify(defaultValues);
  useEffect(() => {
    form.reset(defaultValues || defaultFormState);
    setCurrentStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsKey]);

  const {
    formState: { errors },
  } = form;

  const handleStepChange = async (targetIndex: number) => {
    if (targetIndex < currentStep) {
      setCurrentStep(targetIndex);
    } else if (targetIndex > currentStep) {
      const fields = STEPS[currentStep].fields;
      const isStepValid = await form.trigger(fields);
      if (isStepValid) setCurrentStep(targetIndex);
    }
  };

  const handleNext = async () => {
    const fields = STEPS[currentStep].fields;
    const isStepValid = await form.trigger(fields);
    if (isStepValid)
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const inputBaseClasses =
    "h-9 text-sm text-foreground rounded-md border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors";
  const errorClasses = "text-[11px] font-semibold text-red-500 mt-1";

  return (
    <Form {...(form as any)} className="h-[100%]">
      <form
        id="property-form"
        onSubmit={form.handleSubmit(onSubmit as any)}
        className="flex flex-col gap-2 h-full"
      >
        {/* ── Reusable Custom Stepper ── */}
        <Stepper
          activeStep={currentStep}
          onStepClick={handleStepChange}
          className="mb-2"
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > index;
            // Check if ANY field in this specific step has an error
            const hasError = step.fields.some((f) => {
              const [domain, field] = f.split(".");
              return !!(errors as any)[domain]?.[field];
            });

            return (
              <StepperItem key={step.id} step={index} hasError={hasError}>
                <StepperIndicator>
                  {hasError ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </StepperIndicator>
                <StepperTitle>{t(step.labelKey)}</StepperTitle>
              </StepperItem>
            );
          })}
        </Stepper>

        {/* ── Form Fields (scrollable) ── */}
        <div className="space-y-5 min-h-0 flex-1 overflow-y-auto mt-6">
          {/* Step 0: Basic Info (Title, Price, Location, Type, Status) */}
          {STEPS[currentStep]?.id === "basicInfo" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="basicInfo.price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        {t("properties.fields.price")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className={inputBaseClasses}
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                            )
                          }
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="basicInfo.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        {t("properties.fields.type")}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
          )}

          {/* Step 1: Specifications (Beds, Baths, Area, Furnished) */}
          {STEPS[currentStep]?.id === "specifications" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-3 gap-4">
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
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                            )
                          }
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
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                            )
                          }
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
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                            )
                          }
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
                    <FormLabel className="!mt-0 cursor-pointer text-sm font-medium">
                      {t("properties.fields.furnished")}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Media (Upload & URLs) */}
          {STEPS[currentStep]?.id === "media" && <PropertyMedia />}

          {/* UAE / Off-Plan Step */}
          {STEPS[currentStep]?.id === "uae" && (
            <TooltipProvider delayDuration={200}>
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <FormField
                  control={form.control}
                  name="uae.handover_date"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-1.5">
                        <FormLabel className="text-foreground">
                          {t("properties.fields.handover_date")}
                        </FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {t("properties.hints.handover_date")}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Input
                          type="date"
                          className={inputBaseClasses}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className={errorClasses} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="uae.rera_id"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-1.5">
                        <FormLabel className="text-foreground">
                          {t("properties.fields.rera_id")}
                        </FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {t("properties.hints.rera_id")}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="e.g. 12345"
                          className={inputBaseClasses}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className={errorClasses} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="uae.roi_estimate"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-1.5">
                        <FormLabel className="text-foreground">
                          {t("properties.fields.roi_estimate")}
                        </FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {t("properties.hints.roi_estimate")}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 7.5"
                          className={inputBaseClasses}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber || undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage className={errorClasses} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="uae.payment_plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        {t("properties.fields.payment_plan")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("properties.hints.payment_plan")}
                          className="min-h-[100px] resize-none rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className={errorClasses} />
                    </FormItem>
                  )}
                />
              </div>
            </TooltipProvider>
          )}

          {/* Publishing Step */}
          {STEPS[currentStep]?.id === "publishing" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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
                        className="min-h-[120px] resize-none rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
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
                        className="min-h-[120px] resize-none rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={errorClasses} />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* ── Action Footer ── */}
        <div className="flex items-center justify-between pt-5 border-t border-border/50 mt-auto">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handlePrevious}
              className="h-9 w-9 rounded-md bg-secondary/60 hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180 text-foreground" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleNext}
              disabled={currentStep === STEPS.length - 1}
              className="h-9 w-9 rounded-md bg-secondary/60 hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180 text-foreground" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="h-9 px-4 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t("properties.cancel")}
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-9 px-6 rounded-md text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm min-w-[100px] transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("properties.save")
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
