/**
 * Dev tools – exposes helper functions on `window` for use in the browser console.
 * Call: seedProperties(25)  — inserts 25 fake properties for the current user.
 * Call: seedLeads(25)       — inserts 25 fake leads for the current user.
 */
export function registerDevTools() {
  if (typeof window === "undefined") return;

  (window as any).seedProperties = async (count = 25) => {
    console.log(`🌱 Seeding ${count} fake properties...`);

    try {
      const res = await fetch("/api/fake-bulk-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error("❌ Seed failed:", json.error);
        return json;
      }

      console.log(`\n✅ ${json.message}\n`);
      console.table(json.results);
      console.log("\n🔄 Refresh the page to see your new properties!");

      return json;
    } catch (err) {
      console.error("❌ Seed error:", err);
      return { error: String(err) };
    }
  };

  (window as any).seedLeads = async (count = 25) => {
    console.log(`🌱 Seeding ${count} fake leads...`);

    try {
      const res = await fetch("/api/fake-bulk-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error("❌ Seed failed:", json.error);
        return json;
      }

      console.log(`\n✅ ${json.message}\n`);
      console.table(json.results);
      console.log("\n🔄 Refresh the page to see your new leads!");

      return json;
    } catch (err) {
      console.error("❌ Seed error:", err);
      return { error: String(err) };
    }
  };

  // %cseedProperties(count)%c, %cseedLeads(count)%c
  console.log(
    "🛠️ Dev tools loaded. Available: ",
    "color: #c9a96e; font-weight: bold",
    "",
    "color: #c9a96e; font-weight: bold",
    "",
  );
}
