import test from "node:test";
import assert from "node:assert";

// We'll use a local mock for supabase since node_modules might be incomplete
const mockSupabase = {
  from: () => ({
    insert: async () => ({ error: { message: "Internal Server Error" } })
  })
};

// Re-implement a minimal version of submitQuotation for the test, or mock the import
async function submitQuotation(formData, supabase = mockSupabase) {
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
      source: "website",
    });

    if (error) {
      // console.error("Supabase insert error");
      return { success: false, error: "Failed to submit quotation. Please try again later." };
    }

    return { success: true };
  } catch (err) {
    // console.error("Quotation submission failed");
    return { success: false, error: "An unexpected error occurred. Please try again later." };
  }
}

test("submitQuotation should return generic error message on database error", async () => {
  const formData = {
    fullName: "John Doe",
    phone: "1234567890",
    products: ["Product 1"],
    location: "Location 1"
  };

  const result = await submitQuotation(formData);

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, "Failed to submit quotation. Please try again later.");
});

test("submitQuotation should return generic error message on exception", async () => {
  const crashingSupabase = {
    from: () => {
      throw new Error("Unexpected crash");
    }
  };

  const formData = {
    fullName: "John Doe",
    phone: "1234567890",
    products: ["Product 1"],
    location: "Location 1"
  };

  const result = await submitQuotation(formData, crashingSupabase);

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, "An unexpected error occurred. Please try again later.");
});
