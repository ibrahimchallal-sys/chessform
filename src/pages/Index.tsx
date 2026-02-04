import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const groupOptions = [
  { value: "DD101", label: "DD101", category: "DEV" },
  { value: "DD102", label: "DD102", category: "DEV" },
  { value: "DD103", label: "DD103", category: "DEV" },
  { value: "DD104", label: "DD104", category: "DEV" },
  { value: "DD105", label: "DD105", category: "DEV" },
  { value: "DD106", label: "DD106", category: "DEV" },
  { value: "DD107", label: "DD107", category: "DEV" },
  { value: "DEVOWS201", label: "DEVOWS201", category: "DEV" },
  { value: "DEVOWS202", label: "DEVOWS202", category: "DEV" },
  { value: "DEVOWS203", label: "DEVOWS203", category: "DEV" },
  { value: "DEVOWS204", label: "DEVOWS204", category: "DEV" },
  { value: "ID101", label: "ID101", category: "ID" },
  { value: "ID102", label: "ID102", category: "ID" },
  { value: "ID103", label: "ID103", category: "ID" },
  { value: "ID104", label: "ID104", category: "ID" },
  { value: "IDOSR201", label: "IDOSR201", category: "ID" },
  { value: "IDOSR202", label: "IDOSR202", category: "ID" },
  { value: "IDOSR203", label: "IDOSR203", category: "ID" },
  { value: "IDOSR204", label: "IDOSR204", category: "ID" },
];

const emailPattern = /^\d{13}@ofppt-edu\.ma$/;
const moroccanPhonePattern = /^(?:\+212|0)([ \-]?\d){9}$/;

const normalizeEmail = (value: unknown) =>
  typeof value === "string" ? value.replace(/\s+/g, "").trim() : value;

const normalizePhone = (value: unknown) => {
  if (typeof value !== "string") return value;
  // remove whitespace + invisible unicode marks then keep only digits and a leading '+'
  const stripped = value
    .replace(/[\s\u200E\u200F\u202A-\u202E\u2066-\u2069]+/g, "")
    .trim();
  const keep = stripped.replace(/(?!^)\+/g, "").replace(/[^\d+]/g, "");
  return keep;
};

const registrationSchema = z.object({
  group: z.string({ required_error: "Please select your group" }),
  fullName: z
    .string()
    .trim()
    .min(3, { message: "Full name must be at least 3 characters" })
    .max(100, { message: "Full name must be less than 100 characters" }),
  phone: z.preprocess(
    normalizePhone,
    z.string().regex(moroccanPhonePattern, {
      message: "Enter a valid Moroccan phone (0XXXXXXXXX or +212XXXXXXXXX)",
    }),
  ),
  email: z.preprocess(
    normalizeEmail,
    z
      .string()
      .regex(emailPattern, {
        message: "Email must be 13 digits followed by @ofppt-edu.ma",
      })
      .max(255, { message: "Email must be less than 255 characters" }),
  ),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

const Index = () => {
  const { toast } = useToast();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      group: "",
      fullName: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    document.title = "Chess Tournament Registration";
  }, []);

  const onSubmit = async (values: RegistrationFormValues) => {
    try {
      const normalized = {
        ...values,
        phone: String(normalizePhone(values.phone)),
        email: String(normalizeEmail(values.email)),
      };

      const { error } = await supabase.from("registrations").insert({
        group_code: normalized.group,
        full_name: normalized.fullName,
        phone: normalized.phone,
        email: normalized.email,
      });

      if (error) {
        console.error("Error inserting registration", error);
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message || "Please try again or contact the organizer.",
        });
        return;
      }

      toast({
        title: "Registration submitted",
        description: "Good luck in the tournament!",
      });

      form.reset();
    } catch (err) {
      console.error("Unexpected error inserting registration", err);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Unexpected error, please try again shortly.",
      });
    }
  };

  const devGroups = groupOptions.filter((g) => g.category === "DEV");
  const idGroups = groupOptions.filter((g) => g.category === "ID");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/60">
      <div className="container flex flex-col items-center justify-center py-10">
        <div className="mb-8 flex w-full max-w-4xl items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Chess Tournament Registration
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Register with your official group, school email and Moroccan phone
              number to participate in the upcoming tournament.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/admin">Admin dashboard</Link>
          </Button>
        </div>

        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="relative rounded-xl border bg-card p-6 shadow-sm">
            <div className="pointer-events-none absolute inset-0 rounded-xl border border-primary/10 shadow-[0_0_40px_-20px_hsl(var(--primary))]" />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover">
                          <SelectGroup>
                            <SelectLabel>DEV groups</SelectLabel>
                            {devGroups.map((group) => (
                              <SelectItem key={group.value} value={group.value}>
                                {group.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>ID groups</SelectLabel>
                            {idGroups.map((group) => (
                              <SelectItem key={group.value} value={group.value}>
                                {group.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First name Last name"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moroccan phone number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0XXXXXXXXX or +212XXXXXXXXX"
                          inputMode="tel"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OFFPT email</FormLabel>
                      <FormControl>
                        <Input
                           type="email"
                           placeholder="0123456789012@ofppt-edu.ma"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button type="submit" className="w-full">
                    Submit registration
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <aside className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">Tournament details</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Swiss-system rounds with official timing.</li>
              <li>• Boards and clocks provided on site.</li>
              <li>• Remember to arrive 15 minutes before the first round.</li>
              <li>• Only students with a valid OFFPT email can register.</li>
            </ul>
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Your data is stored securely in the tournament database. An
              administrator can view submissions in the dashboard.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Index;
