import { pgTable, serial, varchar, text, timestamp, boolean, integer, decimal, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabela de usuários
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  userType: varchar('user_type', { length: 50 }).notNull(), // 'client' ou 'provider'
  phone: varchar('phone', { length: 20 }),
  avatar: text('avatar'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de categorias
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabela de nichos
export const niches = pgTable('niches', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabela de serviços
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').notNull(), // em minutos
  providerId: integer('provider_id').references(() => users.id).notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  nicheId: integer('niche_id').references(() => niches.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de disponibilidade
export const availability = pgTable('availability', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').references(() => users.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (domingo-sábado)
  startTime: varchar('start_time', { length: 5 }).notNull(), // formato HH:MM
  endTime: varchar('end_time', { length: 5 }).notNull(), // formato HH:MM
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabela de agendamentos
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => users.id).notNull(),
  providerId: integer('provider_id').references(() => users.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  date: varchar('date', { length: 10 }).notNull(), // formato YYYY-MM-DD
  startTime: varchar('start_time', { length: 5 }).notNull(), // formato HH:MM
  endTime: varchar('end_time', { length: 5 }).notNull(), // formato HH:MM
  status: varchar('status', { length: 50 }).default('scheduled'), // scheduled, completed, cancelled
  notes: text('notes'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de configurações do prestador
export const providerSettings = pgTable('provider_settings', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').references(() => users.id).notNull().unique(),
  businessName: varchar('business_name', { length: 255 }),
  businessDescription: text('business_description'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  website: varchar('website', { length: 255 }),
  acceptsOnlineBooking: boolean('accepts_online_booking').default(true),
  isOnline: boolean('is_online').default(true),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  settings: jsonb('settings'), // configurações extras em JSON
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de tempos bloqueados
export const blockedTimes = pgTable('blocked_times', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').references(() => users.id).notNull(),
  date: varchar('date', { length: 10 }).notNull(), // formato YYYY-MM-DD
  startTime: varchar('start_time', { length: 5 }).notNull(), // formato HH:MM
  endTime: varchar('end_time', { length: 5 }).notNull(), // formato HH:MM
  reason: varchar('reason', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Relações
export const usersRelations = relations(users, ({ many, one }) => ({
  servicesAsProvider: many(services),
  appointmentsAsClient: many(appointments, { relationName: 'clientAppointments' }),
  appointmentsAsProvider: many(appointments, { relationName: 'providerAppointments' }),
  availability: many(availability),
  providerSettings: one(providerSettings),
  blockedTimes: many(blockedTimes)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  niches: many(niches),
  services: many(services)
}));

export const nichesRelations = relations(niches, ({ one, many }) => ({
  category: one(categories, {
    fields: [niches.categoryId],
    references: [categories.id]
  }),
  services: many(services)
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  provider: one(users, {
    fields: [services.providerId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id]
  }),
  niche: one(niches, {
    fields: [services.nicheId],
    references: [niches.id]
  }),
  appointments: many(appointments)
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  provider: one(users, {
    fields: [availability.providerId],
    references: [users.id]
  })
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(users, {
    fields: [appointments.clientId],
    references: [users.id],
    relationName: 'clientAppointments'
  }),
  provider: one(users, {
    fields: [appointments.providerId],
    references: [users.id],
    relationName: 'providerAppointments'
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id]
  })
}));

export const providerSettingsRelations = relations(providerSettings, ({ one }) => ({
  provider: one(users, {
    fields: [providerSettings.providerId],
    references: [users.id]
  })
}));

export const blockedTimesRelations = relations(blockedTimes, ({ one }) => ({
  provider: one(users, {
    fields: [blockedTimes.providerId],
    references: [users.id]
  })
}));