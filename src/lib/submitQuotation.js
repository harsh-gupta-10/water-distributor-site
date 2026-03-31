import { supabase } from "./supabase";

export async function submitQuotation(formData, source = "website") {
  try {
    const { error } = await supabase.from("quotations").insert({
      full_name: formData.fullName,
      business_name: formData.businessName || null,
      phone: formData.phone,
      email: formData.email || null,
      products: formData.products,
      quantity: formData.quantity || null,
      location: formData.location,
      message: formData.message || null,
      source,
    });

    if (error) {
      console.error("Supabase insert error");
      return { success: false, error: "Failed to submit quotation. Please try again later." };
    }

    return { success: true };
  } catch {
    console.error("Quotation submission failed");
    return { success: false, error: "An unexpected error occurred. Please try again later." };
  }
}
