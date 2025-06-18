import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  format, addDays, parseISO, isValid, isBefore, startOfDay, 
  isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, 
  isEqual, addMonths, subMonths 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { queryClient, apiRequest } from '@/lib/queryClient';
import ProviderLayout from '@/components/layout/provider-layout';
import { PageTransition } from '@/components/ui/page-transition';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Edit, 
  Settings, 
  AlertCircle, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  X,
  Check,
  RefreshCw
} from 'lucide-react';

// Type definitions
interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  id?: number;
  status?: string;
}

interface DailySchedule {
  date: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  intervalMinutes: number;
  id?: number;
}

interface BlockedTime {
  id?: number;
  startTime: string;
  endTime: string;
  date: string;
  reason: string;
  providerId: number;
}

interface AvailabilityDay {
  id?: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  intervalMinutes: number;
  providerId: number;
}

interface ManualBookingData {
  date: string;
  startTime: string;
  endTime: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceId?: number;
  notes?: string;
  status: string;
}

// Main component
export default function ProviderSchedulePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const providerId = user?.id;

  // States for date selection and view management
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isBlockTimeDialogOpen, setIsBlockTimeDialogOpen] = useState(false);
  const [isEditWeeklyScheduleDialogOpen, setIsEditWeeklyScheduleDialogOpen] = useState(false);
  const [blockStartTime, setBlockStartTime] = useState("09:00");
  const [blockEndTime, setBlockEndTime] = useState("10:00");
  const [blockReason, setBlockReason] = useState("");

  // States for manual booking
  const [isManualBookingDialogOpen, setIsManualBookingDialogOpen] = useState(false);
  const [manualBookingDate, setManualBookingDate] = useState<Date>(new Date());
  const [manualStartTime, setManualStartTime] = useState("09:00");
  const [manualEndTime, setManualEndTime] = useState("10:00");
  const [manualClientName, setManualClientName] = useState("");
  const [manualClientPhone, setManualClientPhone] = useState("");
  const [manualClientEmail, setManualClientEmail] = useState("");
  const [manualServiceId, setManualServiceId] = useState<number | undefined>(undefined);
  const [manualNotes, setManualNotes] = useState("");

  // Default weekly schedule states
  const [weeklySchedule, setWeeklySchedule] = useState<AvailabilityDay[]>([
    { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isAvailable: false, intervalMinutes: 30, providerId: providerId || 0 },
    { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isAvailable: true, intervalMinutes: 30, providerId: providerId || 0 },
    { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isAvailable: true, intervalMinutes: 30, providerId: providerId || 0 },
    { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isAvailable: true, intervalMinutes: 30, providerId: providerId || 0 },
    { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isAvailable: true, intervalMinutes: 30, providerId: providerId || 0 },
    { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isAvailable: true, intervalMinutes: 30, providerId: providerId || 0 },
    { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", isAvailable: false, intervalMinutes: 30, providerId: providerId || 0 },
  ]);

  // Queries and mutations
  const { data: availabilityData, isLoading: isLoadingAvailability } = useQuery({
    queryKey: [`/api/availability/provider/${providerId}`],
    queryFn: async () => {
      if (!providerId) return null;
      const response = await apiRequest('GET', `/api/availability/provider/${providerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      return response.json();
    },
    enabled: !!providerId
  });

  const { data: blockedTimesData, isLoading: isLoadingBlockedTimes } = useQuery({
    queryKey: [`/api/blocked-times/provider/${providerId}`],
    queryFn: async () => {
      if (!providerId) return null;
      const response = await apiRequest('GET', `/api/blocked-times/provider/${providerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blocked times');
      }
      return response.json();
    },
    enabled: !!providerId
  });

  const { data: appointmentsData, isLoading: isLoadingAppointments } = useQuery({
    queryKey: [`/api/appointments/provider/${providerId}`],
    queryFn: async () => {
      if (!providerId) return null;
      const response = await apiRequest('GET', `/api/appointments`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      return response.json();
    },
    enabled: !!providerId
  });

  const { data: providerServicesData } = useQuery({
    queryKey: [`/api/provider-services/provider/${providerId}`],
    queryFn: async () => {
      if (!providerId) return null;
      const response = await apiRequest('GET', `/api/provider-services/provider/${providerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch provider services');
      }
      return response.json();
    },
    enabled: !!providerId
  });

  // Effect to set weekly schedule from API data
  useEffect(() => {
    if (availabilityData && Array.isArray(availabilityData)) {
      // Map API data to our weekly schedule format
      const newWeeklySchedule = [...weeklySchedule];

      availabilityData.forEach((item: AvailabilityDay) => {
        const dayIndex = newWeeklySchedule.findIndex(d => d.dayOfWeek === item.dayOfWeek);
        if (dayIndex !== -1) {
          newWeeklySchedule[dayIndex] = {
            ...item,
            providerId: providerId || 0
          };
        }
      });

      setWeeklySchedule(newWeeklySchedule);
    }
  }, [availabilityData, providerId]);

  // Mutations for managing schedule
  const blockTimeMutation = useMutation({
    mutationFn: async (blockData: BlockedTime) => {
      if (!providerId) throw new Error('Provider ID not found');

      const payload = {
        ...blockData,
        providerId
      };

      const response = await apiRequest('POST', '/api/blocked-times', payload);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to block time');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/blocked-times/provider/${providerId}`] });
      setIsBlockTimeDialogOpen(false);
      setBlockStartTime("09:00");
      setBlockEndTime("10:00");
      setBlockReason("");

      toast({
        title: "Horário bloqueado",
        description: "O horário foi bloqueado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao bloquear horário",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateWeeklyScheduleMutation = useMutation({
    mutationFn: async (scheduleData: AvailabilityDay[]) => {
      if (!providerId) throw new Error('Provider ID not found');

      const response = await apiRequest('POST', '/api/availability/weekly', scheduleData);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update weekly schedule');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/availability/provider/${providerId}`] });
      setIsEditWeeklyScheduleDialogOpen(false);

      toast({
        title: "Agenda semanal atualizada",
        description: "Sua disponibilidade semanal foi atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar agenda",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Manual booking mutation
  const createManualBookingMutation = useMutation({
    mutationFn: async (data: ManualBookingData) => {
      if (!providerId) throw new Error('Provider ID not found');

      const response = await apiRequest('POST', '/api/appointments/manual', {
        ...data,
        providerId
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create manual booking');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/provider/${providerId}`] });
      setIsManualBookingDialogOpen(false);
      setManualBookingDate(new Date());
      setManualStartTime("09:00");
      setManualEndTime("10:00");
      setManualClientName("");
      setManualClientPhone("");
      setManualClientEmail("");
      setManualServiceId(undefined);
      setManualNotes("");

      toast({
        title: "Agendamento criado",
        description: "O agendamento manual foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar agendamento",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Helper functions for date handling
  const formatDate = (date: Date | string): string => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, 'yyyy-MM-dd');
  };

  const getTimeSlots = useCallback((date: Date): TimeSlot[] => {
    const formattedDate = formatDate(date);
    const dayOfWeek = date.getDay();

    // Find the availability for this day of week
    const dayAvailability = weeklySchedule.find(d => d.dayOfWeek === dayOfWeek);

    if (!dayAvailability || !dayAvailability.isAvailable) {
      return [];
    }

    // Generate time slots based on day availability
    const slots: TimeSlot[] = [];
    let currentTime = dayAvailability.startTime;

    while (currentTime < dayAvailability.endTime) {
      const startTimeParts = currentTime.split(':');
      const startHour = parseInt(startTimeParts[0]);
      const startMinute = parseInt(startTimeParts[1]);

      let endHour = startHour;
      let endMinute = startMinute + dayAvailability.intervalMinutes;

      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
      }

      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      // Check if this slot is blocked
      let isBlocked = false;
      if (blockedTimesData && Array.isArray(blockedTimesData)) {
        isBlocked = blockedTimesData.some((block: BlockedTime) => {
          if (block.date !== formattedDate) return false;

          const blockStart = block.startTime;
          const blockEnd = block.endTime;

          return (
            (currentTime >= blockStart && currentTime < blockEnd) ||
            (endTime > blockStart && endTime <= blockEnd) ||
            (currentTime <= blockStart && endTime >= blockEnd)
          );
        });
      }

      // Check if this slot has an appointment
      let appointmentStatus = '';
      let appointmentDuration = 0;
      if (appointmentsData && Array.isArray(appointmentsData)) {
        const appointment = appointmentsData.find((appt: any) => {
          if (appt.date !== formattedDate) return false;

          const apptStart = appt.startTime;
          const apptEnd = appt.endTime;

          return (
            (currentTime >= apptStart && currentTime < apptEnd) ||
            (endTime > apptStart && endTime <= apptEnd) ||
            (currentTime <= apptStart && endTime >= apptEnd)
          );
        });

        if (appointment) {
          appointmentStatus = appointment.status;
          // Usar o tempo de execução personalizado se disponível
          appointmentDuration = appointment.executionTime || appointment.duration || dayAvailability.intervalMinutes;
        }
      }

      slots.push({
        startTime: currentTime,
        endTime,
        isAvailable: !isBlocked && !appointmentStatus,
        status: appointmentStatus
      });

      currentTime = endTime;
    }

    return slots;
  }, [weeklySchedule, blockedTimesData, appointmentsData]);

  const handleBlockTime = () => {
    if (!selectedDate) {
      toast({
        title: "Selecione uma data",
        description: "Por favor, selecione uma data para bloquear.",
        variant: "destructive",
      });
      return;
    }

    blockTimeMutation.mutate({
      startTime: blockStartTime,
      endTime: blockEndTime,
      date: formatDate(selectedDate),
      reason: blockReason,
      providerId: providerId || 0
    });
  };

  const handleUpdateWeeklySchedule = () => {
    updateWeeklyScheduleMutation.mutate(weeklySchedule);
  };

  const handleManualBooking = () => {
    if (!manualBookingDate) {
      toast({
        title: "Selecione uma data",
        description: "Por favor, selecione uma data para o agendamento.",
        variant: "destructive",
      });
      return;
    }

    createManualBookingMutation.mutate({
      date: formatDate(manualBookingDate),
      startTime: manualStartTime,
      endTime: manualEndTime,
      clientName: manualClientName,
      clientPhone: manualClientPhone,
      clientEmail: manualClientEmail,
      serviceId: manualServiceId,
      notes: manualNotes,
      status: 'confirmed'
    });
  };

  const openManualBookingDialog = () => {
    setManualBookingDate(new Date());
    setManualStartTime("09:00");
    setManualEndTime("10:00");
    setManualClientName("");
    setManualClientPhone("");
    setManualClientEmail("");
    setManualServiceId(undefined);
    setManualNotes("");
    setIsManualBookingDialogOpen(true);
  };

  // Calculate busy days for the calendar
  const busyDays = useMemo(() => {
    const days = new Set<string>();

    // Add days with appointments
    if (appointmentsData && Array.isArray(appointmentsData)) {
      appointmentsData.forEach((appointment: any) => {
        days.add(appointment.date);
      });
    }

    // Add days with blocked times
    if (blockedTimesData && Array.isArray(blockedTimesData)) {
      blockedTimesData.forEach((block: BlockedTime) => {
        days.add(block.date);
      });
    }

    return Array.from(days).map(date => parseISO(date));
  }, [appointmentsData, blockedTimesData]);

  // Calculate unavailable days (days where the provider is not available)
  const unavailableDays = useMemo(() => {
    const unavailableDayNumbers = weeklySchedule
      .filter(day => !day.isAvailable)
      .map(day => day.dayOfWeek);

    const currentMonth = selectedMonth;
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return daysInMonth.filter(day => unavailableDayNumbers.includes(day.getDay()));
  }, [weeklySchedule, selectedMonth]);

  const timeSlots = useMemo(() => {
    return getTimeSlots(selectedDate);
  }, [selectedDate, getTimeSlots]);

  const isLoading = isLoadingAvailability || isLoadingBlockedTimes || isLoadingAppointments;

  if (!providerId) {
    return (
      <ProviderLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de Autenticação</AlertTitle>
          <AlertDescription>
            Você precisa estar autenticado como prestador para acessar esta página.
          </AlertDescription>
        </Alert>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <PageTransition>
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gerenciamento de Agenda</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={openManualBookingDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Agendar Manualmente
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditWeeklyScheduleDialogOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar Agenda
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Calendário</CardTitle>
                <CardDescription>Selecione uma data para gerenciar</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  onMonthChange={setSelectedMonth}
                  modifiers={{
                    busy: busyDays,
                    unavailable: unavailableDays
                  }}
                  modifiersStyles={{
                    busy: { backgroundColor: 'rgba(236, 72, 153, 0.1)' },
                    unavailable: { backgroundColor: 'rgba(239, 68, 68, 0.1)', textDecoration: 'line-through' }
                  }}
                  className="rounded-md border"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-primary/20"></div>
                    <span className="text-xs text-muted-foreground">Ocupado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/20"></div>
                    <span className="text-xs text-muted-foreground">Indisponível</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsBlockTimeDialogOpen(true)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Bloquear Horário
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </CardTitle>
                <CardDescription>
                  Horários disponíveis e agendamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : timeSlots.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Dia Indisponível</AlertTitle>
                    <AlertDescription>
                      Este dia não está configurado como disponível na sua agenda.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {timeSlots.map((slot, index) => (
                        <div 
                          key={index}
                          className={cn(
                            "p-3 rounded-md border flex justify-between items-center",
                            !slot.isAvailable && slot.status 
                              ? "bg-primary/10 border-primary/20" 
                              : !slot.isAvailable 
                                ? "bg-muted/50 border-muted" 
                                : "bg-secondary/10 border-secondary/20"
                          )}
                        >
                          <div>
                            <h3 className="font-medium">
                              {slot.startTime} - {slot.endTime}
                            </h3>
                            {slot.status && (
                              <Badge variant={
                                slot.status === 'confirmed' ? "default" : 
                                slot.status === 'completed' ? "success" :
                                slot.status === 'canceled' ? "destructive" : "outline"
                              }>
                                {slot.status === 'confirmed' ? "Confirmado" : 
                                 slot.status === 'completed' ? "Concluído" :
                                 slot.status === 'canceled' ? "Cancelado" : 
                                 slot.status === 'pending' ? "Pendente" : slot.status}
                              </Badge>
                            )}
                          </div>
                          {slot.isAvailable ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setManualBookingDate(selectedDate);
                                      setManualStartTime(slot.startTime);
                                      setManualEndTime(slot.endTime);
                                      setIsManualBookingDialogOpen(true);
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Agendar</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            !slot.status && (
                              <Badge variant="outline">Bloqueado</Badge>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Block Time Dialog */}
          <Dialog open={isBlockTimeDialogOpen} onOpenChange={setIsBlockTimeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bloquear Horário</DialogTitle>
                <DialogDescription>
                  Bloqueie um período na sua agenda para pausas, reuniões ou outros compromissos.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="blockDate">Data</Label>
                    <div className="p-3 border rounded-md">
                      {format(selectedDate, "dd/MM/yyyy")}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="blockStartTime">Hora de início</Label>
                    <Select 
                      value={blockStartTime} 
                      onValueChange={setBlockStartTime}
                    >
                      <SelectTrigger id="blockStartTime">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, hour) => 
                          Array.from({ length: 2 }).map((_, halfHour) => {
                            const time = `${hour.toString().padStart(2, '0')}:${halfHour * 30 === 0 ? '00' : '30'}`;
                            return (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="blockEndTime">Hora de término</Label>
                    <Select 
                      value={blockEndTime} 
                      onValueChange={setBlockEndTime}
                    >
                      <SelectTrigger id="blockEndTime">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, hour) => 
                          Array.from({ length: 2 }).map((_, halfHour) => {
                            const time = `${hour.toString().padStart(2, '0')}:${halfHour * 30 === 0 ? '00' : '30'}`;
                            return (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="blockReason">Motivo</Label>
                  <Input 
                    id="blockReason" 
                    value={blockReason} 
                    onChange={(e) => setBlockReason(e.target.value)} 
                    placeholder="Almoço, reunião, etc."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsBlockTimeDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleBlockTime}
                  disabled={blockTimeMutation.isPending}
                >
                  {blockTimeMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Bloquear
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Weekly Schedule Dialog */}
          <Dialog 
            open={isEditWeeklyScheduleDialogOpen} 
            onOpenChange={setIsEditWeeklyScheduleDialogOpen}
          >
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Configurar Agenda Semanal</DialogTitle>
                <DialogDescription>
                  Defina seus horários de atendimento para cada dia da semana.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="grid gap-4">
                  {weeklySchedule.map((day, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-md">
                      <div className="flex items-center gap-2 min-w-[160px]">
                        <Switch 
                          checked={day.isAvailable} 
                          onCheckedChange={(checked) => {
                            const newSchedule = [...weeklySchedule];
                            newSchedule[index] = {
                              ...newSchedule[index],
                              isAvailable: checked
                            };
                            setWeeklySchedule(newSchedule);
                          }}
                        />
                        <Label className="font-medium">
                          {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][day.dayOfWeek]}
                        </Label>
                      </div>

                      <div className="grid grid-cols-3 gap-3 flex-1">
                        <div>
                          <Label>Hora de início</Label>
                          <Select 
                            value={day.startTime} 
                            onValueChange={(time) => {
                              const newSchedule = [...weeklySchedule];
                              newSchedule[index] = {
                                ...newSchedule[index],
                                startTime: time
                              };
                              setWeeklySchedule(newSchedule);
                            }}
                            disabled={!day.isAvailable}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }).map((_, hour) => 
                                Array.from({ length: 2 }).map((_, halfHour) => {
                                  const time = `${hour.toString().padStart(2, '0')}:${halfHour * 30 === 0 ? '00' : '30'}`;
                                  return (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  );
                                })
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Hora de término</Label>
                          <Select 
                            value={day.endTime} 
                            onValueChange={(time) => {
                              const newSchedule = [...weeklySchedule];
                              newSchedule[index] = {
                                ...newSchedule[index],
                                endTime: time
                              };
                              setWeeklySchedule(newSchedule);
                            }}
                            disabled={!day.isAvailable}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }).map((_, hour) => 
                                Array.from({ length: 2 }).map((_, halfHour) => {
                                  const time = `${hour.toString().padStart(2, '0')}:${halfHour * 30 === 0 ? '00' : '30'}`;
                                  return (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  );
                                })
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Intervalo (minutos)</Label>
                          <Select 
                            value={day.intervalMinutes.toString()} 
                            onValueChange={(interval) => {
                              const newSchedule = [...weeklySchedule];
                              newSchedule[index] = {
                                ...newSchedule[index],
                                intervalMinutes: parseInt(interval)
                              };
                              setWeeklySchedule(newSchedule);
                            }}
                            disabled={!day.isAvailable}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {[15, 30, 45, 60, 90, 120].map((interval) => (
                                <SelectItem key={interval} value={interval.toString()}>
                                  {interval} minutos
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditWeeklyScheduleDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateWeeklySchedule}
                  disabled={updateWeeklyScheduleMutation.isPending}
                >
                  {updateWeeklyScheduleMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Manual Booking Dialog */}
          <Dialog open={isManualBookingDialogOpen} onOpenChange={setIsManualBookingDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Agendamento Manual</DialogTitle>
                <DialogDescription>
                  Adicione um agendamento manualmente na sua agenda.
                </                DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Calendar
                      mode="single"
                      selected={manualBookingDate}
                      onSelect={(date) => date && setManualBookingDate(date)}
                      className="rounded-md border mt-2"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="manualStartTime">Hora de início</Label>
                      <Select 
                        value={manualStartTime} 
                        onValueChange={setManualStartTime}
                      >
                        <SelectTrigger id="manualStartTime">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, hour) => 
                            Array.from({ length: 2 }).map((_, halfHour) => {
                              const time = `${hour.toString().padStart(2, '0')}:${halfHour * 30 === 0 ? '00' : '30'}`;
                              return (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="manualEndTime">Hora de término</Label>
                      <Select 
                        value={manualEndTime} 
                        onValueChange={setManualEndTime}
                      >
                        <SelectTrigger id="manualEndTime">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, hour) => 
                            Array.from({ length: 2 }).map((_, halfHour) => {
                              const time = `${hour.toString().padStart(2, '0')}:${halfHour * 30 === 0 ? '00' : '30'}`;
                              return (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="manualService">Serviço</Label>
                      <Select 
                        value={manualServiceId?.toString()} 
                        onValueChange={(value) => setManualServiceId(parseInt(value))}
                      >
                        <SelectTrigger id="manualService">
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {providerServicesData && providerServicesData.map((service: any) => (
                            <SelectItem key={service.id} value={service.serviceId.toString()}>
                              {service.serviceName} - {(service.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manualClientName">Nome do cliente</Label>
                    <Input 
                      id="manualClientName" 
                      value={manualClientName} 
                      onChange={(e) => setManualClientName(e.target.value)} 
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="manualClientPhone">Telefone</Label>
                    <Input 
                      id="manualClientPhone" 
                      value={manualClientPhone} 
                      onChange={(e) => setManualClientPhone(e.target.value)} 
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="manualClientEmail">E-mail</Label>
                  <Input 
                    id="manualClientEmail" 
                    value={manualClientEmail} 
                    onChange={(e) => setManualClientEmail(e.target.value)} 
                    placeholder="email@exemplo.com"
                    type="email"
                  />
                </div>

                <div>
                  <Label htmlFor="manualNotes">Observações</Label>
                  <Textarea 
                    id="manualNotes" 
                    value={manualNotes} 
                    onChange={(e) => setManualNotes(e.target.value)} 
                    placeholder="Informações adicionais sobre o agendamento"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsManualBookingDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleManualBooking}
                  disabled={createManualBookingMutation.isPending}
                >
                  {createManualBookingMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Criar Agendamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    </ProviderLayout>
  );
}