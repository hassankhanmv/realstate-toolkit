import { optionalAuth } from "@/lib/auth.server";
import { createInquiryLead, logUserAction } from "@repo/supabase";

export async function action({ request }: { request: Request }) {
  const { user, supabase, headers } = await optionalAuth(request);
  const body = await request.json();

  const { name, email, phone, message, propertyId } = body;

  if (!name || !email) {
    return Response.json(
      { error: "Name and email are required" },
      { status: 400, headers },
    );
  }

  try {
    // Get the property's company_id for lead assignment
    let companyId = "";
    if (propertyId) {
      const { data: property } = await (supabase.from("properties") as any)
        .select("company_id")
        .eq("id", propertyId)
        .single();
      companyId = property?.company_id ?? "";
    }

    if (!companyId) {
      return Response.json(
        { error: "Could not determine property owner" },
        { status: 400, headers },
      );
    }

    const lead = await createInquiryLead(supabase, {
      name,
      email,
      phone,
      message,
      propertyId,
      companyId,
    });

    // Log the inquiry action if user is authenticated
    if (user) {
      await logUserAction(
        supabase,
        user.id,
        "inquire",
        { propertyId, email },
        propertyId,
      );
    }

    return Response.json({ success: true, lead }, { headers });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to submit inquiry" },
      { status: 500, headers },
    );
  }
}
