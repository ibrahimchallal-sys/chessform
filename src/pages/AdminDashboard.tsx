import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

type StoredRegistration = {
  id: string;
  createdAt: string;
  group: string;
  fullName: string;
  phone: string;
  email: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<StoredRegistration[]>([]);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Tableau de bord admin (Échecs)";

    const enforceAuthAndLoad = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate(`/adminspace?redirect=${encodeURIComponent("/admin")}`, { replace: true });
        return;
      }

      const { data, error } = await supabase
        .from("registrations")
        .select("id, created_at, group_code, full_name, phone, email")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading registrations", error);
        setLoading(false);
        return;
      }

      const mapped: StoredRegistration[] = (data ?? []).map((r: any) => ({
        id: r.id,
        createdAt: r.created_at,
        group: r.group_code,
        fullName: r.full_name,
        phone: r.phone,
        email: r.email,
      }));

      setRegistrations(mapped);
      setLoading(false);
    };

    // Listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate(`/adminspace?redirect=${encodeURIComponent("/admin")}`, { replace: true });
      }
    });

    enforceAuthAndLoad();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return registrations.filter((r) => {
      const matchesSearch =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.group.toLowerCase().includes(q);

      const matchesGroup =
        groupFilter === "all" ||
        (groupFilter === "DEV" && r.group.startsWith("D")) ||
        (groupFilter === "ID" && r.group.startsWith("ID"));

      return matchesSearch && matchesGroup;
    });
  }, [registrations, search, groupFilter]);

  const clearAll = async () => {
    if (!window.confirm("Cela supprimera toutes les inscriptions de la base de données. Continuer ?")) {
      return;
    }

    const { error } = await supabase
      .from("registrations")
      .delete()
      .gt("created_at", "1900-01-01");

    if (error) {
      console.error("Error clearing registrations", error);
      return;
    }

    setRegistrations([]);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate(`/adminspace?redirect=${encodeURIComponent("/admin")}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/60">
      <div className="container py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Tableau de bord admin
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consultez et filtrez les inscriptions du tournoi
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Retour à l'inscription</Link>
          </Button>
        </div>

        {loading ? (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">Chargement…</div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
              <Input
                placeholder="Rechercher (nom, email, groupe)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />

              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="DEV">DEV</SelectItem>
                  <SelectItem value="ID">ID</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="ml-auto"
                type="button"
                onClick={clearAll}
                disabled={registrations.length === 0}
              >
                Tout supprimer
              </Button>

              <Button variant="outline" type="button" onClick={logout}>
                Se déconnecter
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Groupe</TableHead>
                    <TableHead>Nom complet</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        Aucune inscription pour le moment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r.id} className="hover:bg-muted/40">
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{r.group}</TableCell>
                        <TableCell>{r.fullName}</TableCell>
                        <TableCell className="text-xs">{r.email}</TableCell>
                        <TableCell className="text-xs">{r.phone}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
