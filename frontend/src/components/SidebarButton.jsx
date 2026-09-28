export default function SidebarButton({
  children,
  isActive,
  Icon,
  collapsed,
  href,
}) {
  return (
    <a
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
      href={href}
      title={collapsed ? children : undefined}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span
        style={{
          maxWidth: collapsed ? "0px" : "200px",
          opacity: collapsed ? 0 : 1,
          overflow: "hidden",
          whiteSpace: "nowrap",
          transition: "max-width 300ms ease, opacity 300ms ease",
        }}
      >
        {children}
      </span>
    </a>
  );
}
