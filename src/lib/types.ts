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
};

export type EntryRow = {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  vehicleType: string;
  makeModel: string;
  projectType: string;
  projectDescription: string;
  timeSpent: string;
  workNotes: string;
  customerNotes: string;
  scopeChangeDate: string;
  scopeChangeNotes: string;
  parts: PartRow[];
  photos: PhotoRow[];
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

export function blankEntry(): Omit<EntryRow, "id" | "photos"> {
  return {
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    customerPhone: "",
    vehicleType: "",
    makeModel: "",
    projectType: "",
    projectDescription: "",
    timeSpent: "",
    workNotes: "",
    customerNotes: "",
    scopeChangeDate: "",
    scopeChangeNotes: "",
    parts: [blankPart()],
  };
}
