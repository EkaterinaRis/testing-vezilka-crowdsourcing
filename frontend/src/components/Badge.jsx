import * as React from "react";

const Badge = React.forwardRef(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    const variants = {
      default:
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 text-white",
      outline: "text-foreground",
    };

    const combinedClasses = [
      baseStyles,
      variants[variant] || variants.default,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <div ref={ref} className={combinedClasses} {...props} />;
  },
);

Badge.displayName = "Badge";

export default Badge;
