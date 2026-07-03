import {
  pgTable,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["owner", "mechanic"]);

export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "Car",
  "Truck",
  "SUV",
  "Motorcycle",
  "RV",
  "Other",
]);

export const projectTypeEnum = pgEnum("project_type", [
  "Repair",
  "Maintenance",
  "Diagnostic",
  "Custom Build",
  "Inspection",
  "Other",
]);

export const partStatusEnum = pgEnum("part_status", [
  "Ordered",
  "In Transit",
  "Arrived",
  "Installed",
  "Returned",
  "N/A",
]);

export const smsStatusEnum = pgEnum("sms_status", [
  "queued",
  "sent",
  "failed",
]);

function id() {
  return text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
}

export const users = pgTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("mechanic"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const customers = pgTable("customers", {
  id: id(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  smsOptIn: text("sms_opt_in").notNull().default("pending"), // pending | opted_in | opted_out
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const workEntries = pgTable("work_entries", {
  id: id(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  date: text("date").notNull(), // stored as YYYY-MM-DD, matches prototype's date input
  vehicleType: vehicleTypeEnum("vehicle_type"),
  makeModel: text("make_model"),
  projectType: projectTypeEnum("project_type"),
  projectDescription: text("project_description"),
  timeSpent: numeric("time_spent", { precision: 6, scale: 2 }),
  workNotes: text("work_notes"),
  customerNotes: text("customer_notes"),
  scopeChangeDate: text("scope_change_date"),
  scopeChangeNotes: text("scope_change_notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const parts = pgTable("parts", {
  id: id(),
  workEntryId: text("work_entry_id")
    .notNull()
    .references(() => workEntries.id, { onDelete: "cascade" }),
  partName: text("part_name"),
  vendor: text("vendor"),
  partCost: numeric("part_cost", { precision: 10, scale: 2 }),
  partStatus: partStatusEnum("part_status"),
  receiptRef: text("receipt_ref"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const photos = pgTable("photos", {
  id: id(),
  workEntryId: text("work_entry_id")
    .notNull()
    .references(() => workEntries.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  visibleToCustomer: boolean("visible_to_customer").notNull().default(false),
  uploadedBy: text("uploaded_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const smsMessages = pgTable("sms_messages", {
  id: id(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  workEntryId: text("work_entry_id").references(() => workEntries.id, {
    onDelete: "set null",
  }),
  body: text("body").notNull(),
  status: smsStatusEnum("status").notNull().default("queued"),
  provider: text("provider").notNull().default("twilio"),
  providerMessageId: text("provider_message_id"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const customerUpdates = pgTable("customer_updates", {
  id: id(),
  workEntryId: text("work_entry_id")
    .notNull()
    .references(() => workEntries.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  trackingNumber: text("tracking_number"),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const customersRelations = relations(customers, ({ many }) => ({
  workEntries: many(workEntries),
  smsMessages: many(smsMessages),
}));

export const workEntriesRelations = relations(
  workEntries,
  ({ one, many }) => ({
    customer: one(customers, {
      fields: [workEntries.customerId],
      references: [customers.id],
    }),
    createdByUser: one(users, {
      fields: [workEntries.createdBy],
      references: [users.id],
    }),
    parts: many(parts),
    photos: many(photos),
    smsMessages: many(smsMessages),
    customerUpdates: many(customerUpdates),
  })
);

export const customerUpdatesRelations = relations(
  customerUpdates,
  ({ one }) => ({
    workEntry: one(workEntries, {
      fields: [customerUpdates.workEntryId],
      references: [workEntries.id],
    }),
  })
);

export const partsRelations = relations(parts, ({ one }) => ({
  workEntry: one(workEntries, {
    fields: [parts.workEntryId],
    references: [workEntries.id],
  }),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  workEntry: one(workEntries, {
    fields: [photos.workEntryId],
    references: [workEntries.id],
  }),
  uploadedByUser: one(users, {
    fields: [photos.uploadedBy],
    references: [users.id],
  }),
}));

export const smsMessagesRelations = relations(smsMessages, ({ one }) => ({
  customer: one(customers, {
    fields: [smsMessages.customerId],
    references: [customers.id],
  }),
  workEntry: one(workEntries, {
    fields: [smsMessages.workEntryId],
    references: [workEntries.id],
  }),
}));
