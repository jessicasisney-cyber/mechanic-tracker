import { auth } from "@/auth";
import { listEntries } from "@/lib/entries";
import { serializeEntry } from "@/lib/serialize";
import { getShopSettings } from "@/lib/settings";
import { WorkTracker } from "@/components/WorkTracker";

export default async function AppHome() {
  const session = await auth();
  const rows = await listEntries();
  const entries = rows.map(serializeEntry);
  const settings = await getShopSettings();

  return (
    <WorkTracker
      initialEntries={entries}
      currentUser={{
        name: session!.user.name ?? "",
        role: session!.user.role,
      }}
      laborRates={{
        standard: settings.standardLaborRate,
        specialtyMin: settings.specialtyLaborRateMin,
        specialtyMax: settings.specialtyLaborRateMax,
      }}
    />
  );
}
