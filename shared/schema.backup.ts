// Placeholder schema file - will be populated based on actual database structure
import { pgTable, serial, text, integer, timestamp, boolean, decimal, json } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  phone: text('phone'),
  password: text('password'),
  role: text('role').default('client'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  nicheId: integer('niche_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const niches = pgTable('niches', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: integer('category_id'),
  duration: integer('duration'),
  price: decimal('price'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id'),
  providerId: integer('provider_id'),
  serviceId: integer('service_id'),
  date: timestamp('date'),
  status: text('status').default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const providerServices = pgTable('provider_services', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id'),
  serviceId: integer('service_id'),
  price: decimal('price'),
  duration: integer('duration'),
  isActive: boolean('is_active').default(true),
});

export const availability = pgTable('availability', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id'),
  dayOfWeek: integer('day_of_week'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  isActive: boolean('is_active').default(true),
});

export const blockedTimeSlots = pgTable('blocked_time_slots', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id'),
  startDateTime: timestamp('start_date_time'),
  endDateTime: timestamp('end_date_time'),
  reason: text('reason'),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  appointmentId: integer('appointment_id'),
  rating: integer('rating'),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const providerServiceFees = pgTable('provider_service_fees', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id'),
  serviceId: integer('service_id'),
  basePrice: decimal('base_price'),
  finalPrice: decimal('final_price'),
});

export const paymentSettings = pgTable('payment_settings', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id'),
  acceptsCash: boolean('accepts_cash').default(false),
  acceptsCard: boolean('accepts_card').default(false),
  acceptsPix: boolean('accepts_pix').default(false),
  settings: json('settings'),
});