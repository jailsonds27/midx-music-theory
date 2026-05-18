import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tabsListVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      default: "w-full rounded-xl bg-muted p-1",
      line: "w-full border-b border-border bg-transparent p-0",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center text-sm font-medium whitespace-nowrap transition focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "flex-1 rounded-lg px-3 py-1.5 text-[15px] text-muted-foreground data-[active]:bg-background data-[active]:font-semibold data-[active]:text-foreground",
        line: "flex-1 rounded-none border-b-2 border-transparent px-3 py-2 text-[15px] font-normal data-[active]:border-black data-[active]:font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root className={className} {...props} />
}

type TabsListProps = TabsPrimitive.List.Props &
  VariantProps<typeof tabsListVariants>

function TabsList({ className, variant, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

type TabsTriggerProps = TabsPrimitive.Tab.Props &
  VariantProps<typeof tabsTriggerVariants>

function TabsTrigger({ className, variant, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Tab
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel className={className} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
