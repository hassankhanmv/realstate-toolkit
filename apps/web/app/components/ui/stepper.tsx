import * as React from "react";
import { cn } from "@/lib/utils";

interface StepperContextValue {
  activeStep: number;
  onStepClick?: (step: number) => void;
}

const StepperContext = React.createContext<StepperContextValue | undefined>(
  undefined,
);

function useStepper() {
  const context = React.useContext(StepperContext);
  if (!context) throw new Error("useStepper must be used within a <Stepper />");
  return context;
}

interface StepContextValue {
  step: number;
  state: "active" | "completed" | "error" | "inactive";
}

const StepContext = React.createContext<StepContextValue | undefined>(
  undefined,
);

function useStep() {
  const context = React.useContext(StepContext);
  if (!context)
    throw new Error("useStep must be used within a <StepperItem />");
  return context;
}

// ── Stepper Wrapper ──────────────────────────────────────────────────────────

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep: number;
  onStepClick?: (step: number) => void;
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ activeStep, onStepClick, className, children, ...props }, ref) => {
    return (
      <StepperContext.Provider value={{ activeStep, onStepClick }}>
        <div
          ref={ref}
          className={cn(
            "relative flex items-center justify-between w-full px-6",
            className,
          )}
          {...props}
        >
          {/* Background Connecting Line */}
          <div className="absolute left-[15%] right-[15%] top-5 h-0.5 bg-border -z-10" />
          {children}
        </div>
      </StepperContext.Provider>
    );
  },
);
Stepper.displayName = "Stepper";

// ── Stepper Item ─────────────────────────────────────────────────────────────

export interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  hasError?: boolean;
}

const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
  ({ step, hasError, className, children, ...props }, ref) => {
    const { activeStep, onStepClick } = useStepper();

    const state = hasError
      ? "error"
      : activeStep === step
        ? "active"
        : activeStep > step
          ? "completed"
          : "inactive";

    return (
      <StepContext.Provider value={{ step, state }}>
        <div
          ref={ref}
          onClick={() => onStepClick?.(step)}
          className={cn(
            "flex flex-col items-center gap-2 bg-card px-3 cursor-pointer group",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </StepContext.Provider>
    );
  },
);
StepperItem.displayName = "StepperItem";

// ── Stepper Indicator (The Circle) ───────────────────────────────────────────

const StepperIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { state } = useStep();

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 group-hover:scale-105",
        {
          "border-accent bg-accent text-accent-foreground shadow-md":
            state === "active",
          "border-primary bg-primary text-primary-foreground":
            state === "completed",
          "border-destructive/60 bg-destructive/10 text-destructive":
            state === "error",
          "border-border bg-card text-muted-foreground group-hover:border-primary/50":
            state === "inactive",
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
StepperIndicator.displayName = "StepperIndicator";

// ── Stepper Title ────────────────────────────────────────────────────────────

const StepperTitle = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  const { state } = useStep();

  return (
    <span
      ref={ref}
      className={cn(
        "text-xs font-semibold uppercase tracking-wider transition-colors",
        {
          "text-foreground": state === "active" || state === "completed",
          "text-destructive/80": state === "error",
          "text-muted-foreground group-hover:text-foreground/70":
            state === "inactive",
        },
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
});
StepperTitle.displayName = "StepperTitle";

export { Stepper, StepperItem, StepperIndicator, StepperTitle };
