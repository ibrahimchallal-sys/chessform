import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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

const LOCAL_STORAGE_KEY = "chess_tournament_registrations";

type StoredRegistration = {
  id: string;
  createdAt: string;
  group: string;
  fullName: string;
  phone: string;
  email: string;
};

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<StoredRegistration[]>([]);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "Chess Admin Dashboard";
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredRegistration[];
        setRegistrations(parsed);
      } catch {
        // ignore malformed data
      }
    }
  }, []);

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

  const clearAll = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setRegistrations([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/60">
      <div className="container py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Admin dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View and filter chess tournament registrations stored in this
              browser.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Back to registration</Link>
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <Input
            placeholder="Search by name, email or group"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />

          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All groups</SelectItem>
              <SelectItem value="DEV">DEV only</SelectItem>
              <SelectItem value="ID">ID only</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="ml-auto"
            type="button"
            onClick={clearAll}
            disabled={registrations.length === 0}
          >
            Clear all
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Full name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No registrations found yet.
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
      </div>
    </div>
  );
};

export default AdminDashboard;
