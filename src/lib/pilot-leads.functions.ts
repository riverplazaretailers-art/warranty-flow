import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  work_email: z.string().trim().email("Enter a valid work email").max(255),
  company: z.string().trim().min(1, "Company is required").max(150),
  oem_brands: z.string().trim().max(300).optional().default(""),
  note: z.string().trim().max(1000).optional().default(""),
  website: z.string().max(200).optional().default(""),
});

export const submitPilotLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    // Honeypot: silently accept, never store.
    if (data.website.trim() !== "") return { ok: true as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.work_email.toLowerCase();

    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recent } = await supabaseAdmin
      .from("pilot_leads")
      .select("id")
      .eq("work_email", email)
      .gte("created_at", since)
      .limit(1);

    if (recent && recent.length > 0) return { ok: true as const };

    const { error } = await supabaseAdmin.from("pilot_leads").insert({
      name: data.name,
      work_email: email,
      company: data.company,
      oem_brands: data.oem_brands || null,
      note: data.note || null,
      source: "website",
    });

    if (error) throw new Error("Could not save your request. Please try again.");
    return { ok: true as const };
  });
