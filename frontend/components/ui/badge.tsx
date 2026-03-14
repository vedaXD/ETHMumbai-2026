import * as React from "react"
import { cn } from "../../lib/utils"

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: string }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}
      {...props}
    />
  )
}

export { Badge, Badge as badgeVariants }
