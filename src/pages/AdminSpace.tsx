import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email")
  .max(255, "Email is too long");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

const AdminSpace = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("redirect") || "/admin";
  }, [location.search]);

  useEffect(() => {
    // Listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate(redirectTo, { replace: true });
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        navigate(redirectTo, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectTo]);

  const submit = async () => {
    const parsedEmail = emailSchema.safeParse(email);
    const parsedPassword = passwordSchema.safeParse(password);

    if (!parsedEmail.success) {
      toast({ variant: "destructive", title: "Invalid email", description: parsedEmail.error.issues[0]?.message });
      return;
    }
    if (!parsedPassword.success) {
      toast({
        variant: "destructive",
        title: "Invalid password",
        description: parsedPassword.error.issues[0]?.message,
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: parsedEmail.data,
        password: parsedPassword.data,
      });

      if (error) {
        toast({ variant: "destructive", title: "Login failed", description: error.message });
        return;
      }

      toast({ title: "Welcome", description: "You are now signed in." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/60">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin access</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to access the tournament admin dashboard.
            </p>
          </header>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ibrahimchallal999@gmail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button type="button" className="w-full" onClick={submit} disabled={loading}>
              {loading ? "Please wait…" : "Login"}
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link to="/">Back to registration</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSpace;
