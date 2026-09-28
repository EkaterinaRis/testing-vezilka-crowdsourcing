import { useEffect, useState } from "react";
import SidebarButton from "./SidebarButton";
import {
  LayoutDashboard,
  Upload,
  SquareCheckBig,
  Gift,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { clearAuth, userCanReview } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";

export default function Sidebar({ activeButtonIndex = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [canReview, setCanReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewStatus = async () => {
      try {
        const result = await userCanReview();
        setCanReview(result);
      } catch {
        setCanReview(false);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewStatus();
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  if (loading) {
    return <Spinner />;
  }

  const mobileNavItems = [
    { icon: LayoutDashboard, label: "Табла", href: "/dashboard", index: 0 },
    { icon: Upload, label: "Прикачи", href: "/upload", index: 1 },
    ...(canReview
      ? [{ icon: SquareCheckBig, label: "Прегледај", href: "/admin", index: 2 }]
      : []),
    { icon: Gift, label: "Награди", href: "/rewards", index: 3 },
    { icon: User, label: "Профил", href: "/profile", index: 4 },
  ];

  return (
    <>
      <aside
        style={{ transition: "width 300ms ease, padding 300ms ease" }}
        className="flex-col hidden overflow-hidden border-r lg:flex border-border bg-card"
      >
        <div
          style={{
            width: collapsed ? "64px" : "256px",
            padding: collapsed ? "12px" : "24px",
            transition: "width 300ms ease, padding 300ms ease",
          }}
          className="flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-10">
            <a
              href="/"
              style={{
                maxWidth: collapsed ? "0px" : "200px",
                opacity: collapsed ? 0 : 1,
                overflow: "hidden",
                whiteSpace: "nowrap",
                transition: "max-width 300ms ease, opacity 300ms ease",
              }}
              className="text-xl font-bold text-gradient"
            >
              <img
                className="object-contain w-auto h-8"
                src="/public/vezilka-logo-horizontal-transparent.png"
              ></img>
            </a>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarButton
              isActive={activeButtonIndex === 0}
              Icon={LayoutDashboard}
              collapsed={collapsed}
              href="/dashboard"
            >
              Контролна табла
            </SidebarButton>
            <SidebarButton
              isActive={activeButtonIndex === 1}
              Icon={Upload}
              collapsed={collapsed}
              href="/upload"
            >
              Прикачи
            </SidebarButton>
            {canReview && (
              <SidebarButton
                isActive={activeButtonIndex === 2}
                Icon={SquareCheckBig}
                collapsed={collapsed}
                href="/admin"
              >
                Прегледај
              </SidebarButton>
            )}
            <SidebarButton
              isActive={activeButtonIndex === 3}
              Icon={Gift}
              collapsed={collapsed}
              href="/rewards"
            >
              Награди
            </SidebarButton>
            <SidebarButton
              isActive={activeButtonIndex === 4}
              Icon={User}
              collapsed={collapsed}
              href="/profile"
            >
              Профил
            </SidebarButton>
          </nav>

          <button
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer"
            title={collapsed ? "Одјави се" : undefined}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span
              style={{
                maxWidth: collapsed ? "0px" : "200px",
                opacity: collapsed ? 0 : 1,
                overflow: "hidden",
                whiteSpace: "nowrap",
                transition: "max-width 300ms ease, opacity 300ms ease",
              }}
            >
              Одјави се
            </span>
          </button>
        </div>
      </aside>

      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 border-b h-14 bg-card border-border lg:hidden">
        <a href="/" className="text-lg font-bold text-gradient">
          Везилка
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Одјави се</span>
        </button>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t bg-card border-border lg:hidden">
        {mobileNavItems.map(({ icon: Icon, label, href, index }) => {
          const isActive = activeButtonIndex === index;
          return (
            <a
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors
                ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`}
              />
              <span className="leading-none">{label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </a>
          );
        })}
      </nav>
    </>
  );
}
