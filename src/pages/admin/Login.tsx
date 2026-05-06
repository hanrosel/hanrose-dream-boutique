import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/hanrose-logo.webp";

export default function AdminLogin() {
  const { signIn, user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@hanyori.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) nav("/admin", { replace: true });
  }, [user, isAdmin, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error, isAdmin: admin } = await signIn(email, password);
    setBusy(false);
    if (error) toast.error(error);
    else if (admin) nav("/admin", { replace: true });
    else toast.error("Akun ini bukan admin.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-6">
      <Card className="w-full max-w-md p-8 rounded-3xl shadow-elegant">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Hanrose" className="h-16 w-auto mb-3" />
          <h1 className="font-serif text-2xl">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your boutique</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" variant="hanrose" className="w-full" size="lg" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}