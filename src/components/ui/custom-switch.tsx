
import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface CustomSwitchProps extends React.ComponentPropsWithoutRef<typeof Switch> {
  size?: 'default' | 'sm' | 'lg'
}

const sizeClasses = {
  default: "h-6 w-11",
  sm: "h-5 w-9",
  lg: "h-7 w-14"
}

const CustomSwitch = React.forwardRef<HTMLButtonElement, CustomSwitchProps>(
  ({ className, size = 'default', ...props }, ref) => {
    return (
      <Switch
        className={cn(size && sizeClasses[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
CustomSwitch.displayName = "CustomSwitch"

export { CustomSwitch }
