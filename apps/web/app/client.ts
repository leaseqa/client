import { apiGet } from "@/app/lib/api/client";

// Deliberately does not catch. Returning fabricated zeros on failure made a
// failed read indistinguishable from a quiet community, and the homepage then
// hid the section entirely — so the renter saw neither the numbers nor the
// fact that they could not be loaded.
export async function fetchStats() {
  return apiGet("/stats/overview");
}
