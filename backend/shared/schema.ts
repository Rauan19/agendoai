import { pgTable, serial, text, integer, timestamp, boolean, decimal, json, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
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

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  nicheId: integer('niche_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Niches table
export const niches = pgTable('niches', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Services table
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: integer('category_id'),
  duration: integer('duration'),
  price: decimal('price'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Appointments table
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id'),
  providerId: integer('provider_id'),
  serviceId: integer('service_id'),
  date: timestamp('date'),
  status: text('status').default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Provider Services table
export const providerServices = pgTable('provider_services', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id'),
  serviceId: integer('service_id'),
  price: decimal('price'),
  duration: integer('duration'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Availability table
export const availability = pgTable('availability', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id'),
  dayOfWeek: integer('day_of_week'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Blocked Time Slots table
export const blockedTimeSlots = pgTable('blocked_time_slots', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id'),
  startDateTime: timestamp('start_date_time'),
  endDateTime: timestamp('end_date_time'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  appointmentId: integer('appointment_id'),
  clientId: integer('client_id'),
  providerId: integer('provider_id'),
  rating: integer('rating'),
  comment: text('comment'),
  isPublic: boolean('is_public').default(true),
  providerResponse: text('provider_response'),
  status: text('status').default('published'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Provider Service Fees table
export const providerServiceFees = pgTable('provider_service_fees', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id'),
  serviceId: integer('service_id'),
  basePrice: decimal('base_price'),
  finalPrice: decimal('final_price'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payment Settings table
export const paymentSettings = pgTable('payment_settings', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id'),
  acceptsCash: boolean('accepts_cash').default(false),
  acceptsCard: boolean('accepts_card').default(false),
  acceptsPix: boolean('accepts_pix').default(false),
  settings: json('settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Additional tables commonly used in booking systems
export const schedules = pgTable('schedules', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  isAvailable: boolean('is_available').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  providerId: integer('provider_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  title: text('title'),
  message: text('message'),
  type: text('type'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const timeSlots = pgTable('time_slots', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id'),
  serviceId: integer('service_id'),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  isAvailable: boolean('is_available').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Provider Settings table
export const providerSettings = pgTable('provider_settings', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  timezone: text('timezone').default('UTC'),
  bookingWindowDays: integer('booking_window_days').default(30),
  cancellationPolicy: text('cancellation_policy'),
  autoAcceptBookings: boolean('auto_accept_bookings').default(false),
  settings: json('settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Provider Breaks table
export const providerBreaks = pgTable('provider_breaks', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  name: text('name').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  dayOfWeek: integer('day_of_week'),
  isRecurrent: boolean('is_recurrent').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Service Templates table
export const serviceTemplates = pgTable('service_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  duration: integer('duration'),
  price: decimal('price'),
  categoryId: integer('category_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Support Tickets table
export const supportTickets = pgTable('support_tickets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  subject: text('subject').notNull(),
  status: text('status').default('open'),
  priority: text('priority').default('normal'),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Support Messages table
export const supportMessages = pgTable('support_messages', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').notNull(),
  userId: integer('user_id'),
  message: text('message').notNull(),
  isFromAdmin: boolean('is_from_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Promotions table
export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  discountType: text('discount_type'),
  discountValue: decimal('discount_value'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Payment Methods table
export const userPaymentMethods = pgTable('user_payment_methods', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  defaultPaymentMethodId: text('default_payment_method_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// System Settings table
export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value'),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Client Payment Preferences table
export const clientPaymentPreferences = pgTable('client_payment_preferences', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull(),
  preferredMethod: text('preferred_method'),
  allowsCash: boolean('allows_cash').default(true),
  allowsCard: boolean('allows_card').default(true),
  allowsPix: boolean('allows_pix').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Provider Payment Preferences table
export const providerPaymentPreferences = pgTable('provider_payment_preferences', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  acceptsCash: boolean('accepts_cash').default(true),
  acceptsCard: boolean('accepts_card').default(true),
  acceptsPix: boolean('accepts_pix').default(true),
  stripeEnabled: boolean('stripe_enabled').default(false),
  sumupEnabled: boolean('sumup_enabled').default(false),
  asaasEnabled: boolean('asaas_enabled').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Provider Locations table
export const providerLocations = pgTable('provider_locations', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  name: text('name').notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  latitude: decimal('latitude'),
  longitude: decimal('longitude'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Unavailable Days table
export const unavailableDays = pgTable('unavailable_days', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  date: text('date').notNull(),
  reason: text('reason'),
  isRecurrent: boolean('is_recurrent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Recurrent Blocked Times table
export const recurrentBlockedTimes = pgTable('recurrent_blocked_times', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  reason: text('reason'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Articles table
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  categoryId: integer('category_id'),
  authorId: integer('author_id'),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Article Categories table
export const articleCategories = pgTable('article_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Help Articles table
export const helpArticles = pgTable('help_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  categoryId: integer('category_id'),
  isPublished: boolean('is_published').default(false),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Help Categories table
export const helpCategories = pgTable('help_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Coupons table
export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  description: text('description'),
  discountType: text('discount_type').notNull(),
  discountValue: decimal('discount_value').notNull(),
  minimumAmount: decimal('minimum_amount'),
  maxUses: integer('max_uses'),
  currentUses: integer('current_uses').default(0),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertNicheSchema = createInsertSchema(niches).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertProviderServiceSchema = createInsertSchema(providerServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
  createdAt: true
});

export const insertBlockedTimeSlotSchema = createInsertSchema(blockedTimeSlots).omit({
  id: true,
  createdAt: true
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertProviderServiceFeeSchema = createInsertSchema(providerServiceFees).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true,
  createdAt: true
});

export const insertProviderSettingsSchema = createInsertSchema(providerSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertProviderBreakSchema = createInsertSchema(providerBreaks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertServiceTemplateSchema = createInsertSchema(serviceTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSupportMessageSchema = createInsertSchema(supportMessages).omit({
  id: true,
  createdAt: true
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserPaymentMethodSchema = createInsertSchema(userPaymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true
});

export const insertClientPaymentPreferenceSchema = createInsertSchema(clientPaymentPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertProviderPaymentPreferenceSchema = createInsertSchema(providerPaymentPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertProviderLocationSchema = createInsertSchema(providerLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUnavailableDaySchema = createInsertSchema(unavailableDays).omit({
  id: true,
  createdAt: true
});

export const insertRecurrentBlockedTimeSchema = createInsertSchema(recurrentBlockedTimes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertArticleCategorySchema = createInsertSchema(articleCategories).omit({
  id: true,
  createdAt: true
});

export const insertHelpArticleSchema = createInsertSchema(helpArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertHelpCategorySchema = createInsertSchema(helpCategories).omit({
  id: true,
  createdAt: true
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Niche = typeof niches.$inferSelect;
export type InsertNiche = z.infer<typeof insertNicheSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type ProviderService = typeof providerServices.$inferSelect;
export type InsertProviderService = z.infer<typeof insertProviderServiceSchema>;

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;

export type BlockedTimeSlot = typeof blockedTimeSlots.$inferSelect;
export type InsertBlockedTimeSlot = z.infer<typeof insertBlockedTimeSlotSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ProviderServiceFee = typeof providerServiceFees.$inferSelect;
export type InsertProviderServiceFee = z.infer<typeof insertProviderServiceFeeSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;

export type ProviderSettings = typeof providerSettings.$inferSelect;
export type InsertProviderSettings = z.infer<typeof insertProviderSettingsSchema>;

export type ProviderBreak = typeof providerBreaks.$inferSelect;
export type InsertProviderBreak = z.infer<typeof insertProviderBreakSchema>;

export type ServiceTemplate = typeof serviceTemplates.$inferSelect;
export type InsertServiceTemplate = z.infer<typeof insertServiceTemplateSchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;

export type UserPaymentMethod = typeof userPaymentMethods.$inferSelect;
export type InsertUserPaymentMethod = z.infer<typeof insertUserPaymentMethodSchema>;

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;

export type ClientPaymentPreference = typeof clientPaymentPreferences.$inferSelect;
export type InsertClientPaymentPreference = z.infer<typeof insertClientPaymentPreferenceSchema>;

export type ProviderPaymentPreference = typeof providerPaymentPreferences.$inferSelect;
export type InsertProviderPaymentPreference = z.infer<typeof insertProviderPaymentPreferenceSchema>;

export type ProviderLocation = typeof providerLocations.$inferSelect;
export type InsertProviderLocation = z.infer<typeof insertProviderLocationSchema>;

export type UnavailableDay = typeof unavailableDays.$inferSelect;
export type InsertUnavailableDay = z.infer<typeof insertUnavailableDaySchema>;

export type RecurrentBlockedTime = typeof recurrentBlockedTimes.$inferSelect;
export type InsertRecurrentBlockedTime = z.infer<typeof insertRecurrentBlockedTimeSchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type ArticleCategory = typeof articleCategories.$inferSelect;
export type InsertArticleCategory = z.infer<typeof insertArticleCategorySchema>;

export type HelpArticle = typeof helpArticles.$inferSelect;
export type InsertHelpArticle = z.infer<typeof insertHelpArticleSchema>;

export type HelpCategory = typeof helpCategories.$inferSelect;
export type InsertHelpCategory = z.infer<typeof insertHelpCategorySchema>;

export type Help = HelpArticle;
export type InsertHelp = InsertHelpArticle;

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;