import { useState, useEffect } from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Package, FolderTree, Star,
  FileText, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X, ClipboardList,
} from "lucide-react";
import logo from "@/assets/hanrose-logo.webp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin",            label: "Dashboard",  icon: LayoutDashboard, end: true },
  { to: "/admin/orders",     label: "Orders",     icon: ClipboardList },
  { to: "/admin/products",   label: "Products",   icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/reviews",    label: "Reviews",    icon: Star },
  { to: "/admin/blog",       label: "Blog",       icon: FileText },
  { to: "/admin/settings",   label: "Settings",   icon: Settings },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Desktop: collapsed sidebar state (persisted)
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("admin_sidebar") === "collapsed"; } catch { return false; }
  });

  // Mobile: drawer open state
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem("admin_sidebar", collapsed ? "collapsed" : "expanded"); } catch {}
  }, [collapsed]);

  // Close drawer on route change
  const closeDrawer = () => setDrawerOpen(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-serif text-2xl">Akses ditolak</h1>
        <p className="text-sm text-muted-foreground">Akun ini bukan admin.</p>
        <Button onClick={async () => { await signOut(); navigate("/admin/login"); }}>Sign out</Button>
      </div>
    );
  }

  const NavItems = ({ onClick }: { onClick?: () => void }) => (
    <>
      {nav.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={onClick}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors relative group",
              isActive ? "bg-pink text-foreground font-medium" : "text-background/80 hover:bg-background/10"
            )
          }
        >
          <n.icon className="h-5 w-5 shrink-0" />
          {/* Label — always visible in drawer/expanded, hidden when collapsed */}
          <span className={cn(
            "truncate transition-all duration-200",
            collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
          )}>
            {n.label}
          </span>
          {/* Tooltip when collapsed (desktop only) */}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-foreground text-background text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
              {n.label}
            </span>
          )}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="min-h-screen flex bg-muted/30">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={cn(
        "hidden md:flex flex-col bg-foreground text-background transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-56"
      )}>
        {/* Logo */}
        <div className={cn(
          "flex items-center border-b border-background/10 transition-all duration-200",
          collapsed ? "p-3 justify-center" : "p-4 gap-3"
        )}>
          <div className="bg-background/95 rounded-xl p-1 shrink-0">
            <img src={logo} alt="" className="h-7 w-auto" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-serif text-sm">Hanrose</div>
              <div className="text-[0.6rem] uppercase tracking-wider text-background/60">Admin</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <NavItems />
        </nav>

        {/* Sign out + collapse toggle */}
        <div className="p-2 border-t border-background/10 space-y-0.5">
          <button
            onClick={async () => { await signOut(); navigate("/admin/login"); }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-background/80 hover:bg-background/10 relative group",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign out</span>}
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-foreground text-background text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                Sign out
              </span>
            )}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-background/60 hover:bg-background/10 relative group",
              collapsed && "justify-center"
            )}
          >
            {collapsed
              ? <ChevronRight className="h-4 w-4 shrink-0" />
              : <><ChevronLeft className="h-4 w-4 shrink-0" /><span>Collapse</span></>
            }
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-foreground text-background text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                Expand menu
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeDrawer}
        />
      )}

      {/* ── MOBILE DRAWER ── */}
      <aside className={cn(
        "md:hidden fixed top-0 left-0 h-full w-64 bg-foreground text-background z-50 flex flex-col transition-transform duration-200",
        drawerOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex items-center justify-between border-b border-background/10">
          <div className="flex items-center gap-3">
            <div className="bg-background/95 rounded-xl p-1">
              <img src={logo} alt="" className="h-7 w-auto" />
            </div>
            <div>
              <div className="font-serif text-sm">Hanrose</div>
              <div className="text-[0.6rem] uppercase tracking-wider text-background/60">Admin</div>
            </div>
          </div>
          <button onClick={closeDrawer} className="p-1 rounded-lg hover:bg-background/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <NavItems onClick={closeDrawer} />
        </nav>

        <div className="p-3 border-t border-background/10">
          <button
            onClick={async () => { closeDrawer(); await signOut(); navigate("/admin/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-background/80 hover:bg-background/10"
          >
            <LogOut className="h-5 w-5" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="bg-foreground rounded-lg p-1">
            <img src={logo} alt="" className="h-6 w-auto" />
          </div>
          <span className="font-serif text-sm">Hanrose Admin</span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
