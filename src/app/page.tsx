import { auth } from "@/auth";
import { listEntries } from "@/lib/entries";
import { serializeEntry } from "@/lib/serialize";
import { WorkTracker } from "@/components/WorkTracker";

export default async function Home() {
  const session = await auth();
  const rows = await listEntries();
  const entries = rows.map(serializeEntry);

  return (
    <WorkTracker
      initialEntries={entries}
      currentUser={{
        name: session!.user.name ?? "",
        role: session!.user.role,
      }}
    />
  );
}
