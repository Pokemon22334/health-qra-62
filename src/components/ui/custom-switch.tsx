
import React from "react";
import { Switch, SwitchProps } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface CustomSwitchProps extends Omit<SwitchProps, "size"> {
  size?: "default" | "sm" | "lg";
}

const CustomSwitch = React.forwardRef<HTMLButtonElement, CustomSwitchProps>(
  ({ size = "default", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-3 w-6",
      default: "h-5 w-10",
      lg: "h-6 w-12",
    };

    return (
      <Switch
        ref={ref}
        className={cn(sizeClasses[size], className)}
        {...props}
      />
    );
  }
);

CustomSwitch.displayName = "CustomSwitch";

export { CustomSwitch };
