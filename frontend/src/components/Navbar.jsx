import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { getUser, clearAuth } from "../utils/auth";

function Avatar({ user, size = "md" }) {
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-8 h-8 text-xs";

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={`${user.firstName} ${user.lastName}`}
        className={`${sz} rounded-full object-cover ring-2 ring-border`}
      />
    );
  }

  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-semibold text-primary-foreground shrink-0`}
      style={{ background: "var(--hero-gradient)" }}
    >
      {initials}
    </div>
  );
}

function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors hover:bg-muted group"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar user={user} />
        <span className="text-sm font-medium text-foreground hidden lg:block max-w-[120px] truncate">
          {user.firstName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 w-56 mt-2 overflow-hidden border shadow-lg rounded-xl border-border bg-popover"
          style={{ boxShadow: "var(--card-shadow-hover)" }}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-border bg-muted/40">
            <div className="flex items-center gap-3">
              <Avatar user={user} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs truncate text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            <MenuItem
              icon={LayoutDashboard}
              label="Контролна табла"
              onClick={() => {
                setOpen(false);
                navigate("/dashboard");
              }}
            />
            <MenuItem
              icon={User}
              label="Профил"
              onClick={() => {
                setOpen(false);
                navigate("/profile");
              }}
            />
          </div>

          <div className="p-1.5 border-t border-border">
            <MenuItem
              icon={LogOut}
              label="Одјава"
              onClick={handleLogout}
              destructive
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, destructive = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left cursor-pointer
        ${
          destructive
            ? "text-destructive hover:bg-destructive/8"
            : "text-foreground hover:bg-muted"
        }`}
    >
      <Icon className="w-4 h-4 shrink-0 opacity-70" />
      {label}
    </button>
  );
}

export default function Navbar() {
  const user = getUser();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleScrollNavigation = (sectionId) => {
    setOpen(false);
    if (location.pathname === "/") {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate(`/#${sectionId}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg border-border">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <NavLink to="/" className="text-xl font-bold text-gradient">

          <img
            className="object-contain w-auto h-8"
            src="/public/vezilka-logo-horizontal-transparent.png"
          ></img>
        </NavLink>

        <div className="items-center hidden gap-1 md:flex">
          <button
            onClick={() => handleScrollNavigation("how-it-works")}
            className="px-3 py-1.5 text-sm rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Како функционира
          </button>

          <button
            onClick={() => handleScrollNavigation("features")}
            className="px-3 py-1.5 text-sm rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Можности
          </button>

          <NavLink
            to="/public-files"
            className="px-3 py-1.5 text-sm rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Податоци
          </NavLink>

          <div className="w-px h-5 mx-2 bg-border" />

          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login">
                <Button variant="ghost" size="sm">
                  Најава
                </Button>
              </NavLink>
              <NavLink to="/register">
                <Button size="sm">Започни</Button>
              </NavLink>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user && <Avatar user={user} size="sm" />}
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t md:hidden border-border bg-background">
          {user && (
            <div className="px-4 py-3 border-b border-border bg-muted/40">
              <div className="flex items-center gap-3">
                <Avatar user={user} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs truncate text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 space-y-1">
            <button
              onClick={() => handleScrollNavigation("how-it-works")}
              className="block w-full px-3 py-2 text-sm text-left transition-colors rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Како функционира
            </button>
            <button
              onClick={() => handleScrollNavigation("features")}
              className="block w-full px-3 py-2 text-sm text-left transition-colors rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Можности
            </button>
            <NavLink
              to="/public-files"
              className="block px-3 py-2 text-sm transition-colors rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Податоци
            </NavLink>

            {user ? (
              <>
                <div className="h-px my-2 bg-border" />
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/dashboard");
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 opacity-70" />
                  Контролна табла
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <User className="w-4 h-4 opacity-70" />
                  Профил
                </button>
                <div className="h-px my-2 bg-border" />
                <button
                  onClick={() => {
                    clearAuth();
                    navigate("/login");
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg text-destructive hover:bg-destructive/8 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Одјава
                </button>
              </>
            ) : (
              <>
                <div className="h-px my-2 bg-border" />
                <NavLink to="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Најава
                  </Button>
                </NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full mt-1">
                    Започни
                  </Button>
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
