
import { useTheme } from "@/contexts/ThemeContext";
import { Toaster as Sonner } from "sonner";
import { mapToSonnerTheme } from "@/lib/theme-utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme, resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={mapToSonnerTheme(theme, resolvedTheme)}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg focus-ring",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground focus-ring",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground focus-ring",
          closeButton:
            "group-[.toast]:text-foreground/50 group-[.toast]:hover:text-foreground focus-ring",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
