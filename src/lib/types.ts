export type PartRow = {
  id: string;
  partName: string;
  vendor: string;
  partCost: string;
  partStatus: string;
  receiptRef: string;
};

export type PhotoRow = {
  id: string;
  url: string;
  caption: string;
  visibleToCustomer: boolean;
};

export type CustomerUpdateRow = {
  id: string;
  message: string;
  trackingNumber: string;
  resolved: boolean;
  createdAt: string;
};

export type WorkLogRow = {
  id: string;
  note: string;
  visibleToCustomer: boolean;
  authorName: string;
  createdAt: string;
};

export type EntryRow = {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerOptIn: boolean;
  vehicleType: string;
  makeModel: string;
  projectType: string;
  projectDescription: string;
  timeSpent: string;
  laborRateType: "standard" | "specialty";
  laborRate: string;
  customerNotes: string;
  scopeChangeDate: string;
  scopeChangeNotes: string;
  parts: PartRow[];
  photos: PhotoRow[];
  customerUpdates: CustomerUpdateRow[];
  workLogEntries: WorkLogRow[];
};

export function blankPart(): PartRow {
  return {
    id: "",
    partName: "",
    vendor: "",
    partCost: "",
    partStatus: "",
    receiptRef: "",
  };
}

export function blankEntry(): Omit<
  EntryRow,
  "id" | "photos" | "customerUpdates" | "workLogEntries"
> {
  return {
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    customerPhone: "",
    customerOptIn: false,
    vehicleType: "",
    makeModel: "",
    projectType: "",
    projectDescription: "",
    timeSpent: "",
    laborRateType: "standard",
    laborRate: "",
    customerNotes: "",
    scopeChangeDate: "",
    scopeChangeNotes: "",
    parts: [blankPart()],
  };
}
