typescript
import { and, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "./db";

import {
        Appointment,
        appointments,
        Article,
        ArticleCategory,
        articles,
        articleCategories,
        availability,
        Availability,
        BlockedTimeSlot,
        blockedTimeSlots,
        categories,
        Category,
        Coupon,
        coupons,
        Favorite,
        favorites,
        Help,
        HelpCategory,
        helpArticles,
        helpCategories,
        InsertAppointment,
        InsertArticle,
        InsertArticleCategory,
        InsertAvailability,
        InsertBlockedTimeSlot,
        InsertCategory,
        InsertCoupon,
        InsertFavorite,
        InsertHelp,
        InsertHelpCategory,
        InsertNiche,
        InsertNotification,
        InsertPromotion,
        InsertProviderService,
        InsertProviderServiceFee,
        InsertRecurrentBlockedTime,
        InsertReview,
        InsertSchedule,
        InsertService,
        InsertServiceTemplate,
        InsertTimeSlot,
        InsertUnavailableDay,
        InsertUser,
        Niche,
        niches,
        Review,
        reviews,
        Notification,
        notifications,
        Promotion,
        promotions,
        RecurrentBlockedTime,
        recurrentBlockedTimes,
        Schedule,
        schedules,
        TimeSlot,
        timeSlots,
        UnavailableDay,
        unavailableDays,
        ProviderService,
        ProviderServiceFee,
        providerServiceFees,
        providerServices,
        providerSettings,
        Review,
        reviews,
        Service,
        services,
        User,
        users,
} from "../shared/schema";

// Session import
import session from "express-session";
// Import this dynamically to fix ESM issues
let PostgresSessionStore: any;
// We'll initialize this in the constructor

// Storage interface definition
export interface IStorage {
        sessionStore: session.Store;

        // User methods
        getUsers(): Promise<User[]>;
        getUserById(id: number): Promise<User | undefined>;
        getUsersCount(userType?: string): Promise<number>;
        getServicesCount(): Promise<number>;
        getCategoriesCount(): Promise<number>;
        getAppointmentsCount(status?: string): Promise<number>;
        getUserByEmail(email: string): Promise<User | undefined>;
        getUsersByType(type: string): Promise<User[]>;
        createUser(user: InsertUser): Promise<User>;
        updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
        deleteUser(id: number): Promise<void>;

        // Provider Settings methods
        getProviderSettings(providerId: number): Promise<any>;
        createProviderSettings(settings: any): Promise<any>;
        updateProviderSettings(providerId: number, settings: any): Promise<any>;

        // Schedule methods
        getSchedules(): Promise<Schedule[]>;
        getScheduleById(id: number): Promise<Schedule | undefined>;
        getSchedulesByProviderId(providerId: number): Promise<Schedule[]>;
        createSchedule(schedule: InsertSchedule): Promise<Schedule>;
        updateSchedule(
                id: number,
                schedule: Partial<InsertSchedule>,
        ): Promise<Schedule>;
        deleteSchedule(id: number): Promise<void>;

        // Niche methods
        getNiches(): Promise<Niche[]>;
        getNicheById(id: number): Promise<Niche | undefined>;
        getNichesByIds(nicheIds: number[]): Promise<Niche[]>;
        createNiche(niche: InsertNiche): Promise<Niche>;
        updateNiche(id: number, niche: Partial<InsertNiche>): Promise<Niche>;
        deleteNiche(id: number): Promise<void>;

        // Category methods
        getCategories(): Promise<Category[]>;
        getCategoryById(id: number): Promise<Category | undefined>;
        getCategoriesByNicheId(nicheId: number): Promise<Category[]>;
        getCategoriesByIds(categoryIds: number[]): Promise<Category[]>;
        createCategory(category: InsertCategory): Promise<Category>;
        updateCategory(
                id: number,
                category: Partial<InsertCategory>,
        ): Promise<Category>;
        deleteCategory(id: number): Promise<void>;

        // Service methods
        getServices(): Promise<Service[]>;
        getServiceById(id: number): Promise<Service | undefined>;
        getServicesByCategoryId(categoryId: number): Promise<Service[]>;
        getServicesByCategory(categoryId: number): Promise<Service[]>;
        getServicesByProvider(providerId: number): Promise<Service[]>;
        getServicesByIds(serviceIds: number[]): Promise<Service[]>;
        createService(service: InsertService): Promise<Service>;
        updateService(
                id: number,
                service: Partial<InsertService>,
        ): Promise<Service>;
        deleteService(id: number): Promise<void>;

        // ProviderService methods
        getProviderServices(): Promise<ProviderService[]>;
        getProviderServiceById(
                id: number,
        ): Promise<ProviderService | undefined>;
        getProviderServicesByProviderId(
                providerId: number,
        ): Promise<ProviderService[]>;
        getProviderServicesByProvider(
                providerId: number,
        ): Promise<ProviderService[]>;
        getProviderServiceByService(
                providerId: number,
                serviceId: number,
        ): Promise<ProviderService | undefined>;
        getProviderServiceByProviderAndService(
                providerId: number,
                serviceId: number,
        ): Promise<ProviderService | undefined>;
        createProviderService(
                providerService: InsertProviderService,
        ): Promise<ProviderService>;
        updateProviderService(
                id: number,
                providerService: Partial<InsertProviderService>,
        ): Promise<ProviderService>;
        deleteProviderService(id: number): Promise<void>;

        // Appointment methods
        getAppointments(): Promise<Appointment[]>;
        getAppointmentById(id: number): Promise<Appointment | undefined>;
        getAppointmentsByProviderId(providerId: number): Promise<Appointment[]>;
        getAppointmentsByClientId(clientId: number): Promise<Appointment[]>;
        getClientAppointments(clientId: number): Promise<any[]>;
        createAppointment(appointment: InsertAppointment): Promise<Appointment>;
        updateAppointment(
                id: number,
                appointment: Partial<InsertAppointment>,
        ): Promise<Appointment>;
        deleteAppointment(id: number): Promise<void>;

        // Review methods
        getReviews(): Promise<Review[]>;
        getReviewById(id: number): Promise<Review | undefined>;
        getReviewsByProviderId(providerId: number): Promise<Review[]>;
        getReviewsByClientId(clientId: number): Promise<Review[]>;
        createReview(review: InsertReview): Promise<Review>;
        updateReview(
                id: number,
                review: Partial<InsertReview>,
        ): Promise<Review>;
        deleteReview(id: number): Promise<void>;

        // Favorite methods
        getFavorites(): Promise<Favorite[]>;
        getFavoriteById(id: number): Promise<Favorite | undefined>;
        getFavoritesByClientId(clientId: number): Promise<Favorite[]>;
        createFavorite(favorite: InsertFavorite): Promise<Favorite>;
        deleteFavorite(id: number): Promise<void>;

        // BlockedTimeSlot methods
        getBlockedTimes(): Promise<BlockedTimeSlot[]>;
        getBlockedTimeById(id: number): Promise<BlockedTimeSlot | undefined>;
        getBlockedTimesByProviderId(
                providerId: number,
        ): Promise<BlockedTimeSlot[]>;
        getBlockedTimeSlotsByDate(
                providerId: number,
                date: string,
        ): Promise<BlockedTimeSlot[]>;
        createBlockedTime(
                BlockedTimeSlot: InsertBlockedTimeSlot,
        ): Promise<BlockedTimeSlot>;
        updateBlockedTime(
                id: number,
                BlockedTimeSlot: Partial<InsertBlockedTimeSlot>,
        ): Promise<BlockedTimeSlot>;
        deleteBlockedTime(id: number): Promise<void>;

        // TimeSlot methods
        getTimeSlots(): Promise<TimeSlot[]>;
        getTimeSlotById(id: number): Promise<TimeSlot | undefined>;
        getTimeSlotsByProviderId(providerId: number): Promise<TimeSlot[]>;
        createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
        updateTimeSlot(
                id: number,
                timeSlot: Partial<InsertTimeSlot>,
        ): Promise<TimeSlot>;
        deleteTimeSlot(id: number): Promise<void>;

        // UnavailableDay methods
        getUnavailableDays(): Promise<UnavailableDay[]>;
        getUnavailableDayById(id: number): Promise<UnavailableDay | undefined>;
        getUnavailableDaysByProviderId(
                providerId: number,
        ): Promise<UnavailableDay[]>;
        createUnavailableDay(
                unavailableDay: InsertUnavailableDay,
        ): Promise<UnavailableDay>;
        updateUnavailableDay(
                id: number,
                unavailableDay: Partial<InsertUnavailableDay>,
        ): Promise<UnavailableDay>;
        deleteUnavailableDay(id: number): Promise<void>;

        // RecurrentBlockedTime methods
        getRecurrentBlockedTimes(): Promise<RecurrentBlockedTime[]>;
        getRecurrentBlockedTimeById(
                id: number,
        ): Promise<RecurrentBlockedTime | undefined>;
        getRecurrentBlockedTimesByProviderId(
                providerId: number,
        ): Promise<RecurrentBlockedTime[]>;
        createRecurrentBlockedTime(
                recurrentBlockedTime: InsertRecurrentBlockedTime,
        ): Promise<RecurrentBlockedTime>;
        updateRecurrentBlockedTime(
                id: number,
                recurrentBlockedTime: Partial<InsertRecurrentBlockedTime>,
        ): Promise<RecurrentBlockedTime>;
        deleteRecurrentBlockedTime(id: number): Promise<void>;

        // Availability methods
        getAvailabilities(): Promise<Availability[]>;
        getAvailabilityById(id: number): Promise<Availability | undefined>;
        getAvailabilityByProviderId(
                providerId: number,
        ): Promise<Availability[]>;
        getAvailabilityByDay(
                providerId: number,
                dayOfWeek: number,
        ): Promise<Availability | undefined>;
        getAvailabilityByDate(
                providerId: number,
                date: string,
        ): Promise<Availability | undefined>;
        createAvailability(
                availability: InsertAvailability,
        ): Promise<Availability>;
        updateAvailability(
                id: number,
                availability: Partial<InsertAvailability>,
        ): Promise<Availability>;
        deleteAvailability(id: number): Promise<void>;

        // Notification methods
        getNotifications(): Promise<Notification[]>;
        getNotificationById(id: number): Promise<Notification | undefined>;
        getNotificationsByUserId(userId: number): Promise<Notification[]>;
        createNotification(
                notification: InsertNotification,
        ): Promise<Notification>;
        updateNotification(
                id: number,
                notification: Partial<InsertNotification>,
        ): Promise<Notification>;
        deleteNotification(id: number): Promise<void>;

        // Article methods
        getArticles(): Promise<Article[]>;
        getArticleById(id: number): Promise<Article | undefined>;
        getArticlesByCategoryId(categoryId: number): Promise<Article[]>;
        createArticle(article: InsertArticle): Promise<Article>;
        updateArticle(
                id: number,
                article: Partial<InsertArticle>,
        ): Promise<Article>;
        deleteArticle(id: number): Promise<void>;

        // ArticleCategory methods
        getArticleCategories(): Promise<ArticleCategory[]>;
        getArticleCategoryById(
                id: number,
        ): Promise<ArticleCategory | undefined>;
        createArticleCategory(
                articleCategory: InsertArticleCategory,
        ): Promise<ArticleCategory>;
        updateArticleCategory(
                id: number,
                articleCategory: Partial<InsertArticleCategory>,
        ): Promise<ArticleCategory>;
        deleteArticleCategory(id: number): Promise<void>;

        // Coupon methods
        getCoupons(): Promise<Coupon[]>;
        getCouponById(id: number): Promise<Coupon | undefined>;
        getCouponByCode(code: string): Promise<Coupon | undefined>;
        createCoupon(coupon: InsertCoupon): Promise<Coupon>;
        updateCoupon(
                id: number,
                coupon: Partial<InsertCoupon>,
        ): Promise<Coupon>;
        deleteCoupon(id: number): Promise<void>;

        // ProviderServiceFee methods
        getAllProviderFees(): Promise<ProviderServiceFee[]>;
        getProviderFee(id: number): Promise<ProviderServiceFee | undefined>;
        getProviderFeeByProviderId(
                providerId: number,
        ): Promise<ProviderServiceFee | undefined>;
        createProviderFee(
                fee: InsertProviderServiceFee,
        ): Promise<ProviderServiceFee>;
        updateProviderFee(
                id: number,
                fee: Partial<InsertProviderServiceFee>,
        ): Promise<ProviderServiceFee>;
        deleteProviderFee(id: number): Promise<void>;
        getAllProviders(): Promise<User[]>;

        // Financial settings methods
        getFinancialSettings(): Promise<any>;
        saveFinancialSettings(settings: any): Promise<any>;

        // Promotion methods
        getPromotions(): Promise<Promotion[]>;
        getPromotionById(id: number): Promise<Promotion | undefined>;
        getActivePromotions(currentDate: Date): Promise<Promotion[]>;
        getApplicablePromotions(filters: {
                serviceId?: number;
                providerId?: number;
                categoryId?: number;
                nicheId?: number;
                currentDate: Date;
        }): Promise<Promotion[]>;
        createPromotion(promotion: InsertPromotion): Promise<Promotion>;
        updatePromotion(
                id: number,
                promotion: Partial<InsertPromotion>,
        ): Promise<Promotion>;
        deletePromotion(id: number): Promise<void>;

        // Help methods
        getHelpArticles(): Promise<Help[]>;
        getHelpArticleById(id: number): Promise<Help | undefined>;
        getHelpArticlesByCategoryId(categoryId: number): Promise<Help[]>;
        createHelpArticle(help: InsertHelp): Promise<Help>;
        updateHelpArticle(id: number, help: Partial<InsertHelp>): Promise<Help>;
        deleteHelpArticle(id: number): Promise<void>;

        // HelpCategory methods
        getHelpCategories(): Promise<HelpCategory[]>;
        getHelpCategoryById(id: number): Promise<HelpCategory | undefined>;
        createHelpCategory(
                helpCategory: InsertHelpCategory,
        ): Promise<HelpCategory>;
        updateHelpCategory(
                id: number,
                helpCategory: Partial<InsertHelpCategory>,
        ): Promise<HelpCategory>;
        deleteHelpCategory(id: number): Promise<void>;

        // Missing methods for compatibility
        getProviderReviews(providerId: number): Promise<Review[]>;
        getReviewsByProviderId(providerId: number): Promise<Review[]>;

        // Payment settings methods
        getPaymentSettings(): Promise<any>;
        blockTimeSlot(providerId: number, date: string, startTime: string, endTime: string): Promise<boolean>;
}

// Memory storage implementation for testing
export class MemStorage implements IStorage {
        private users: User[] = [];
        private schedules: Schedule[] = [];
        private niches: Niche[] = [];
        private categories: Category[] = [];
        private services: Service[] = [];
        private providerServices: ProviderService[] = [];
        private appointments: Appointment[] = [];
        private reviews: Review[] = [];
        private favorites: Favorite[] = [];
        private blockedTimeSlots: BlockedTimeSlot[] = [];
        private timeSlots: TimeSlot[] = [];
        private unavailableDays: UnavailableDay[] = [];
        private recurrentBlockedTimes: RecurrentBlockedTime[] = [];
        private availability: Availability[] = [];
        private serviceTemplates: ServiceTemplate[] = [];
        private notifications: Notification[] = [];
        private articles: Article[] = [];
        private articleCategories: ArticleCategory[] = [];
        private coupons: Coupon[] = [];
        private providerServiceFees: ProviderServiceFee[] = [];
        private promotions: Promotion[] = [];
        private helpArticles: Help[] = [];
        private helpCategories: HelpCategory[] = [];
        private providerSettings: any[] = [];

        sessionStore: session.Store;

        constructor() {
                this.sessionStore = new session.MemoryStore();
        }

        // User methods
        async getUsers(): Promise<User[]> {
                return this.users;
        }

        async getUsersCount(userType?: string): Promise<number> {
                if (userType) {
                        return this.users.filter(
                                (user) => user.userType === userType,
                        ).length;
                }
                return this.users.length;
        }

        async getServicesCount(): Promise<number> {
                return this.services.length;
        }

        async getCategoriesCount(): Promise<number> {
                return this.categories.length;
        }

        async getAppointmentsCount(status?: string): Promise<number> {
                if (status) {
                        return this.appointments.filter(
                                (apt) => apt.status === status,
                        ).length;
                }
                return this.appointments.length;
        }

        async getUserById(id: number): Promise<User | undefined> {
                return this.users.find((user) => user.id === id);
        }

        async getUserByEmail(email: string): Promise<User | undefined> {
                return this.users.find((user) => user.email === email);
        }

        async getUsersByType(type: string): Promise<User[]> {
                return this.users.filter((user) => user.userType === type);
        }

        async createUser(user: InsertUser): Promise<User> {
                const newUser: User = {
                        id: this.users.length + 1,
                        name: user.name || null,
                        createdAt: new Date(),
                        isActive: user.isActive || null,
                        userType: user.userType,
                        email: user.email,
                        password: user.password,
                        profileImage: user.profileImage || null,
                        phone: user.phone || null,
                        address: user.address || null,
                        isVerified: user.isVerified || null,
                };

                this.users.push(newUser);
                return newUser;
        }

        async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
                const index = this.users.findIndex((u) => u.id === id);
                if (index === -1) {
                        throw new Error(`User with id ${id} not found`);
                }

                const updatedUser: User = {
                        ...this.users[index],
                        ...user,
                        id: this.users[index].id,
                        createdAt: this.users[index].createdAt,
                };

                this.users[index] = updatedUser;
                return updatedUser;
        }

        async deleteUser(id: number): Promise<void> {
                const index = this.users.findIndex((user) => user.id === id);
                if (index !== -1) {
                        this.users.splice(index, 1);
                }
        }

        // Schedule methods
        async getSchedules(): Promise<Schedule[]> {
                return this.schedules;
        }

        async getScheduleById(id: number): Promise<Schedule | undefined> {
                return this.schedules.find((schedule) => schedule.id === id);
        }

        async getSchedulesByProviderId(
                providerId: number,
        ): Promise<Schedule[]> {
                return this.schedules.filter(
                        (schedule) => schedule.providerId === providerId,
                );
        }

        async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
                const newSchedule: Schedule = {
                        id: this.schedules.length + 1,
                        providerId: schedule.providerId,
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                        isAvailable: schedule.isAvailable || null,
                        dayOfWeek: schedule.dayOfWeek,
                        intervalMinutes: schedule.intervalMinutes || null,
                };

                this.schedules.push(newSchedule);
                return newSchedule;
        }

        async updateSchedule(
                id: number,
                schedule: Partial<InsertSchedule>,
        ): Promise<Schedule> {
                const index = this.schedules.findIndex((s) => s.id === id);
                if (index === -1) {
                        throw new Error(`Schedule with id ${id} not found`);
                }

                const updatedSchedule: Schedule = {
                        ...this.schedules[index],
                        ...schedule,
                        id: this.schedules[index].id,
                };

                this.schedules[index] = updatedSchedule;
                return updatedSchedule;
        }

        async deleteSchedule(id: number): Promise<void> {
                const index = this.schedules.findIndex(
                        (schedule) => schedule.id === id,
                );
                if (index !== -1) {
                        this.schedules.splice(index, 1);
                }
        }

        // Niche methods
        async getNiches(): Promise<Niche[]> {
                return this.niches;
        }

        async getNicheById(id: number): Promise<Niche | undefined> {
                return this.niches.find((niche) => niche.id === id);
        }

        async createNiche(niche: InsertNiche): Promise<Niche> {
                const newNiche: Niche = {
                        id: this.niches.length + 1,
                        name: niche.name,
                        createdAt: new Date(),
                        description: niche.description || null,
                        icon: niche.icon || null,
                        updatedAt: new Date(),
                };

                this.niches.push(newNiche);
                return newNiche;
        }

        async updateNiche(
                id: number,
                niche: Partial<InsertNiche>,
        ): Promise<Niche> {
                const index = this.niches.findIndex((n) => n.id === id);
                if (index === -1) {
                        throw new Error(`Niche with id ${id} not found`);
                }

                const updatedNiche: Niche = {
                        ...this.niches[index],
                        ...niche,
                        id: this.niches[index].id,
                        createdAt: this.niches[index].createdAt,
                        updatedAt: new Date(),
                };

                this.niches[index] = updatedNiche;
                return updatedNiche;
        }

        async deleteNiche(id: number): Promise<void> {
                const index = this.niches.findIndex((niche) => niche.id === id);
                if (index !== -1) {
                        this.niches.splice(index, 1);
                }
        }

        // Category methods
        async getCategories(): Promise<Category[]> {
                return this.categories;
        }

        async getCategoryById(id: number): Promise<Category | undefined> {
                return this.categories.find((category) => category.id === id);
        }

        async getCategoriesByNicheId(nicheId: number): Promise<Category[]> {
                return this.categories.filter(
                        (category) => category.nicheId === nicheId,
                );
        }

        async createCategory(category: InsertCategory): Promise<Category> {
                const newCategory: Category = {
                        id: this.categories.length + 1,
                        name: category.name,
                        createdAt: new Date(),
                        description: category.description || null,
                        icon: category.icon || null,
                        color: category.color || null,
                        updatedAt: new Date(),
                        nicheId: category.nicheId,
                        parentId: category.parentId || null,
                };

                this.categories.push(newCategory);
                return newCategory;
        }

        async updateCategory(
                id: number,
                category: Partial<InsertCategory>,
        ): Promise<Category> {
                const index = this.categories.findIndex((c) => c.id === id);
                if (index === -1) {
                        throw new Error(`Category with id ${id} not found`);
                }

                const updatedCategory: Category = {
                        ...this.categories[index],
                        ...category,
                        id: this.categories[index].id,
                        createdAt: this.categories[index].createdAt,
                        updatedAt: new Date(),
                };

                this.categories[index] = updatedCategory;
                return updatedCategory;
        }

        async deleteCategory(id: number): Promise<void> {
                const index = this.categories.findIndex(
                        (category) => category.id === id,
                );
                if (index !== -1) {
                        this.categories.splice(index, 1);
                }
        }

        // Service methods
        async getServices(): Promise<Service[]> {
                return this.services;
        }

        async getServiceById(id: number): Promise<Service | undefined> {
                return this.services.find((service) => service.id === id);
        }

        async getServicesByCategoryId(categoryId: number): Promise<Service[]> {
                return this.services.filter(
                        (service) => service.categoryId === categoryId,
                );
        }

        async getServicesByCategory(categoryId: number): Promise<Service[]> {
                return this.services.filter(
                        (service) => service.categoryId === categoryId,
                );
        }

        async createService(service: InsertService): Promise<Service> {
                const newService: Service = {
                        id: this.services.length + 1,
                        providerId: service.providerId,
                        name: service.name,
                        description: service.description || null,
                        nicheId: service.nicheId || null,
                        categoryId: service.categoryId,
                        duration: service.duration,
                        isActive: service.isActive || null,
                        price: service.price || null,
                };

                this.services.push(newService);
                return newService;
        }

        async updateService(
                id: number,
                service: Partial<InsertService>,
        ): Promise<Service> {
                const index = this.services.findIndex((s) => s.id === id);
                if (index === -1) {
                        throw new Error(`Service with id ${id} not found`);
                }

                const updatedService: Service = {
                        ...this.services[index],
                        ...service,
                        id: this.services[index].id,
                };

                this.services[index] = updatedService;
                return updatedService;
        }

        async deleteService(id: number): Promise<void> {
                const index = this.services.findIndex(
                        (service) => service.id === id,
                );
                if (index !== -1) {
                        this.services.splice(index, 1);
                }
        }

        // ProviderService methods
        async getProviderServices(): Promise<ProviderService[]> {
                return this.providerServices;
        }

        async getProviderServiceById(
                id: number,
        ): Promise<ProviderService | undefined> {
                return this.providerServices.find(
                        (providerService) => providerService.id === id,
                );
        }

        async getProviderServicesByProviderId(
                providerId: number,
        ): Promise<ProviderService[]> {
                return this.providerServices.filter(
                        (providerService) =>
                                providerService.providerId === providerId,
                );
        }

        async getProviderServiceByService(
                providerId: number,
                serviceId: number,
        ): Promise<ProviderService | undefined> {
                return this.providerServices.find(
                        (providerService) =>
                                providerService.providerId === providerId &&
                                providerService.serviceId === serviceId,
                );
        }

        async createProviderService(
                providerService: InsertProviderService,
        ): Promise<ProviderService> {
                const newProviderService: ProviderService = {
                        id: this.providerServices.length + 1,
                        providerId: providerService.providerId,
                        serviceId: providerService.serviceId,
                        createdAt: new Date(),
                        duration: providerService.duration,
                        isActive: providerService.isActive || null,
                        price: providerService.price,
                        executionTime: providerService.executionTime,
                        breakTime: providerService.breakTime || null,
                };

                this.providerServices.push(newProviderService);
                return newProviderService;
        }

        async updateProviderService(
                id: number,
                providerService: Partial<InsertProviderService>,
        ): Promise<ProviderService> {
                const index = this.providerServices.findIndex(
                        (ps) => ps.id === id,
                );
                if (index === -1) {
                        throw new Error(
                                `ProviderService with id ${id} not found`,
                        );
                }

                const updatedProviderService: ProviderService = {
                        ...this.providerServices[index],
                        ...providerService,
                        id: this.providerServices[index].id,
                        createdAt: this.providerServices[index].createdAt,
                };

                this.providerServices[index] = updatedProviderService;
                return updatedProviderService;
        }

        async deleteProviderService(id: number): Promise<void> {
                const index = this.providerServices.findIndex(
                        (providerService) => providerService.id === id,
                );
                if (index !== -1) {
                        this.providerServices.splice(index, 1);
                }
        }

        async getProviderServicesByProvider(
                providerId: number,
        ): Promise<ProviderService[]> {
                return this.getProviderServicesByProviderId(providerId);
        }

        async getServicesByProvider(providerId: number): Promise<Service[]> {
                return this.services.filter(
                        (service) => service.providerId === providerId,
                );
        }

        async getProviderService(
                id: number,
        ): Promise<ProviderService | undefined> {
                return this.getProviderServiceById(id);
        }

        async getProviderServiceByProviderAndService(
                providerId: number,
                serviceId: number,
        ): Promise<ProviderService | undefined> {
                return this.getProviderServiceByService(providerId, serviceId);
        }

        async getServicesByIds(serviceIds: number[]): Promise<Service[]> {
                return this.services.filter((service) =>
                        serviceIds.includes(service.id),
                );
        }

        async getCategoriesByIds(categoryIds: number[]): Promise<Category[]> {
                return this.categories.filter((category) =>
                        categoryIds.includes(category.id),
                );
        }

        async getNichesByIds(nicheIds: number[]): Promise<Niche[]> {
                return this.niches.filter((niche) =>
                        nicheIds.includes(niche.id),
                );
        }

        // Availability methods
        async getAvailabilities(): Promise<Availability[]> {
                return this.availability;
        }

        async getAvailabilityById(
                id: number,
        ): Promise<Availability | undefined> {
                return this.availability.find(
                        (availability) => availability.id === id,
                );
        }

        async getAvailabilityByProviderId(
                providerId: number,
        ): Promise<Availability[]> {
                return this.availability.filter(
                        (availability) =>
                                availability.providerId === providerId,
                );
        }

        async getAvailabilityByDay(
                providerId: number,
                dayOfWeek: number,
        ): Promise<Availability | undefined> {
                return this.availability.find(
                        (avail) =>
                                avail.providerId === providerId &&
                                avail.dayOfWeek === dayOfWeek,
                );
        }

        async getAvailabilityByDate(
                providerId: number,
                date: string,
        ): Promise<Availability | undefined> {
                return this.availability.find(
                        (avail) =>
                                avail.providerId === providerId &&
                                avail.date === date,
                );
        }

        async createAvailability(
                availability: InsertAvailability,
        ): Promise<Availability> {
                const newAvailability: Availability = {
                        id: this.availability.length + 1,
                        date: availability.date || null,
                        dayOfWeek: availability.dayOfWeek,
                        providerId: availability.providerId,
                        startTime: availability.startTime,
                        endTime: availability.endTime,
                        isAvailable: availability.isAvailable || null,
                        intervalMinutes: availability.intervalMinutes || null,
                };

                this.availability.push(newAvailability);
                return newAvailability;
        }

        async updateAvailability(
                id: number,
                availability: Partial<InsertAvailability>,
        ): Promise<Availability> {
                const index = this.availability.findIndex((a) => a.id === id);
                if (index === -1) {
                        throw new Error(`Availability with id ${id} not found`);
                }

                const updatedAvailability: Availability = {
                        ...this.availability[index],
                        ...availability,
                        id: this.availability[index].id,
                };

                this.availability[index] = updatedAvailability;
                return updatedAvailability;
        }

        async deleteAvailability(id: number): Promise<void> {
                const index = this.availability.findIndex(
                        (availability) => availability.id === id,
                );
                if (index !== -1) {
                        this.availability.splice(index, 1);
                }
        }

        // Implementation for remaining methods...
        // Add implementations as needed

        // Financial settings methods
        async getFinancialSettings(): Promise<any> {
                // Implementação temporária - substituir com tabela real quando disponível
                return {
                        id: 1,
                        serviceFee: 500, // 5%
                        fixedServiceFee: 200, // R$ 2,00
                        minServiceFee: 100, // R$ 1,00
                        maxServiceFee: 5000, // R$ 50,00
                        payoutSchedule: "weekly",

                        stripeEnabled: false,
                        stripeLiveMode: false,
                        stripePublicKey: "",
                        stripeSecretKey: "",
                        stripeWebhookSecret: "",
                        stripeConnectEnabled: false,

                        asaasEnabled: false,
                        asaasLiveMode: false,
                        asaasApiKey: "",
                        asaasWebhookToken: "",
                        asaasWalletId: "",
                        asaasSplitEnabled: false,

                        enableCoupons: true,
                        maxDiscountPercentage: 30,
                        defaultExpirationDays: 30,
                };
        }

        async saveFinancialSettings(settings: any): Promise<any> {
                // Implementação temporária - substituir com tabela real quando disponível
                return settings;
        }

        // Payment settings methods
        async getPaymentSettings(): Promise<any> {
                // Implementação temporária - substituir com tabela real quando disponível
                return {
                        id: 1,
                        serviceFee: 175, // R$ 1,75 em centavos
                        serviceFeePercentage: 175, // R$ 1,75 em centavos
                        minServiceFee: 100, // R$ 1,00 em centavos
                        maxServiceFee: 5000, // R$ 50,00 em centavos
                        payoutSchedule: "weekly",

                        stripeEnabled: false,
                        stripeLiveMode: false,
                        stripePublicKey: "",
                        stripeSecretKey: "",
                        stripeWebhookSecret: "",
                        stripeConnectEnabled: false,

                        asaasEnabled: false,
                        asaasLiveMode: false,
                        asaasApiKey: "",
                        asaasWebhookToken: "",
                        asaasWalletId: "",
                        asaasSplitEnabled: false,
                };
        }
        async blockTimeSlot(providerId: number, date: string, startTime: string, endTime: string): Promise<boolean> {
                console.log('blockTimeSlot in MemStorage is not implemented');
                return false;
        }
        // Provider Fee methods
        async getAllProviderFees(): Promise<ProviderServiceFee[]> {
                return this.providerServiceFees;
        }

        async getProviderFee(
                id: number,
        ): Promise<ProviderServiceFee | undefined> {
                return this.providerServiceFees.find((fee) => fee.id === id);
        }

        async getProviderFeeByProviderId(
                providerId: number,
        ): Promise<ProviderServiceFee | undefined> {
                return this.providerServiceFees.find(
                        (fee) =>
                                fee.providerId === providerId &&
                                fee.isActive === true,
                );
        }

        async createProviderFee(
                fee: InsertProviderServiceFee,
        ): Promise<ProviderServiceFee> {
                const newFee: ProviderServiceFee = {
                        id: this.providerServiceFees.length + 1,
                        providerId: fee.providerId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        feeAmount: fee.feeAmount,
                        isActive: fee.isActive || true,
                        minFeeAmount: fee.minFeeAmount || null,
                        maxFeeAmount: fee.maxFeeAmount || null,
                        description: fee.description || null,
                };

                this.providerServiceFees.push(newFee);
                return newFee;
        }

        async updateProviderFee(
                id: number,
                fee: Partial<InsertProviderServiceFee>,
        ): Promise<ProviderServiceFee> {
                const index = this.providerServiceFees.findIndex(
                        (f) => f.id === id,
                );
                if (index === -1) {
                        throw new Error(
                                `ProviderServiceFee with id ${id} not found`,
                        );
                }

                const updatedFee: ProviderServiceFee = {
                        ...this.providerServiceFees[index],
                        ...fee,
                        id: this.providerServiceFees[index].id,
                        createdAt: this.providerServiceFees[index].createdAt,
                        updatedAt: new Date(),
                };

                this.providerServiceFees[index] = updatedFee;
                return updatedFee;
        }

        async deleteProviderFee(id: number): Promise<void> {
                const index = this.providerServiceFees.findIndex(
                        (fee) => fee.id === id,
                );
                if (index !== -1) {
                        this.providerServiceFees.splice(index, 1);
                }
        }

        async getAllProviders(): Promise<User[]> {
                return this.users.filter(
                        (user) => user.userType === "provider",
                );
        }

        // Implement remaining required methods
        async getAppointmentsByProviderId(
                providerId: number,
        ): Promise<Appointment[]> {
                return [];
        }

        async getAppointmentsByClientId(
                clientId: number,
        ): Promise<Appointment[]> {
                return [];
        }

        async createAppointment(
                appointment: InsertAppointment,
        ): Promise<Appointment> {
                return {} as Appointment;
        }

        async updateAppointment(
                id: number,
                appointment: Partial<InsertAppointment>,
        ): Promise<Appointment> {
                return {} as Appointment;
        }

        async deleteAppointment(id: number): Promise<void> {}

        async getAppointments(): Promise<Appointment[]> {
                return [];
        }

        async getAppointmentById(id: number): Promise<Appointment | undefined> {
                return undefined;
        }

        // Other required methods (implement as needed)
        async getReviews(): Promise<Review[]> {
                return [];
        }
        async getReviewById(id: number): Promise<Review | undefined> {
                return undefined;
        }
        async getReviewsByProviderId(providerId: number): Promise<Review[]> {
                return [];
        }
        async getReviewsByClientId(clientId: number): Promise<Review[]> {
                return [];
        }
        async createReview(review: InsertReview): Promise<Review> {
                return {} as Review;
        }
        async updateReview(
                id: number,
                review: Partial<InsertReview>,
        ): Promise<Review> {
                return {} as Review;
        }
        async deleteReview(id: number): Promise<void> {}

        async getFavorites(): Promise<Favorite[]> {
                return [];
        }
        async getFavoriteById(id: number): Promise<Favorite | undefined> {
                return undefined;
        }
        async getFavoritesByClientId(clientId: number): Promise<Favorite[]> {
                return [];
        }
        async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
                return {} as Favorite;
        }
        async deleteFavorite(id: number): Promise<void> {}

        async getBlockedTimes(): Promise<BlockedTimeSlot[]> {
                return [];
        }
        async getBlockedTimeById(
                id: number,
        ): Promise<BlockedTimeSlot | undefined> {
                return undefined;
        }
        async getBlockedTimesByProviderId(
                providerId: number,
        ): Promise<BlockedTimeSlot[]> {
                return [];
        }
        async getBlockedTimeSlotsByDate(
                providerId: number,
                date: string,
        ): Promise<BlockedTimeSlot[]> {
                return [];
        }
        async createBlockedTime(
                BlockedTimeSlot: InsertBlockedTimeSlot,
        ): Promise<BlockedTimeSlot> {
                return {} as BlockedTimeSlot;
        }
        async updateBlockedTime(
                id: number,
                BlockedTimeSlot: Partial<InsertBlockedTimeSlot>,
        ): Promise<BlockedTimeSlot> {
                return {} as BlockedTimeSlot;
        }
        async deleteBlockedTime(id: number): Promise<void> {}

        async getTimeSlots(): Promise<TimeSlot[]> {
                return [];
        }
        async getTimeSlotById(id: number): Promise<TimeSlot | undefined> {
                return undefined;
        }
        async getTimeSlotsByProviderId(
                providerId: number,
        ): Promise<TimeSlot[]> {
                return [];
        }
        async createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot> {
                return {} as TimeSlot;
        }
        async updateTimeSlot(
                id: number,
                timeSlot: Partial<InsertTimeSlot>,
        ): Promise<TimeSlot> {
                return {} as TimeSlot;
        }
        async deleteTimeSlot(id: number): Promise<void> {}

        async getUnavailableDays(): Promise<UnavailableDay[]> {
                return [];
        }
        async getUnavailableDayById(
                id: number,
        ): Promise<UnavailableDay | undefined> {
                return undefined;
        }
        async getUnavailableDaysByProviderId(
                providerId: number,
        ): Promise<UnavailableDay[]> {
                return [];
        }
        async createUnavailableDay(
                unavailableDay: InsertUnavailableDay,
        ): Promise<UnavailableDay> {
                return {} as UnavailableDay;
        }
        async updateUnavailableDay(
                id: number,
                unavailableDay: Partial<InsertUnavailableDay>,
        ): Promise<UnavailableDay> {
                return {} as UnavailableDay;
        }
        async deleteUnavailableDay(id: number): Promise<void> {}

        async getRecurrentBlockedTimes(): Promise<RecurrentBlockedTime[]> {
                return [];
        }
        async getRecurrentBlockedTimeById(
                id: number,
        ): Promise<RecurrentBlockedTime | undefined> {
                return undefined;
        }
        async getRecurrentBlockedTimesByProviderId(
                providerId: number,
        ): Promise<RecurrentBlockedTime[]> {
                return [];
        }
        async createRecurrentBlockedTime(
                recurrentBlockedTime: InsertRecurrentBlockedTime,
        ): Promise<RecurrentBlockedTime> {
                return {} as RecurrentBlockedTime;
        }
        async updateRecurrentBlockedTime(
                id: number,
                recurrentBlockedTime: Partial<InsertRecurrentBlockedTime>,
        ): Promise<RecurrentBlockedTime> {
                return {} as RecurrentBlockedTime;
        }
        async deleteRecurrentBlockedTime(id: number): Promise<void> {}

        async getServiceTemplates(): Promise<ServiceTemplate[]> {
                return [];
        }
        async getServiceTemplateById(
                id: number,
        ): Promise<ServiceTemplate | undefined> {
                return undefined;
        }
        async getServiceTemplatesByCategoryId(
                categoryId: number,
        ): Promise<ServiceTemplate[]> {
                return [];
        }
        async createServiceTemplate(
                serviceTemplate: InsertServiceTemplate,
        ): Promise<ServiceTemplate> {
                return {} as ServiceTemplate;
        }
        async updateServiceTemplate(
                id: number,
                serviceTemplate: Partial<InsertServiceTemplate>,
        ): Promise<ServiceTemplate> {
                return {} as ServiceTemplate;
        }
        async deleteServiceTemplate(id: number): Promise<void> {}

        async getNotifications(): Promise<Notification[]> {
                return [];
        }
        async getNotificationById(
                id: number,
        ): Promise<Notification | undefined> {
                return undefined;
        }
        async getNotificationsByUserId(
                userId: number,
        ): Promise<Notification[]> {
                return [];
        }
        async createNotification(
                notification: InsertNotification,
        ): Promise<Notification> {
                return {} as Notification;
        }
        async updateNotification(
                id: number,
                notification: Partial<InsertNotification>,
        ): Promise<Notification> {
                return {} as Notification;
        }
        async deleteNotification(id: number): Promise<void> {}

        async getArticles(): Promise<Article[]> {
                return [];
        }
        async getArticleById(id: number): Promise<Article | undefined> {
                return undefined;
        }
        async getArticlesByCategoryId(categoryId: number): Promise<Article[]> {
                return [];
        }
        async createArticle(article: InsertArticle): Promise<Article> {
                return {} as Article;
        }
        async updateArticle(
                id: number,
                article: Partial<InsertArticle>,
        ): Promise<Article> {
                return {} as Article;
        }
        async deleteArticle(id: number): Promise<void> {}

        async getArticleCategories(): Promise<ArticleCategory[]> {
                return [];
        }
        async getArticleCategoryById(
                id: number,
        ): Promise<ArticleCategory | undefined> {
                return undefined;
        }
        async createArticleCategory(
                articleCategory: InsertArticleCategory,
        ): Promise<ArticleCategory> {
                return {} as ArticleCategory;
        }
        async updateArticleCategory(
                id: number,
                articleCategory: Partial<InsertArticleCategory>,
        ): Promise<ArticleCategory> {
                return {} as ArticleCategory;
        }
        async deleteArticleCategory(id: number): Promise<void> {}

        async getCoupons(): Promise<Coupon[]> {
                return [];
        }
        async getCouponById(id: number): Promise<Coupon | undefined> {
                return undefined;
        }
        async getCouponByCode(code: string): Promise<Coupon | undefined> {
                return undefined;
        }
        async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
                return {} as Coupon;
        }
        async updateCoupon(
                id: number,
                coupon: Partial<InsertCoupon>,
        ): Promise<Coupon> {
                return {} as Coupon;
        }
        async deleteCoupon(id: number): Promise<void> {}

        async getPromotions(): Promise<Promotion[]> {
                return [];
        }
        async getPromotionById(id: number): Promise<Promotion | undefined> {
                return undefined;
        }
        async getActivePromotions(currentDate: Date): Promise<Promotion[]> {
                return [];
        }
        async getApplicablePromotions(filters: {
                serviceId?: number;
                providerId?: number;
                categoryId?: number;
                nicheId?: number;
                currentDate: Date;
        }): Promise<Promotion[]> {
                return [];
        }
        async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
                return {} as Promotion;
        }
        async updatePromotion(
                id: number,
                promotion: Partial<InsertPromotion>,
        ): Promise<Promotion> {
                return {} as Promotion;
        }
        async deletePromotion(id: number): Promise<void> {}

        async getHelpArticles(): Promise<Help[]> {
                return [];
        }
        async getHelpArticleById(id: number): Promise<Help | undefined> {
                return undefined;
        }
        async getHelpArticlesByCategoryId(categoryId: number): Promise<Help[]> {
                return [];
        }
        async createHelpArticle(help: InsertHelp): Promise<Help> {
                return {} as Help;
        }
        async updateHelpArticle(
                id: number,
                help: Partial<InsertHelp>,
        ): Promise<Help> {
                return {} as Help;
        }
        async deleteHelpArticle(id: number): Promise<void> {}

        async getHelpCategories(): Promise<HelpCategory[]> {
                return [];
        }
        async getHelpCategoryById(
                id: number,
        ): Promise<HelpCategory | undefined> {
                return undefined;
        }
        async createHelpCategory(
                helpCategory: InsertHelpCategory,
        ): Promise<HelpCategory> {
                return {} as HelpCategory;
        }
        async updateHelpCategory(
                id: number,
                helpCategory: Partial<InsertHelpCategory>,
        ): Promise<HelpCategory> {
                return {} as HelpCategory;
        }
        async deleteHelpCategory(id: number): Promise<void> {}

        // Implementar métodos ausentes
        async getProviderReviews(providerId: number): Promise<Review[]> {
                return this.getReviewsByProviderId(providerId);
        }

        async getReviewsByProviderId(providerId: number): Promise<Review[]> {
                try {
                        const result = await db
                                .select()
                                .from(reviews)
                                .where(eq(reviews.providerId, providerId))
                                .orderBy(desc(reviews.createdAt));
                        return result || [];
                } catch (error) {
                        console.error("Erro ao buscar avaliações do prestador:", error);
                        return [];
                }
        }

        async getReviews(): Promise<Review[]> {
                try {
                        const result = await db
                                .select()
                                .from(reviews)
                                .orderBy(desc(reviews.createdAt));
                        return result || [];
                } catch (error) {
                        console.error("Erro ao buscar avaliações:", error);
                        return [];
                }
        }

        async getReviewById(id: number): Promise<Review | undefined> {
                try {
                        const result = await db
                                .select()
                                .from(reviews)
                                .where(eq(reviews.id, id));
                        return result[0];
                } catch (error) {
                        console.error("Erro ao buscar avaliação:", error);
                        return undefined;
                }
        }

        async getReviewsByClientId(clientId: number): Promise<Review[]> {
                try {
                        const result = await db
                                .select()
                                .from(reviews)
                                .where(eq(reviews.clientId, clientId))
                                .orderBy(desc(reviews.createdAt));
                        return result || [];
                } catch (error) {
                        console.error("Erro ao buscar avaliações do cliente:", error);
                        return [];
                }
        }

        async createReview(review: InsertReview): Promise<Review> {
                try {
                        const result = await db
                                .insert(reviews)
                                .values(review)
                                .returning();
                        return result[0];
                } catch (error) {
                        console.error("Erro ao criar avaliação:", error);
                        throw new Error("Falha ao criar avaliação");
                }
        }

        async updateReview(
                id: number,
                review: Partial<InsertReview>,
        ): Promise<Review> {
                try {
                        const result = await db
                                .update(reviews)
                                .set(review)
                                .where(eq(reviews.id, id))
                                .returning();
                        return result[0];
                } catch (error) {
                        console.error("Erro ao atualizar avaliação:", error);
                        throw new Error("Falha ao atualizar avaliação");
                }
        }

        async deleteReview(id: number): Promise<void> {
                try {
                        await db.delete(reviews).where(eq(reviews.id, id));
                } catch (error) {
                        console.error("Erro ao deletar avaliação:", error);
                        throw new Error("Falha ao deletar avaliação");
                }
        }
}

export class DatabaseStorage implements IStorage {
        sessionStore: session.Store;

        constructor() {
                // Use a simple memory store for sessions to avoid ESM issues
                this.sessionStore = new session.MemoryStore();
                console.log("PostgreSQL Session Store inicializado");
        }

        // Core niche/category/service CRUD methods for admin workflow
        async getNiches(): Promise<Niche[]> {
                const result = await db
                        .select()
                        .from(niches)
                        .orderBy(niches.name);
                return result || [];
        }

        async createNiche(niche: InsertNiche): Promise<Niche> {
                const result = await db
                        .insert(niches)
                        .values(niche)
                        .returning();
                return result[0];
        }

        async updateNiche(
                id: number,
                niche: Partial<InsertNiche>,
        ): Promise<Niche> {
                const result = await db
                        .update(niches)
                        .set(niche)
                        .where(eq(niches.id, id))
                        .returning();
                return result[0];
        }

        async deleteNiche(id: number): Promise<void> {
                await db.delete(niches).where(eq(niches.id, id));
        }

        async getNicheById(id: number): Promise<Niche | undefined> {
                const result = await db
                        .select()
                        .from(niches)
                        .where(eq(niches.id, id));
                return result[0];
        }

        async getCategoriesByNicheId(nicheId: number): Promise<Category[]> {
                const result = await db
                        .select()
                        .from(categories)
                        .where(eq(categories.nicheId, nicheId))
                        .orderBy(categories.name);
                return result || [];
        }

        async getCategoryById(id: number): Promise<Category | undefined> {
                const result = await db
                        .select()
                        .from(categories)
                        .where(eq(categories.id, id));
                return result[0];
        }

        async createCategory(category: InsertCategory): Promise<Category> {
                const result = await db
                        .insert(categories)
                        .values(category)
                        .returning();
                return result[0];
        }

        async updateCategory(
                id: number,
                category: Partial<InsertCategory>,
        ): Promise<Category> {
                const result = await db
                        .update(categories)
                        .set(category)
                        .where(eq(categories.id, id))
                        .returning();
                return result[0];
        }

        async deleteCategory(id: number): Promise<void> {
                await db.delete(categories).where(eq(categories.id, id));
        }

        async getServices(): Promise<Service[]> {
                const result = await db
                        .select()
                        .from(services)
                        .orderBy(services.name);
                return result || [];
        }

        async getServiceById(id: number): Promise<Service | undefined> {
                const result = await db
                        .select()
                        .from(services)
                        .where(eq(services.id, id));
                return result[0];
        }

        async getServicesByCategoryId(categoryId: number): Promise<Service[]> {
                const result = await db
                        .select()
                        .from(services)
                        .where(eq(services.categoryId, categoryId))
                        .orderBy(services.name);
                return result || [];
        }

        async getServicesByCategory(categoryId: number): Promise<Service[]> {
                return this.getServicesByCategoryId(categoryId);
        }

        async createService(service: InsertService): Promise<Service> {
                const result = await db
                        .insert(services)
                        .values(service)
                        .returning();
                return result[0];
        }

        async updateService(
                id: number,
                service: Partial<InsertService>,
        ): Promise<Service> {
                const result = await db
                        .update(services)
                        .set(service)
                        .where(eq(services.id, id))
                        .returning();
                return result[0];
        }

        async deleteService(id: number): Promise<void> {
                await db.delete(services).where(eq(services.id, id));
        }

        // Provider Settings methods
        async getProviderSettings(providerId: number): Promise<any> {
                const result = await db
                        .select()
                        .from(providerSettings)
                        .where(eq(providerSettings.providerId, providerId));
                return result[0] || null;
        }

        async createProviderSettings(settings: any): Promise<any> {
                const result = await db
                        .insert(providerSettings)
                        .values({
                                providerId: settings.providerId,
                                isActive: settings.isActive ?? true,
                                description: settings.description || null,
                                fixedFee: settings.fixedFee || 0,
                        })
                        .returning();
                return result[0];
        }

        async updateProviderSettings(
                providerId: number,
                settings: any,
        ): Promise<any> {
                const result = await db
                        .update(providerSettings)
                        .set({
                                isActive: settings.isActive,
                                description: settings.description,
                                fixedFee: settings.fixedFee,
                        })
                        .where(eq(providerSettings.providerId, providerId))
                        .returning();
                return result[0] || null;
        }

        // Core workflow methods - Admin creates services, Providers customize, Clients search
        async getNichesWithCategoriesAndServices(): Promise<any[]> {
                const result = await db.execute(sql`
                        SELECT 
                                n.id as niche_id, n.name as niche_name, n.description as niche_description,
                                c.id as category_id, c.name as category_name, c.description as category_description,
                                s.id as service_id, s.name as service_name, s.description as service_description
                        FROM niches n
                        LEFT JOIN categories c ON n.id = c.niche_id
                        LEFT JOIN services s ON c.id = s.category_id
                        ORDER BY n.name, c.name, s.name
                `);
                return result.rows || [];
        }

        async getNicheByName(name: string): Promise<Niche | undefined> {
                const result = await db
                        .select()
                        .from(niches)
                        .where(eq(niches.name, name));
                return result[0];
        }

        async getServiceTemplates(): Promise<ServiceTemplate[]> {
                const result = await db.select().from(serviceTemplates);
                return result || [];
        }

        async getServiceTemplate(
                id: number,
        ): Promise<ServiceTemplate | undefined> {
                const result = await db
                        .select()
                        .from(serviceTemplates)
                        .where(eq(serviceTemplates.id, id));
                return result[0];
        }

        async getCategories(): Promise<Category[]> {
                const result = await db.select().from(categories);
                return result || [];
        }

        async getCategory(id: number): Promise<Category | undefined> {
                const result = await db
                        .select()
                        .from(categories)
                        .where(eq(categories.id, id));
                return result[0];
        }

        async getNiche(id: number): Promise<Niche | undefined> {
                const result = await db
                        .select()
                        .from(niches)
                        .where(eq(niches.id, id));
                return result[0];
        }

        async getUser(id: number): Promise<User | undefined> {
                const result = await db
                        .select()
                        .from(users)
                        .where(eq(users.id, id));
                return result[0];
        }

        async updateUser(
                id: number,
                userData: Partial<InsertUser>,
        ): Promise<User> {
                const result = await db
                        .update(users)
                        .set(userData)
                        .where(eq(users.id, id))
                        .returning();
                return result[0];
        }

        async getUsersByType(userType: string): Promise<User[]> {
                const result = await db
                        .select()
                        .from(users)
                        .where(eq(users.userType, userType));
                return result || [];
        }

        async createUser(userData: InsertUser): Promise<User> {
                const result = await db
                        .insert(users)
                        .values(userData)
                        .returning();
                return result[0];
        }

        async getUserByEmail(email: string): Promise<User | undefined> {
                const result = await db
                        .select()
                        .from(users)
                        .where(eq(users.email, email));
                return result[0];
        }

        // Provider Services workflow methods
        async getProviderServicesByProvider(
                providerId: number,
        ): Promise<ProviderService[]> {
                const result = await db
                        .select()
                        .from(providerServices)
                        .where(eq(providerServices.providerId, providerId));
                return result || [];
        }

        async getProviderServicesByProviderId(
                providerId: number,
        ): Promise<ProviderService[]> {
                const result = await db
                        .select()
                        .from(providerServices)
                        .where(eq(providerServices.providerId, providerId));
                return result || [];
        }

        async getAvailabilityByDate(
                providerId: number,
                date: string,
        ): Promise<Availability | undefined> {
                const result = await db
                        .select()
                        .from(availability)
                        .where(
                                and(
                                        eq(availability.providerId, providerId),
                                        eq(availability.date, date),
                                ),
                        );
                return result[0];
        }

        async getAvailabilityByDay(
                providerId: number,
                dayOfWeek: number,
        ): Promise<Availability | undefined> {
                const result = await db
                        .select()
                        .from(availability)
                        .where(
                                and(
                                        eq(availability.providerId, providerId),
                                        eq(availability.dayOfWeek, dayOfWeek),
                                        isNull(availability.date)
                                )
                        );
                return result[0];
        }

        async getServicesByProvider(providerId: number): Promise<Service[]> {
                const result = await db
                        .select()
                        .from(services)
                        .where(eq(services.providerId, providerId));
                return result || [];
        }

        async getProviderService(
                id: number,
        ): Promise<ProviderService | undefined> {
                const result = await db
                        .select()
                        .from(providerServices)
                        .where(eq(providerServices.id, id));
                return result[0];
        }

        async updateProviderService(
                id: number,
                providerServiceData: Partial<InsertProviderService>,
        ): Promise<ProviderService> {
                const result = await db
                        .update(providerServices)
                        .set(providerServiceData)
                        .where(eq(providerServices.id, id))
                        .returning();
                return result[0];
        }

        async deleteProviderService(id: number): Promise<void> {
                await db
                        .delete(providerServices)
                        .where(eq(providerServices.id, id));
        }

        async createProviderService(data: any) {
                console.log("Inserindo na tabela provider_services:", data);

                const result = await db
                        .insert(providerServices)
                        .values({
                                providerId: data.providerId,
                                serviceId: data.serviceId,
                                price: data.price,
                                duration: data.duration,
                                executionTime: data.executionTime,
                                breakTime: data.breakTime || 0,
                                description: data.description,
                                isActive: data.isActive !== false,
                        })
                        .returning();

                console.log(
                        "Resultado da inserção na provider_services:",
                        result[0],
                );
                return result[0];
        }

        // Missing implementation placeholder
        async updateProviderServicePlaceholder(
                providerId: number,
                settings: any,
        ): Promise<any> {
                const result = await db
                        .update(providerSettings)
                        .set({
                                isActive: settings.isActive,
                                description: settings.description,
                                fixedFee: settings.fixedFee,
                        })
                        .where(eq(providerSettings.providerId, providerId))
                        .returning();
                return result[0] || null;
        }

        // Implement all the remaining methods from IStorage interface
        // Add implementations as needed

        async getUsers(): Promise<User[]> {
                return await db.select().from(users);
        }

        async getAppointmentsByProviderId(
                providerId: number,
        ): Promise<Appointment[]> {
                const result = await db
                        .select()
                        .from(appointments)
                        .where(eq(appointments.providerId, providerId))
                        .orderBy(desc(appointments.date));
                return result || [];
        }

        async getAppointmentsByClientId(
                clientId: number,
        ): Promise<Appointment[]> {
                const result = await db
                        .select()
                        .from(appointments)
                        .where(eq(appointments.clientId, clientId))
                        .orderBy(desc(appointments.date));
                return result || [];
        }

        async getClientAppointments(clientId: number): Promise<any[]> {
                const result = await db
                        .select()
                        .from(appointments)
                        .where(eq(appointments.clientId, clientId))
                        .orderBy(desc(appointments.date))
                        .limit(50); // Limit for performance
                return result || [];
        }

        async getAppointments(): Promise<Appointment[]> {
                const result = await db
                        .select()
                        .from(appointments)
                        .orderBy(desc(appointments.date));
                return result || [];
        }

        async getAppointmentById(id: number): Promise<Appointment | undefined> {
                const result = await db
                        .select()
                        .from(appointments)
                        .where(eq(appointments.id, id));
                return result[0];
        }

        async createAppointment(
                appointment: InsertAppointment,
        ): Promise<Appointment> {
                const result = await db
                        .insert(appointments)
                        .values(appointment)
                        .returning();
                return result[0];
        }

        async updateAppointment(
                id: number,
                appointment: Partial<InsertAppointment>,
        ): Promise<Appointment> {
                const result = await db
                        .update(appointments)
                        .set(appointment)
                        .where(eq(appointments.id, id))
                        .returning();
                return result[0];
        }

        async deleteAppointment(id: number): Promise<void> {
                await db.delete(appointments).where(eq(appointments.id, id));
        }

        async getUsersCount(userType?: string): Promise<number> {
                if (userType) {
                        const result = await db
                                .select({ count: sql<number>`count(*)` })
                                .from(users)
                                .where(eq(users.userType, userType));
                        return result[0]?.count || 0;
                }
                const result = await db
                        .select({ count: sql<number>`count(*)` })
                        .from(users);
                return result[0]?.count || 0;
        }

        async getServicesCount(): Promise<number> {
                const result = await db
                        .select({ count: sql<number>`count(*)` })
                        .from(services);
                return result[0]?.count || 0;
        }

        async getCategoriesCount(): Promise<number> {
                const result = await db
                        .select({ count: sql<number>`count(*)` })
                        .from(categories);
                return result[0]?.count || 0;
        }

        async getAppointmentsCount(status?: string): Promise<number> {
                if (status) {
                        const result = await db
                                .select({ count: sql<number>`count(*)` })
                                .from(appointments)
                                .where(eq(appointments.status, status));
                const result = await db
                        .select({ count: sql<number>`count(*)` })
                        .from(appointments);
                return result[0]?.count || 0;
        }

        async getUserById(id: number): Promise<User | undefined> {
                const results = await db                                .select()
                                .from(users)
                                .where(eq(users.id, id));
                return results[0];
        }

        // Additional methods for DatabaseStorage class
        async getAvailableTimeSlots(
                providerId: number,
                date: string,
                serviceDuration: number,
        ): Promise<any[]> {
                try {
                        // Implementation for time slot generation
                        return [];
                } catch (error) {
                        console.error("Error generating time slots:", error);
                        return [];
                }
        }

        async getService(serviceId: number): Promise<Service | undefined> {
                const results = await db
                        .select()
                        .from(services)
                        .where(eq(services.id, serviceId));
                return results[0];
        }

        async getProviderServiceByProviderAndService(
                providerId: number,
                serviceId: number,
        ): Promise<ProviderService | undefined> {
                const results = await db
                        .select()
                        .from(providerServices)
                        .where(
                                and(
                                        eq(
                                                providerServices.providerId,
                                                                                                providerId,
                                        ),
                                        eq(
                                                providerServices.serviceId,
                                                serviceId,
                                        ),
                                ),
                        );
                return results[0];
        }

        async getProviderServiceByService(
                providerId: number,
                serviceId: number,
        ): Promise<ProviderService | undefined> {
                return this.getProviderServiceByProviderAndService(
                        providerId,
                        serviceId,
                );
        }

        async getServicesByIds(serviceIds: number[]): Promise<Service[]> {
                if (serviceIds.length === 0) return [];
                const result = await db
                        .select()
                        .from(services)
                        .where(
                                sql`${services.id} IN (${sql.join(serviceIds.map(id => sql`${id}`), sql`, `)})`
                        );
                return result || [];
        }

        async getCategoriesByIds(categoryIds: number[]): Promise<Category[]> {
                if (categoryIds.length === 0) return [];
                const result = await db
                        .select()
                        .from(categories)
                        .where(
                                sql`${categories.id} IN (${sql.join(categoryIds.map(id => sql`${id}`), sql`, `)})`
                        );
                return result || [];
        }

        async getNichesByIds(nicheIds: number[]): Promise<Niche[]> {
                if (nicheIds.length === 0) return [];
                const result = await db
                        .select()
                        .from(niches)
                        .where(
                                sql`${niches.id} IN (${sql.join(nicheIds.map(id => sql`${id}`), sql`, `)})`
                        );
                return result || [];
        }

        // Métodos auxiliares para compatibilidade
        async getAvailabilityByDateArray(
                providerId: number,
                date: string
        ): Promise<Availability[]> {
                try {
                        const result = await db
                                .select()
                                .from(availability)
                                .where(
                                        and(
                                                eq(availability.providerId, providerId),
                                                eq(availability.date, date)
                                        )
                                );

                        return result || [];
                } catch (error) {
                        console.error("Erro ao buscar disponibilidade por data:", error);
                        return [];
                }
        }

        async getAvailabilityByDayArray(
                providerId: number,
                dayOfWeek: number
        ): Promise<Availability[]> {
                try {
                        const result = await db
                                .select()
                                .from(availability)
                                .where(
                                        and(
                                                eq(availability.providerId, providerId),
                                                eq(availability.dayOfWeek, dayOfWeek),
                                                isNull(availability.date)
                                        )
                                );

                        return result || [];
                } catch (error) {
                        console.error("Erro ao buscar disponibilidade por dia da semana:", error);
                        return [];
                }
        }

  // Add provider service methods
  async addProviderService(data: {
    providerId: number;
    serviceId: number;
    duration?: number;
    price?: number;
    isActive?: boolean;
  }) {
    const [result] = await db.insert(providerServices).values({
      providerId: data.providerId,
      serviceId: data.serviceId,
      duration: data.duration,
      price: data.price,
      isActive: data.isActive ?? true,
    }).returning();
    return result;
  }

  // Generate time slots for a provider on a specific date
  async generateTimeSlots(providerId: number, date: string, serviceId?: number): Promise<any[]> {
    try {
      // Convert date string to Date object and get day of week
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();

      // Get availability for this day
      const availability = await this.getAvailabilityByDay(providerId, dayOfWeek);
      if (!availability) {
        console.log(`No availability found for provider ${providerId} on day ${dayOfWeek}`);
        return [];
      }

      // Get service duration
      let serviceDuration = 60; // default
      if (serviceId) {
        const service = await this.getService(serviceId);
        if (service) {
          serviceDuration = service.duration || 60;
        }
      }

      // Get existing appointments for this date
      const appointments = await this.getProviderAppointmentsByDate(providerId, date);

      // Get blocked time slots for this date
      const blockedSlots = await this.getBlockedTimeSlotsByDate(providerId, date);

      // Generate time slots using the time slot generator
      const { generateAvailableTimeSlots } = await import('./time-slot-generator');

      const workingHours = {
        start: availability.startTime,
        end: availability.endTime
      };

      const lunchBreak = {
        start: "12:00",
        end: "13:00"
      };

      const scheduledAppointments = appointments.map((apt: any) => ({
        startTime: apt.startTime,
        duration: apt.duration || serviceDuration
      }));

      const availableSlots = generateAvailableTimeSlots(
        workingHours,
        lunchBreak,
        scheduledAppointments,
        serviceDuration,
        15 // 15-minute intervals
      );

      // Convert to expected format
      return availableSlots.map((slot: any) => ({
        startTime: slot.start,
        endTime: slot.end,
        isAvailable: true,
        availabilityId: availability.id
      }));

    } catch (error) {
      console.error(`Error generating time slots for provider ${providerId}:`, error);
      return [];
    }
  }

  // Save availability for a provider
  async saveAvailability(availabilityData: {
    providerId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    intervalMinutes?: number;
  }): Promise<any> {
    try {
      // Check if availability exists for this day
      const existing = await this.getAvailabilityByDay(availabilityData.providerId, availabilityData.dayOfWeek);

      if (existing) {
        // Update existing
        const result = await db
          .update(availability)
          .set({
            startTime: availabilityData.startTime,
            endTime: availabilityData.endTime,
            isAvailable: availabilityData.isAvailable,
            intervalMinutes: availabilityData.intervalMinutes || 15,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(availability.providerId, availabilityData.providerId),
              eq(availability.dayOfWeek, availabilityData.dayOfWeek)
            )
          )
          .returning();

        return result[0];
      } else {
        // Create new
        const result = await db
          .insert(availability)
          .values({
            providerId: availabilityData.providerId,
            dayOfWeek: availabilityData.dayOfWeek,
            startTime: availabilityData.startTime,
            endTime: availabilityData.endTime,
            isAvailable: availabilityData.isAvailable,
            intervalMinutes: availabilityData.intervalMinutes || 15,
            date: null
          })
          .returning();

        return result[0];
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      throw error;
    }
  }

  // Get blocked time slots from date onwards
  async getBlockedTimeSlotsFromDate(providerId: number, fromDate: string): Promise<any[]> {
    try {
      // Check if blocked_time_slots table exists, if not return empty array
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'blocked_time_slots'
        )
      `);

      if (!result.rows[0]?.exists) {
        console.log('blocked_time_slots table does not exist, returning empty array');
        return [];
      }

      // If table exists, query it
      const blockedSlots = await db.execute(sql`
        SELECT * FROM blocked_time_slots 
        WHERE provider_id = ${providerId} 
        AND date >= ${fromDate}
        ORDER BY date, start_time
      `);

      return blockedSlots.rows || [];
    } catch (error) {
      console.error('Error getting blocked time slots from date:', error);
      return [];
    }
  }

  // Get blocked time slots by date
  async getBlockedTimeSlotsByDate(providerId: number, date: string): Promise<any[]> {
    try {
      // Check if blocked_time_slots table exists, if not return empty array
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'blocked_time_slots'
        )
      `);

      if (!result.rows[0]?.exists) {
        console.log('blocked_time_slots table does not exist, returning empty array');
        return [];
      }

      // If table exists, query it
      const blockedSlots = await db.execute(sql`
        SELECT * FROM blocked_time_slots 
        WHERE provider_id = ${providerId} 
        AND date = ${date}
      `);

      return blockedSlots.rows.map((row: any) => ({
        id: row.id,
        providerId: row.provider_id,
        availabilityId: row.availability_id,
        date: row.date,
        startTime: row.start_time,
        endTime: row.end_time,
        reason: row.reason,
        blockedByUserId: row.blocked_by_user_id,
        metadata: row.metadata,
        createdAt: row.created_at
      }));

    } catch (error) {
      console.error(`Error getting blocked time slots for provider ${providerId} on ${date}:`, error);
      return [];
    }
  }
        async getProviderAppointmentsByDate(providerId: number, date: string): Promise<any[]> {
                try {
                        const result = await db
                                .select()
                                .from(appointments)
                                .where(
                                        and(
                                                eq(appointments.providerId, providerId),
                                                eq(appointments.date, date)
                                        )
                                );

                        return result || [];
                } catch (error) {
                        console.error("Error getting appointments by date:", error);
                        return [];
                }
        }

        async getAvailabilitiesByProviderId(
                providerId: number,
        ): Promise<Availability[]> {
                const result = await db
                        .select()
                        .from(availability)
                        .where(eq(availability.providerId, providerId))
                        .orderBy(availability.dayOfWeek);
                return result || [];
        }

        // Financial settings methods
        async getFinancialSettings(): Promise<any> {
                // Implementação temporária - substituir com tabela real quando disponível
                return {
                        id: 1,
                        serviceFee: 500, // 5%
                        fixedServiceFee: 200, // R$ 2,00
                        minServiceFee: 100, // R$ 1,00
                        maxServiceFee: 5000, // R$ 50,00
                        payoutSchedule: "weekly",

                        stripeEnabled: false,
                        stripeLiveMode: false,
                        stripePublicKey: "",
                        stripeSecretKey: "",
                        stripeWebhookSecret: "",
                        stripeConnectEnabled: false,

                        asaasEnabled: false,
                        asaasLiveMode: false,
                        asaasApiKey: "",
                        asaasWebhookToken: "",
                        asaasWalletId: "",
                        asaasSplitEnabled: false,

                        enableCoupons: true,
                        maxDiscountPercentage: 30,
                        defaultExpirationDays: 30,
                };
        }

        async saveFinancialSettings(settings: any): Promise<any> {
                // Implementação temporária - substituir com tabela real quando disponível
                return settings;
        }

        // Payment settings methods
        async getPaymentSettings(): Promise<any> {
                // Implementação temporária - substituir com tabela real quando disponível
                return {
                        id: 1,
                        serviceFee: 175, // R$ 1,75 em centavos
                        serviceFeePercentage: 175, // R$ 1,75 em centavos
                        minServiceFee: 100, // R$ 1,00 em centavos
                        maxServiceFee: 5000, // R$ 50,00 em centavos
                        payoutSchedule: "weekly",

                        stripeEnabled: false,
                        stripeLiveMode: false,
                        stripePublicKey: "",
                        stripeSecretKey: "",
                        stripeWebhookSecret: "",
                        stripeConnectEnabled: false,

                        asaasEnabled: false,
                        asaasLiveMode: false,
                        asaasApiKey: "",
                        asaasWebhookToken: "",
                        asaasWalletId: "",
                        asaasSplitEnabled: false,
                };
        }
  async blockTimeSlot(providerId: number, date: string, startTime: string, endTime: string): Promise<boolean> {
                console.log('blockTimeSlot in DatabaseStorage is not implemented');
                return false;
        }
}

// Create a storage instance
export const storage = new DatabaseStorage();

async getPaymentSettings() {
    try {
      // Return default payment settings if not implemented
      return {
        stripeEnabled: false,
        asaasEnabled: false,
        platformFeePercentage: 3.5,
        defaultPaymentMethods: ['money', 'pix', 'credit_card']
      };
    } catch (error) {
      console.error('Erro ao buscar configurações de pagamento:', error);
      return {
        stripeEnabled: false,
        asaasEnabled: false,
        platformFeePercentage: 3.5,
        defaultPaymentMethods: ['money']
      };
    }
  }

  async blockTimeSlot(providerId: number, date: string, startTime: string, endTime: string) {
    try {
      // This could be implemented to block specific time slots
      console.log(`Bloqueando slot ${startTime}-${endTime} para prestador ${providerId} em ${date}`);
      return true;
    } catch (error) {
      console.error('Erro ao bloquear slot:', error);
      return false;
    }
  }
};

export { storage };