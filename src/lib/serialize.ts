import type { CustomerUpdateRow, EntryRow, PartRow, PhotoRow } from "./types";

type DbPart = {
  id: string;
  partName: string | null;
  vendor: string | null;
  partCost: string | null;
  partStatus: string | null;
  receiptRef: string | null;
};

type DbPhoto = {
  id: string;
  url: string;
  caption: string | null;
  visibleToCustomer: boolean;
};

type DbCustomerUpdate = {
  id: string;
  message: string;
  trackingNumber: string | null;
  resolved: boolean;
  createdAt: Date;
};

type DbEntry = {
  id: string;
  date: string;
  vehicleType: string | null;
  makeModel: string | null;
  projectType: string | null;
  projectDescription: string | null;
  timeSpent: string | null;
  workNotes: string | null;
  customerNotes: string | null;
  scopeChangeDate: string | null;
  scopeChangeNotes: string | null;
  customer: { name: string; phone: string | null; smsOptIn: string };
  parts: DbPart[];
  photos: DbPhoto[];
  customerUpdates: DbCustomerUpdate[];
};

function serializePart(p: DbPart): PartRow {
  return {
    id: p.id,
    partName: p.partName ?? "",
    vendor: p.vendor ?? "",
    partCost: p.partCost ?? "",
    partStatus: p.partStatus ?? "",
    receiptRef: p.receiptRef ?? "",
  };
}

function serializePhoto(p: DbPhoto): PhotoRow {
  return {
    id: p.id,
    url: p.url,
    caption: p.caption ?? "",
    visibleToCustomer: p.visibleToCustomer,
  };
}

function serializeCustomerUpdate(u: DbCustomerUpdate): CustomerUpdateRow {
  return {
    id: u.id,
    message: u.message,
    trackingNumber: u.trackingNumber ?? "",
    resolved: u.resolved,
    createdAt: u.createdAt.toISOString(),
  };
}

export function serializeEntry(e: DbEntry): EntryRow {
  return {
    id: e.id,
    date: e.date,
    customerName: e.customer.name,
    customerPhone: e.customer.phone ?? "",
    customerOptIn: e.customer.smsOptIn === "opted_in",
    vehicleType: e.vehicleType ?? "",
    makeModel: e.makeModel ?? "",
    projectType: e.projectType ?? "",
    projectDescription: e.projectDescription ?? "",
    timeSpent: e.timeSpent ?? "",
    workNotes: e.workNotes ?? "",
    customerNotes: e.customerNotes ?? "",
    scopeChangeDate: e.scopeChangeDate ?? "",
    scopeChangeNotes: e.scopeChangeNotes ?? "",
    parts: e.parts.map(serializePart),
    photos: e.photos.map(serializePhoto),
    customerUpdates: e.customerUpdates.map(serializeCustomerUpdate),
  };
}
