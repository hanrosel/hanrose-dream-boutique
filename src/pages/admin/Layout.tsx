import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Star,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import logo from "@/assets/hanrose-logo.png";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-60 bg-foreground text-background flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-background/10">
          <div className="bg-background/95 rounded-xl p-1.5">
            <img src={logo} alt="" className="h-8 w-auto" />
          </div>
          <div>
            <div className="font-serif">Hanrose</div>
            <div className="text-[0.65rem] uppercase tracking-wider text-background/60">Admin</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-pink text-foreground" : "text-background/80 hover:bg-background/10"
                }`
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-background/10">
          <button
            onClick={async () => { await signOut(); navigate("/admin/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-background/80 hover:bg-background/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}