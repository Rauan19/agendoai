import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, ChevronRight, MapPin, Star, Clock, Calendar as CalendarIcon, CheckCircle, User, Scissors, CreditCard, Info, Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { format, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Check, Calendar as CalendarIcon2, DollarSign, ScissorsIcon } from "lucide-react";

// Types
type BookingStep = "niche" | "category" | "service" | "date" | "providers" | "time-slot" | "payment" | "confirmation";

interface BookingState {
  selectedNiche: any;
  selectedCategory: any;
  selectedService: any;
  selectedProviders: any[];
  selectedProvider: any;
  selectedDate: Date | null;
  selectedTimeSlot: any;
  selectedPaymentMethod: string;
  selectedPaymentType: "offline" | "online";
  createdAppointment: any; // Dados do agendamento criado
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  availabilityId?: number;
}

interface NewBookingWizardProps {
  onComplete?: (bookingData: any) => void;
  preSelectedServiceId?: number | null;
}

export default function NewBookingWizard({ onComplete, preSelectedServiceId }: NewBookingWizardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Query para buscar configurações de pagamento
  const { data: paymentSettings } = useQuery({
    queryKey: ["/api/payment-settings"],
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  });

  // Estado para controlar qual etapa está ativa
  const [currentStep, setCurrentStep] = useState<BookingStep>("niche");
  const [bookingState, setBookingState] = useState<BookingState>({
    selectedNiche: null,
    selectedCategory: null,
    selectedService: null,
    selectedProviders: [],
    selectedProvider: null,
    selectedDate: null,
    selectedTimeSlot: null,
    selectedPaymentMethod: "money",
    selectedPaymentType: "offline",
    createdAppointment: null,
  });

  // Simplified error handling
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Promise rejection capturada:', event.reason);
      // Prevent console spam for date-related errors
      if (event.reason?.message?.includes('Invalid time value')) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Função helper para validar datas
  const isValidDate = (date: any): boolean => {
    try {
      return date instanceof Date && !isNaN(date.getTime());
    } catch {
      return false;
    }
  };

  const tomorrow = useMemo(() => {
    try {
      const now = new Date();
      const today = startOfDay(now);
      return addDays(today, 1);
    } catch (error) {
      console.error("Erro ao calcular tomorrow:", error);
      // Fallback mais robusto
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() + 1);
      return fallbackDate;
    }
  }, []);

  // Fetch niches
  const { data: niches = [], isLoading: isLoadingNiches } = useQuery({
    queryKey: ['/api/niches'],
    queryFn: async () => {
      const response = await fetch('/api/niches');
      if (!response.ok) throw new Error('Failed to fetch niches');
      return response.json();
    }
  });

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories', bookingState.selectedNiche?.id],
    enabled: !!bookingState.selectedNiche,
    queryFn: async () => {
      const response = await fetch(`/api/categories?nicheId=${bookingState.selectedNiche.id}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const allCategories = await response.json();
      return allCategories.filter((cat: any) => cat.nicheId === bookingState.selectedNiche.id);
    }
  });

  // Fetch services
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services', bookingState.selectedCategory?.id],
    enabled: !!bookingState.selectedCategory,
    queryFn: async () => {
      const response = await fetch(`/api/services?categoryId=${bookingState.selectedCategory.id}`);
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    }
  });

  // Fetch providers by service and location (após seleção do serviço)
  const { data: providersData = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ['/api/providers/service-search', bookingState.selectedService?.id],
    enabled: !!bookingState.selectedService,
    queryFn: async () => {
      console.log('Buscando prestadores para serviço:', bookingState.selectedService.id);
      const response = await fetch(`/api/providers/service-search?serviceIds=${bookingState.selectedService.id}`);
      if (!response.ok) {
        console.error('Erro na busca de prestadores:', response.status, response.statusText);
        throw new Error('Failed to fetch providers');
      }
      const data = await response.json();
      console.log('Resposta da busca de prestadores:', data);
      return data.providers || [];
    }
  });

  // Fetch providers with availability for selected date
  const { data: availableProviders = [], isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['/api/providers/service-search', bookingState.selectedService?.id, bookingState.selectedDate],
    enabled: !!bookingState.selectedService && !!bookingState.selectedDate,
    queryFn: async () => {
      const dateStr = format(bookingState.selectedDate!, 'yyyy-MM-dd');
      const response = await fetch(`/api/providers/service-search?serviceIds=${bookingState.selectedService.id}&date=${dateStr}`);
      if (!response.ok) throw new Error('Failed to fetch available providers');
      const data = await response.json();
      return data.providers || [];
    }
  });

  // Fetch time slots for selected provider and date
  const { data: timeSlots = [], isLoading: isLoadingTimeSlots } = useQuery({
    queryKey: ['/api/providers', bookingState.selectedProvider?.provider?.id, 'time-slots', bookingState.selectedDate, bookingState.selectedService?.id],
    enabled: !!bookingState.selectedProvider && !!bookingState.selectedDate && !!bookingState.selectedService,
    queryFn: async () => {
      const dateStr = format(bookingState.selectedDate!, 'yyyy-MM-dd');
      const providerId = bookingState.selectedProvider.provider.id;
      const serviceId = bookingState.selectedService.id;

      // Buscar duração do serviço configurada pelo prestador
      const providerService = bookingState.selectedProvider.services.find((s: any) => s.id === serviceId);
      const duration = providerService?.duration || bookingState.selectedService?.duration || 60;

      const response = await fetch(`/api/providers/${providerId}/time-slots?date=${dateStr}&duration=${duration}&serviceId=${serviceId}`);
      if (!response.ok) throw new Error('Failed to fetch time slots');
      const data = await response.json();

      // Handle both array format and object with timeSlots property
      if (Array.isArray(data)) {
        return data;
      } else if (data.timeSlots && Array.isArray(data.timeSlots)) {
        return data.timeSlots;
      } else {
        console.warn('Unexpected time slots data format:', data);
        return [];
      }
    }
  });

  // Mutation para criar agendamento
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar agendamento');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('Agendamento finalizado com dados:', data);

      // Salvar dados do agendamento criado no estado
      setBookingState(prev => ({
        ...prev,
        createdAppointment: data.appointment
      }));

      // Ir para etapa 8 (confirmação)
      setCurrentStep("confirmation");
    },
    onError: (error: any) => {
      console.error('Erro ao finalizar agendamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar agendamento",
        variant: "destructive"
      });
    }
  });

  // Navigation functions
  const goToNextStep = () => {
    const steps: BookingStep[] = ["niche", "category", "service", "date", "providers", "time-slot", "payment", "confirmation"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const steps: BookingStep[] = ["niche", "category", "service", "date", "providers", "time-slot", "payment", "confirmation"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const formatDate = (date: Date) => {
    try {
      return format(date, "yyyy-MM-dd");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return format(new Date(), "yyyy-MM-dd");
    }
  };

  // Selection handlers
  const handleNicheSelect = (niche: any) => {
    setBookingState(prev => ({
      ...prev,
      selectedNiche: niche,
      selectedCategory: null,
      selectedService: null,
      selectedProviders: [],
      selectedProvider: null,
      selectedDate: null,
      selectedTimeSlot: null
    }));
    goToNextStep();
  };

  const handleCategorySelect = (category: any) => {
    setBookingState(prev => ({
      ...prev,
      selectedCategory: category,
      selectedService: null,
      selectedProviders: [],
      selectedProvider: null,
      selectedDate: null,
      selectedTimeSlot: null
    }));
    goToNextStep();
  };

  const handleServiceSelect = (service: any) => {
    console.log('Serviço selecionado:', service);
    setBookingState(prev => ({
      ...prev,
      selectedService: service,
      selectedProviders: [],
      selectedProvider: null,
      selectedDate: null,
      selectedTimeSlot: null
    }));
    goToNextStep();
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setBookingState(prev => ({
        ...prev,
        selectedDate: date,
        selectedProvider: null,
        selectedTimeSlot: null
      }));
      goToNextStep();
    }
  };

  const handleProviderSelect = (provider: any) => {
    setBookingState(prev => ({
      ...prev,
      selectedProvider: provider,
      selectedTimeSlot: null
    }));
    goToNextStep();
  };

  const handleTimeSlotSelect = (timeSlot: any) => {
    setBookingState(prev => ({
      ...prev,
      selectedTimeSlot: timeSlot
    }));
    goToNextStep();
  };

  const handlePaymentSubmit = () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para fazer um agendamento.",
        variant: "destructive",
      });
      return;
    }

    // Buscar duração configurada pelo prestador para este serviço
    const providerService = bookingState.selectedProvider.services.find((s: any) => s.id === bookingState.selectedService.id);
    const duration = providerService?.duration || bookingState.selectedService?.duration || 60;
    const price = providerService?.price || bookingState.selectedService?.price || 0;

    const appointmentData = {
      clientId: user.id,
      providerId: bookingState.selectedProvider.provider.id,
      serviceId: bookingState.selectedService.id,
      providerServiceId: providerService?.id,
      date: formatDate(bookingState.selectedDate!),
      startTime: bookingState.selectedTimeSlot.startTime,
      endTime: bookingState.selectedTimeSlot.endTime,
      availabilityId: bookingState.selectedTimeSlot.availabilityId,
      paymentMethod: bookingState.selectedPaymentMethod,
      paymentType: bookingState.selectedPaymentType,
      status: 'pending',
      notes: '',
      duration: duration,
      price: price
    };

    if (bookingState.selectedPaymentType === "online") {
      // Redirecionar para gateway de pagamento
      if (onComplete) {
        onComplete({
          ...appointmentData,
          needsPayment: true
        });
      }
    } else {
      // Criar agendamento diretamente para pagamento offline
      createAppointmentMutation.mutate(appointmentData);
    }
  };

  // Render functions for each step
  const renderNicheStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Escolha a área de serviço</h2>
        <p className="text-muted-foreground">Qual área de serviço você precisa?</p>
      </div>

      {isLoadingNiches ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {niches.map((niche: any) => (
            <Card 
              key={niche.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNicheSelect(niche)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{niche.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{niche.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCategoryStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Selecione a categoria</h2>
        <p className="text-muted-foreground">
          Escolha a categoria em {bookingState.selectedNiche?.name}
        </p>
      </div>

      {isLoadingCategories ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category: any) => (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCategorySelect(category)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goToPreviousStep}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    </div>
  );

  const renderServiceStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 text-gray-900">Qual serviço você precisa?</h2>
        <p className="text-lg text-gray-600">
          Escolha o serviço em <span className="font-semibold text-primary">{bookingState.selectedCategory?.name}</span>
        </p>
      </div>

      {isLoadingServices ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Carregando serviços disponíveis...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço encontrado</h3>
            <p className="text-gray-500">Não há serviços disponíveis nesta categoria no momento.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: any) => (
            <Card 
              key={service.id} 
              className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 hover:border-primary/50 group"
              onClick={() => handleServiceSelect(service)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {service.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {service.description || "Serviço profissional de qualidade"}
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Disponível
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={goToPreviousStep} size="lg">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    </div>
  );

  const renderProvidersStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Prestadores disponíveis</h2>
        <p className="text-muted-foreground">
          Prestadores que oferecem {bookingState.selectedService?.name} em {format(bookingState.selectedDate!, 'dd/MM/yyyy', { locale: ptBR })}
        </p>
      </div>

      {isLoadingAvailability ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : availableProviders.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="text-orange-600 mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <Info className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-orange-900 mb-2">Nenhum prestador disponível</h3>
            <p className="text-orange-700 mb-4">
              Não encontramos prestadores disponíveis para {bookingState.selectedService?.name} em {format(bookingState.selectedDate!, 'dd/MM/yyyy', { locale: ptBR })}.
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Escolher outra data
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {availableProviders.map((providerData: any) => {
            const provider = providerData.provider;
            const serviceInfo = providerData.services.find((s: any) => s.id === bookingState.selectedService.id);

            return (
              <Card 
                key={provider.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProviderSelect(providerData)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{provider.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{provider.address || 'Endereço não informado'}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">
                          {providerData.rating ? (providerData.rating / 10).toFixed(1) : 'Sem avaliações'}
                        </span>
                      </div>
                      {serviceInfo && (
                        <>
                          <div className="flex items-center space-x-2 mt-1 text-sm">
                            <Clock className="h-3 w-3" />
                            <span>Duração: {serviceInfo.duration || bookingState.selectedService?.duration || 60} min</span>
                          </div>
                          <div className="text-sm font-medium mt-1">
                            R$ {((serviceInfo.price || bookingState.selectedService?.price || 0) / 100).toFixed(2)}
                          </div>
                        </>
                      )}
                      <div className="flex items-center space-x-2 mt-1 text-xs text-green-600">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Disponível
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goToPreviousStep}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    </div>
  );

  const renderDateStep = () => {
    const now = new Date();
    const minDate = addDays(startOfDay(now), 1); // Tomorrow as minimum
    const maxDate = addDays(now, 60);

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Escolha a data do seu atendimento</h2>
          <p className="text-muted-foreground">
            Selecione quando você gostaria de ser atendido
          </p>
        </div>

        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={bookingState.selectedDate || undefined}
            onSelect={handleDateSelect}
            disabled={(date) => isBefore(date, minDate) || isAfter(date, maxDate)}
            locale={ptBR}
            className="rounded-md border"
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={goToPreviousStep}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          {bookingState.selectedDate && (
            <Badge variant="default" className="px-4 py-2">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(bookingState.selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const renderTimeSlotStep = () => {
    const availableSlots = timeSlots.filter((slot: any) => slot.isAvailable);
    const morningSlots = availableSlots.filter((slot: any) => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour >= 6 && hour < 12;
    });
    const afternoonSlots = availableSlots.filter((slot: any) => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour >= 12 && hour < 18;
    });
    const eveningSlots = availableSlots.filter((slot: any) => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour >= 18;
    });

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Escolha um horário</h2>
          <p className="text-muted-foreground">
            Horários disponíveis com {bookingState.selectedProvider?.provider?.name} em {format(bookingState.selectedDate!, 'dd/MM/yyyy', { locale: ptBR })}
          </p>
        </div>

        {isLoadingTimeSlots ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum horário disponível para esta data.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tente outra data.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {morningSlots.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Manhã
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {morningSlots.map((slot: any, index: number) => (
                    <Button
                      key={`morning-${index}`}
                      variant={bookingState.selectedTimeSlot?.startTime === slot.startTime ? "default" : "outline"}
                      className="h-12"
                      onClick={() => handleTimeSlotSelect(slot)}
                    >
                      {slot.startTime}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {afternoonSlots.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Tarde
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {afternoonSlots.map((slot: any, index: number) => (
                    <Button
                      key={`afternoon-${index}`}
                      variant={bookingState.selectedTimeSlot?.startTime === slot.startTime ? "default" : "outline"}
                      className="h-12"
                      onClick={() => handleTimeSlotSelect(slot)}
                    >
                      {slot.startTime}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {eveningSlots.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Noite
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {eveningSlots.map((slot: any, index: number) => (
                    <Button
                      key={`evening-${index}`}
                      variant={bookingState.selectedTimeSlot?.startTime === slot.startTime ? "default" : "outline"}
                      className="h-12"
                      onClick={() => handleTimeSlotSelect(slot)}
                    >
                      {slot.startTime}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={goToPreviousStep}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  };

  const renderPaymentStep = () => {
    // Buscar informações do serviço configurado pelo prestador
    const providerService = bookingState.selectedProvider?.services.find((s: any) => s.id === bookingState.selectedService.id);
    const servicePrice = providerService?.price || bookingState.selectedService?.price || 0;
    const serviceDuration = providerService?.duration || bookingState.selectedService?.duration || 60;

    return (
      <div className="space-y-8">
        {/* Cabeçalho da etapa final */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3 text-gray-900">Quase pronto!</h2>
          <p className="text-lg text-gray-600">
            Confirme os detalhes e escolha como deseja pagar
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Coluna da esquerda - Resumo do agendamento */}
          <Card className="shadow-lg border-2 border-gray-100">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
              <CardTitle className="text-xl font-semibold flex items-center">
                <CalendarIcon2 className="mr-3 h-5 w-5 text-primary" />
                Resumo do Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ScissorsIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{bookingState.selectedService?.name}</h3>
                    <p className="text-sm text-gray-500">Serviço selecionado</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{bookingState.selectedProvider?.provider?.name}</h3>
                    <p className="text-sm text-gray-500">Prestador escolhido</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {bookingState.selectedDate && format(bookingState.selectedDate, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                    </h3>
                    <p className="text-sm text-gray-500">Data do atendimento</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {bookingState.selectedTimeSlot?.startTime} - {bookingState.selectedTimeSlot?.endTime}
                    </h3>
                    <p className="text-sm text-gray-500">Duração: {serviceDuration} minutos</p>
                  </div>
                </div>

                {/* Detalhes do preço */}
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <div className="space-y-3">
                    {/* Preço do serviço */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Valor do serviço:</span>
                      <span className="font-medium">
                        R$ {(servicePrice / 100).toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Taxa de serviço */}
                    {servicePrice > 0 && (() => {
                      // Usar configurações do backend ou valores padrão
                      const serviceFee = paymentSettings?.serviceFee || 175; // R$ 1,75 em centavos
                      const minServiceFee = paymentSettings?.minServiceFee || 100; // R$ 1,00
                      const maxServiceFee = paymentSettings?.maxServiceFee || 5000; // R$ 50,00
                      
                      // Aplicar limites mínimo e máximo
                      let appliedServiceFee = serviceFee;
                      if (appliedServiceFee < minServiceFee) {
                        appliedServiceFee = minServiceFee;
                      } else if (appliedServiceFee > maxServiceFee) {
                        appliedServiceFee = maxServiceFee;
                      }
                      
                      return (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Taxa de serviço:</span>
                          <span className="font-medium">
                            R$ {(appliedServiceFee / 100).toFixed(2)}
                          </span>
                        </div>
                      );
                    })()}
                    
                    {/* Linha divisória */}
                    <hr className="border-gray-300" />
                    
                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-700">Valor Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        {(() => {
                          if (servicePrice === 0) return 'R$ 0,00';
                          
                          const serviceFee = paymentSettings?.serviceFee || 175;
                          const minServiceFee = paymentSettings?.minServiceFee || 100;
                          const maxServiceFee = paymentSettings?.maxServiceFee || 5000;
                          
                          let appliedServiceFee = serviceFee;
                          if (appliedServiceFee < minServiceFee) {
                            appliedServiceFee = minServiceFee;
                          } else if (appliedServiceFee > maxServiceFee) {
                            appliedServiceFee = maxServiceFee;
                          }
                          
                          const totalPrice = servicePrice + appliedServiceFee;
                          return `R$ ${(totalPrice / 100).toFixed(2)}`;
                        })()}
                      </span>
                    </div>
                    
                    {servicePrice === 0 && (
                      <p className="text-sm text-green-600 mt-1">✓ Serviço gratuito</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coluna da direita - Opções de pagamento */}
          <div className="space-y-6">
            {/* Tipo de pagamento */}
            <Card className="shadow-lg border-2 border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-primary" />
                  Como você quer pagar?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={bookingState.selectedPaymentType}
                  onValueChange={(value) => setBookingState(prev => ({ 
                    ...prev, 
                    selectedPaymentType: value as "offline" | "online",
                    selectedPaymentMethod: value === "offline" ? "money" : "credit_card"
                  }))}
                  className="space-y-4"
                >
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="offline" id="offline" />
                      <Label htmlFor="offline" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Presencial</p>
                            <p className="text-sm text-gray-500">Pagar diretamente ao prestador</p>
                          </div>
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                      </Label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Online</p>
                            <p className="text-sm text-gray-500">Pagar agora pelo app</p>
                          </div>
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Método de pagamento específico */}
            <Card className="shadow-lg border-2 border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Método de pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={bookingState.selectedPaymentMethod}
                  onValueChange={(value) => setBookingState(prev => ({ ...prev, selectedPaymentMethod: value }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Escolha como pagar" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookingState.selectedPaymentType === "offline" ? (
                      <>
                        <SelectItem value="money">
                          <div className="flex items-center space-x-2">
                            <span>💵</span>
                            <span>Dinheiro</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="debit_card">
                          <div className="flex items-center space-x-2">
                            <span>💳</span>
                            <span>Cartão de Débito</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="credit_card">
                          <div className="flex items-center space-x-2">
                            <span>💳</span>
                            <span>Cartão de Crédito</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="pix">
                          <div className="flex items-center space-x-2">
                            <span>📱</span>
                            <span>PIX</span>
                          </div>
                        </SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="credit_card">
                          <div className="flex items-center space-x-2">
                            <span>💳</span>
                            <span>Cartão de Crédito</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="pix">
                          <div className="flex items-center space-x-2">
                            <span>📱</span>
                            <span>PIX</span>
                          </div>
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>

                {/* Informações adicionais baseadas no tipo de pagamento */}
                {bookingState.selectedPaymentType === "offline" && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Pagamento no local</p>
                        <p>Você pagará diretamente ao prestador no momento do atendimento.</p>
                      </div>
                    </div>
                  </div>
                )}

                {bookingState.selectedPaymentType === "online" && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium">Pagamento online</p>
                        <p>Seu agendamento será confirmado após o pagamento.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={goToPreviousStep} size="lg" className="sm:w-auto w-full">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Button 
            onClick={handlePaymentSubmit}
            disabled={createAppointmentMutation.isPending || !bookingState.selectedPaymentMethod}
            size="lg"
            className="sm:w-auto w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold py-3 px-8"
          >
            {createAppointmentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processando...
              </>
            ) : bookingState.selectedPaymentType === "online" ? (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Ir para Pagamento
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Confirmar Agendamento
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-green-700">Agendamento Confirmado!</h2>
        <p className="text-muted-foreground">Seu agendamento foi criado com sucesso</p>
      </div>

      {bookingState.createdAppointment && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes do Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Número</Label>
                  <p className="text-lg font-semibold">#{bookingState.createdAppointment.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Pendente
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ScissorsIcon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{bookingState.selectedService?.name}</p>
                    <p className="text-sm text-muted-foreground">Serviço selecionado</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{bookingState.selectedProvider?.provider?.name}</p>
                    <p className="text-sm text-muted-foreground">Prestador</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CalendarIcon2 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {bookingState.selectedDate ? format(bookingState.selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">Data do agendamento</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {bookingState.selectedTimeSlot?.startTime} - {bookingState.selectedTimeSlot?.endTime}
                    </p>
                    <p className="text-sm text-muted-foreground">Horário</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">R$ {(bookingState.createdAppointment.price / 100).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Pagamento: {bookingState.selectedPaymentMethod === 'money' ? 'Dinheiro' : 
                                 bookingState.selectedPaymentMethod === 'pix' ? 'PIX' : 'Cartão'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Próximos passos</h4>
                <ul className="text-sm text-blue-800 mt-1 space-y-1">
                  <li>• O prestador foi notificado sobre seu agendamento</li>
                  <li>• Você receberá uma confirmação quando o prestador aceitar</li>
                  <li>• Acompanhe o status em "Meus Agendamentos"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => {
            if (onComplete) {
              onComplete(bookingState.createdAppointment);
            } else {
              setLocation(`/client/appointments/${bookingState.createdAppointment.id}`);
            }
          }}
        >
          <CalendarIcon2 className="w-4 h-4 mr-2" />
          Ver Meus Agendamentos
        </Button>
        <Button 
          className="flex-1"
          onClick={() => {
            // Reset do wizard para novo agendamento
            setBookingState({
              selectedNiche: null,
              selectedCategory: null,
              selectedService: null,
              selectedProviders: [],
              selectedProvider: null,
              selectedDate: null,
              selectedTimeSlot: null,
              selectedPaymentMethod: "money",
              selectedPaymentType: "offline",
              createdAppointment: null
            });
            setCurrentStep("niche");
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>
    </div>
  );

  const renderProgressBar = () => {
    const steps: BookingStep[] = ["niche", "category", "service", "date", "providers", "time-slot", "payment", "confirmation"];
    const currentIndex = steps.indexOf(currentStep);

    const stepLabels = {
      "niche": "Área",
      "category": "Categoria", 
      "service": "Serviço",
      "date": "Data",
      "providers": "Prestador",
      "time-slot": "Horário",
      "payment": "Pagamento",
      "confirmation": "Confirmação"
    };

    return (
      <div className="mb-6">
        <div className="w-full bg-muted h-2 rounded-full mb-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Etapa {currentIndex + 1} de {steps.length}: {stepLabels[currentStep]}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "niche":
        return renderNicheStep();
      case "category":
        return renderCategoryStep();
      case "service":
        return renderServiceStep();
      case "date":
        return renderDateStep();
      case "providers":
        return renderProvidersStep();
      case "time-slot":
        return renderTimeSlotStep();
      case "payment":
        return renderPaymentStep();
      case "confirmation":
        return renderConfirmationStep();
      default:
        return renderNicheStep();
    }
  };

  const totalSteps = 8;

  const steps = [
    { id: 1, name: "Nicho", description: "Escolha a área de serviço" },
    { id: 2, name: "Categoria", description: "Selecione a categoria" },
    { id: 3, name: "Serviço", description: "Escolha o serviço desejado" },
    { id: 4, name: "Data", description: "Selecione a data" },
    { id: 5, name: "Prestadores", description: "Escolha o prestador" },
    { id: 6, name: "Horário", description: "Selecione o horário" },
    { id: 7, name: "Pagamento", description: "Confirme o pagamento" },
    { id: 8, name: "Confirmação", description: "Agendamento confirmado" }
  ];

  const stepMapping: Record<string, BookingStep> = {
    "nicho": "niche",
    "categoria": "category", 
    "serviço": "service",
    "data": "date",
    "prestadores": "providers",
    "horário": "time-slot",
    "pagamento": "payment",
    "confirmação": "confirmation"
  };

  const reverseStepMapping: Record<BookingStep, string> = {
    "niche": "nicho",
    "category": "categoria",
    "service": "serviço", 
    "date": "data",
    "providers": "prestadores",
    "time-slot": "horário",
    "payment": "pagamento",
    "confirmation": "confirmação"
  };

  const handleNext = () => {
    const currentStepName = reverseStepMapping[currentStep];
    const currentStepIndex = steps.findIndex(step => step.name.toLowerCase() === currentStepName);
    if (currentStepIndex < steps.length - 1) {
      const nextStepName = steps[currentStepIndex + 1].name;
      setCurrentStep(stepMapping[nextStepName.toLowerCase()]);
    }
  };

  const handlePrevious = () => {
    const currentStepName = reverseStepMapping[currentStep];
    const currentStepIndex = steps.findIndex(step => step.name.toLowerCase() === currentStepName);
    if (currentStepIndex > 0) {
      const prevStepName = steps[currentStepIndex - 1].name;
      setCurrentStep(stepMapping[prevStepName.toLowerCase()]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "niche":
        return !!bookingState.selectedNiche;
      case "category":
        return !!bookingState.selectedCategory;
      case "service":
        return !!bookingState.selectedService;
      case "date":
        return !!bookingState.selectedDate;
      case "providers":
        return !!bookingState.selectedProvider;
      case "time-slot":
        return !!bookingState.selectedTimeSlot;
      case "payment":
        return !!bookingState.selectedPaymentMethod;
      case "confirmation":
        return false; // Etapa final, não há próximo passo
      default:
        return false;
    }
  };

  const handleFinishBooking = () => {
    if (!user || !bookingState.selectedProvider || !bookingState.selectedService || !bookingState.selectedDate || !bookingState.selectedTimeSlot) {
      toast({
        title: "Erro",
        description: "Dados incompletos para finalizar o agendamento",
        variant: "destructive"
      });
      return;
    }

    const providerService = bookingState.selectedProvider.services.find((s: any) => s.id === bookingState.selectedService.id);
    const duration = providerService?.duration || bookingState.selectedService?.duration || 60;
    const price = providerService?.price || bookingState.selectedService?.price || 0;

    const appointmentData = {
      clientId: user.id,
      providerId: bookingState.selectedProvider.provider.id,
      serviceId: bookingState.selectedService.id,
      providerServiceId: providerService?.id,
      date: formatDate(bookingState.selectedDate!),
      startTime: bookingState.selectedTimeSlot.startTime,
      endTime: bookingState.selectedTimeSlot.endTime,
      availabilityId: bookingState.selectedTimeSlot.availabilityId,
      paymentMethod: bookingState.selectedPaymentMethod,
      paymentType: bookingState.selectedPaymentType,
      status: 'pending',
      notes: '',
      duration: duration,
      price: price
    };

    if (bookingState.selectedPaymentType === "online") {
      // Redirecionar para gateway de pagamento
      if (onComplete) {
        onComplete({
          ...appointmentData,
          needsPayment: true
        });
      }
    } else {
      // Criar agendamento diretamente para pagamento offline
      createAppointmentMutation.mutate(appointmentData);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {renderProgressBar()}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>
    </div>
  );
}