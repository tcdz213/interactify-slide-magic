import { Button } from "@/components/ui/button"
import { Store, Info, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickShortcutsProps {
  businessId: string
  businessName: string
  className?: string
}

export const QuickShortcuts = ({ businessId, businessName, className }: QuickShortcutsProps) => {
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2.5",
      "bg-gray-50/80 dark:bg-gray-900/30 border-b border-gray-200/50 dark:border-gray-800/50",
      className
    )}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 rounded-full text-[13px] font-medium gap-1.5 hover:bg-white dark:hover:bg-gray-800"
        onClick={() => console.log('View listings for', businessId)}
      >
        <Store className="h-4 w-4" />
        View Listings
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 rounded-full text-[13px] font-medium gap-1.5 hover:bg-white dark:hover:bg-gray-800"
        onClick={() => console.log('View contact info for', businessId)}
      >
        <Info className="h-4 w-4" />
        Contact Info
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 rounded-full text-[13px] font-medium gap-1.5 hover:bg-white dark:hover:bg-gray-800"
        onClick={() => console.log('Visit website for', businessId)}
      >
        <Globe className="h-4 w-4" />
        Visit Website
      </Button>
    </div>
  )
}
