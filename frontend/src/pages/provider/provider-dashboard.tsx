import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { memo, useCallback, useState, useEffect, Suspense } from "react";
import { 
  Calendar, 
  Scissors, 
  CalendarPlus,
  ArrowUp,
  Clock,
  BellIcon,
  Info,
  ClipboardList,
  BarChart,
  Copy,
  PenSquare,
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Activity
} from "lucide-react";
import { AppointmentItem } from "@/components/appointment-item";
import { NotificationsMenu } from "@/components/ui/notifications-menu";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import ProviderNavbar from "@/components/layout/provider-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, formatDateToBR } from "@/lib/utils";
import { Appointment } from "@/types";
import AppHeader from "@/components/layout/app-header";
import { PageTransition } from "@/components/ui/page-transition";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyCalendar, { WeeklyCalendarAppointment } from "@/components/dashboard/weekly-calendar";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Componente de cabeçalho melhorado
const ProviderHeader = memo(({ 
  user
}: { 
  user: any
}) => (
  <motion.div 
    className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-xl mb-6"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16 border-4 border-white/20">
          <AvatarImage src={user?.profileImage || ""} />
          <AvatarFallback className="bg-white/10 text-white text-lg font-bold">
            {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "PR"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Olá, {user?.name?.split(' ')[0] || "Prestador"}!</h1>
          <p className="text-white/80">Bem-vindo ao seu painel de controle</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm text-white/80">AgendoAI Pro</p>
          <p className="text-lg font-bold">Dashboard</p>
        </div>
      </div>
    </div>
  </motion.div>
));

// Card de estatística melhorado
const StatCard = memo(({ 
  icon,
  bgClass, 
  textColorClass, 
  label, 
  value, 
  trend, 
  trendText,
  delay = 0 
}: { 
  icon: React.ReactNode,
  bgClass: string, 
  textColorClass: string, 
  label: string, 
  value: React.ReactNode, 
  trend?: boolean, 
  trendText?: string,
  delay?: number 
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
  >
    <Card className={`${bgClass} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg bg-white/10`}>
            {icon}
          </div>
          {trend !== undefined && trendText && (
            <div className={`flex items-center ${textColorClass}/80 text-xs`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>{trendText}</span>
            </div>
          )}
        </div>
        <p className={`${textColorClass}/80 text-sm mb-1`}>{label}</p>
        <p className={`${textColorClass} text-2xl font-bold`}>{value}</p>
      </CardContent>
    </Card>
  </motion.div>
));

// Componente de status do prestador
const ProviderStatusCard = memo(({ 
  isOnline, 
  onToggleOnline, 
  isToggleDisabled 
}: { 
  isOnline: boolean, 
  onToggleOnline: (checked: boolean) => void, 
  isToggleDisabled: boolean 
}) => (
  <motion.div 
    className="mb-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
  >
    <Card className="shadow-lg border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Activity className={`h-6 w-6 ${isOnline ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Status de Disponibilidade</h3>
              <p className="text-sm text-gray-600">
                {isOnline ? "Você está disponível para receber agendamentos" : "Você está indisponível para novos agendamentos"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Alterar status</p>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm font-medium">{isOnline ? "Online" : "Offline"}</span>
                <Switch 
                  checked={isOnline} 
                  onCheckedChange={onToggleOnline}
                  disabled={isToggleDisabled}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
            <Badge 
              variant={isOnline ? "default" : "secondary"} 
              className={`px-3 py-1 ${isOnline ? "bg-green-500 hover:bg-green-600" : "bg-gray-100 text-gray-600"}`}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-white' : 'bg-gray-400'}`} />
              {isOnline ? "Disponível" : "Indisponível"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
));

// Componente de estatísticas melhorado
const StatsGrid = memo(({ stats }: { stats: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatCard 
      icon={<Calendar className="h-5 w-5 text-white" />}
      bgClass="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
      textColorClass="text-white"
      label="Agendamentos Hoje"
      value={stats.todayAppointments}
      trend={true}
      trendText="+25%"
      delay={0.1}
    />

    <StatCard 
      icon={<DollarSign className="h-5 w-5 text-white" />}
      bgClass="bg-gradient-to-br from-green-500 to-green-600 text-white"
      textColorClass="text-white"
      label="Receita Mensal"
      value={formatCurrency(stats.monthlyRevenue)}
      trend={true}
      trendText="+12%"
      delay={0.2}
    />

    <StatCard 
      icon={<Users className="h-5 w-5 text-primary" />}
      bgClass="bg-gradient-to-br from-purple-50 to-purple-100"
      textColorClass="text-purple-700"
      label="Clientes Ativos"
      value="48"
      trend={true}
      trendText="+8%"
      delay={0.3}
    />

    <StatCard 
      icon={<Star className="h-5 w-5 text-yellow-600" />}
      bgClass="bg-gradient-to-br from-yellow-50 to-yellow-100"
      textColorClass="text-yellow-700"
      label="Avaliação Média"
      value="4.8"
      trend={true}
      trendText="+0.2"
      delay={0.4}
    />
  </div>
));

// Componente de esqueleto para estatísticas
const StatsGridSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[...Array(4)].map((_, index) => (
      <Card key={index} className="bg-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    ))}
  </div>
));

// Componente de ações rápidas melhorado
const QuickActions = memo(({ 
  onManualBooking, 
  onScheduleConfig,
  onTemplatesClick,
  onAnalyticsClick,
  onServicesClick
}: { 
  onManualBooking: () => void, 
  onScheduleConfig: () => void,
  onTemplatesClick: () => void,
  onAnalyticsClick: () => void,
  onServicesClick: () => void
}) => (
  <motion.div 
    className="mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.5 }}
  >
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-primary" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
            onClick={onServicesClick}
          >
            <PenSquare className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Meus Serviços</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
            onClick={onManualBooking}
          >
            <CalendarPlus className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Novo Agendamento</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
            onClick={onScheduleConfig}
          >
            <Clock className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Configurar Agenda</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
            onClick={onAnalyticsClick}
          >
            <BarChart className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Relatórios</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
            onClick={onTemplatesClick}
          >
            <Copy className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Templates</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
));

// Componente de serviços do prestador melhorado
const ProviderServices = memo(({ 
  services = [], 
  isLoading, 
  onAddService,
  onViewServices
}: { 
  services: any[], 
  isLoading: boolean,
  onAddService: () => void,
  onViewServices: () => void
}) => (
  <motion.div 
    className="mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.6 }}
  >
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center">
            <Scissors className="h-5 w-5 mr-2 text-primary" />
            Meus Serviços
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewServices}
            className="text-primary hover:bg-primary/10"
          >
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.slice(0, 6).map((service) => (
              <Card key={service.id} className="border-2 hover:border-primary/50 cursor-pointer transition-all duration-300 hover:shadow-md">
                <CardContent className="p-4" onClick={() => onViewServices()}>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {service.categoryName || "Categoria"}
                    </Badge>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {service.defaultPrice ? formatCurrency(service.defaultPrice) : "R$ 0,00"}
                      </p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{service.serviceName}</h3>
                  <p className="text-xs text-gray-500">
                    {service.duration || 60} min
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <PenSquare className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Nenhum serviço cadastrado</h3>
                  <p className="text-gray-500 mb-4">Comece adicionando seus primeiros serviços</p>
                  <Button onClick={onAddService} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Serviço
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  </motion.div>
));

// Componente de lista de agendamentos melhorado
const AppointmentsList = memo(({ 
  appointments, 
  isLoading,
  title = "Próximos agendamentos"
}: { 
  appointments: Appointment[], 
  isLoading: boolean,
  title?: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.7 }}
  >
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="w-10 h-10 rounded-full mr-3" />
                    <div className="w-full">
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <AppointmentItem 
                key={appointment.id} 
                appointment={appointment} 
                userType="provider"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Nenhum agendamento</h3>
                <p className="text-gray-500">
                  Você não possui agendamentos {title.toLowerCase().includes("hoje") ? "para hoje" : "próximos"}.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
));

// Componente principal
export default function ProviderDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Fetch provider settings
  const { 
    data: providerSettings, 
    isLoading: isSettingsLoading 
  } = useQuery({
    queryKey: ["/api/provider-settings"],
    refetchOnMount: true,
    staleTime: 30 * 1000,
    retry: 1,
  });

  // Fetch today's appointments
  const { 
    data: appointments = [], 
    isLoading: areAppointmentsLoading 
  } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    staleTime: 60 * 1000,
    retry: 1,
  });

  // Fetch provider services
  const { 
    data: services = [], 
    isLoading: areServicesLoading 
  } = useQuery({
    queryKey: [`/api/provider-services/provider/${user?.id}`],
    staleTime: 300 * 1000,
    retry: 1,
    enabled: !!user?.id,
  });

  // Online/Offline status
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    if (providerSettings && !isSettingsLoading) {
      setIsOnline(providerSettings.isOnline ?? false);
    }
  }, [providerSettings, isSettingsLoading]);

  // Update online status mutation
  const updateOnlineStatusMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      const res = await apiRequest("PUT", "/api/provider-settings", { isOnline });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provider-settings"] });
    }
  });

  // Callbacks
  const handleOnlineToggle = useCallback((checked: boolean) => {
    setIsOnline(checked);
    updateOnlineStatusMutation.mutate(checked);
  }, [updateOnlineStatusMutation]);

  const navigateToManualBooking = useCallback(() => {
    setLocation("/provider/manual-booking");
  }, [setLocation]);

  const navigateToScheduleConfig = useCallback(() => {
    setLocation("/provider/schedule");
  }, [setLocation]);

  const navigateToTemplates = useCallback(() => {
    setLocation("/provider/service-templates");
  }, [setLocation]);

  const navigateToAnalytics = useCallback(() => {
    setLocation("/provider/analytics");
  }, [setLocation]);

  const navigateToServices = useCallback(() => {
    setLocation("/provider/services");
  }, [setLocation]);

  // Estatísticas
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === today);

  const stats = {
    todayAppointments: todayAppointments.length,
    monthlyRevenue: 245000, // Em centavos
    manualAppointments: 3,
    manualRevenue: 85000
  };

  const upcomingAppointments = appointments
    .filter(a => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      return a.date >= today;
    })
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, 5);

  // Função para converter agendamentos para o formato do calendário semanal
  const convertToCalendarEvents = useCallback((appointments: Appointment[]): WeeklyCalendarAppointment[] => {
    if (!appointments || !Array.isArray(appointments)) return [];

    return appointments.map(appointment => {
      // Determinar a cor com base no status
      let backgroundColor = '#3b82f6'; // Azul (confirmado)
      let borderColor = '#2563eb';
      let textColor = '#ffffff';

      if (appointment.status === 'cancelado') {
        backgroundColor = '#ef4444'; // Vermelho
        borderColor = '#dc2626';
      } else if (appointment.status === 'pendente') {
        backgroundColor = '#f97316'; // Laranja
        borderColor = '#ea580c';
      } else if (appointment.status === 'concluido') {
        backgroundColor = '#22c55e'; // Verde
        borderColor = '#16a34a';
      } else if (appointment.status === 'no_show') {
        backgroundColor = '#6b7280'; // Cinza
        borderColor = '#4b5563';
      }

      // Formato: 2025-04-22T15:30:00
      const startDate = `${appointment.date}T${appointment.startTime}:00`;
      const endDate = `${appointment.date}T${appointment.endTime}:00`;

      // Calcular duração em minutos
      const calcDurationInMinutes = () => {
        try {
          if (appointment.startTime && appointment.endTime) {
            const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
            const [endHour, endMinute] = appointment.endTime.split(':').map(Number);

            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;

            // Lidar com casos em que o agendamento cruza a meia-noite
            return endTotalMinutes >= startTotalMinutes 
              ? endTotalMinutes - startTotalMinutes 
              : (24 * 60 - startTotalMinutes) + endTotalMinutes;
          }
          return appointment.serviceDuration || 0;
        } catch (error) {
          console.error("Erro ao calcular duração:", error);
          return 0;
        }
      };

      return {
        id: appointment.id.toString(),
        title: appointment.serviceName || appointment.title || 'Agendamento',
        start: startDate,
        end: endDate,
        backgroundColor,
        borderColor,
        textColor,
        extendedProps: {
          client: appointment.clientName || '',
          status: appointment.status,
          serviceName: appointment.serviceName,
          notes: appointment.notes,
          isManuallyCreated: appointment.isManuallyCreated || false,
          // Novos campos adicionados para suportar o WeeklyCalendar aprimorado
          clientPhone: appointment.clientPhone || appointment.client?.phone || '',
          clientEmail: appointment.clientEmail || appointment.client?.email || '',
          price: appointment.price || 0,
          duration: calcDurationInMinutes(),
          payment_status: appointment.payment_status
        }
      };
    });
  }, []);

  // Manipulador de clique em evento do calendário
  const handleCalendarEventClick = useCallback((info: any) => {
    const appointmentId = info.event.id;
    toast({
      title: info.event.title,
      description: `Cliente: ${info.event.extendedProps.client || 'Não informado'} - Status: ${info.event.extendedProps.status || 'Não informado'}`,
    });

    // Opcionalmente, navegar para a página de detalhes do agendamento
    // setLocation(`/provider/appointments/${appointmentId}`);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <ProviderNavbar />

      <PageTransition>
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <ProviderHeader user={user} />

          {/* Status Card */}
          <ProviderStatusCard 
            isOnline={isOnline}
            onToggleOnline={handleOnlineToggle}
            isToggleDisabled={updateOnlineStatusMutation.isPending}
          />

          {/* Stats Cards */}
          <Suspense fallback={<StatsGridSkeleton />}>
            {isSettingsLoading ? (
              <StatsGridSkeleton />
            ) : (
              <StatsGrid stats={stats} />
            )}
          </Suspense>

          {/* Quick Actions */}
          <QuickActions 
            onManualBooking={navigateToManualBooking}
            onScheduleConfig={navigateToScheduleConfig}
            onTemplatesClick={navigateToTemplates}
            onAnalyticsClick={navigateToAnalytics}
            onServicesClick={navigateToServices}
          />

          {/* Meus Serviços */}
          <ProviderServices 
            services={services}
            isLoading={areServicesLoading}
            onAddService={navigateToServices}
            onViewServices={navigateToServices}
          />

          {/* Agendamentos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AppointmentsList 
              appointments={todayAppointments}
              isLoading={areAppointmentsLoading}
              title="Agendamentos de hoje"
            />

            <AppointmentsList 
              appointments={upcomingAppointments.filter(a => a.date !== today)}
              isLoading={areAppointmentsLoading}
              title="Próximos agendamentos"
            />
          </div>
        </div>
      </PageTransition>
    </div>
  );
}