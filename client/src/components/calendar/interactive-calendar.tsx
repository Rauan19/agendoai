import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parse, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    client?: string;
    client_id?: number;
    service?: string;
    service_id?: number;
    status: string;
    notes?: string;
    payment_status?: string;
  };
}

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

interface Client {
  id: number;
  name: string;
  email: string;
}

const appointmentSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  client_id: z.string().min(1, "Cliente é obrigatório"),
  service_id: z.string().min(1, "Serviço é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  start_time: z.string().min(1, "Horário de início é obrigatório"),
  end_time: z.string().optional(),
  notes: z.string().optional(),
  payment_method: z.enum(["pix", "cartao", "dinheiro"]).default("pix"),
});

const InteractiveCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<Appointment[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [actionDate, setActionDate] = useState<Date | null>(null);
  const [actionSlot, setActionSlot] = useState<string | null>(null);

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: "",
      client_id: "",
      service_id: "",
      date: "",
      start_time: "",
      notes: "",
      payment_method: "pix",
    },
  });

  // Buscar agendamentos
  const appointmentsQuery = useQuery({
    queryKey: ['/api/provider/appointments'],
    enabled: !!user && user.userType === "provider",
  });
  
  const appointments = appointmentsQuery.data;
  const isLoadingAppointments = appointmentsQuery.isLoading;

  // Buscar serviços do prestador
  const servicesQuery = useQuery<Service[]>({
    queryKey: ['/api/provider/services'],
    enabled: !!user && user.userType === "provider"
  });
  
  const services = servicesQuery.data;
  const isLoadingServices = servicesQuery.isLoading;
  
  // Log para depuração quando os dados são carregados
  useEffect(() => {
    if (servicesQuery.data) {
      console.log('Serviços carregados:', servicesQuery.data);
    }
    if (servicesQuery.error) {
      console.error('Erro ao carregar serviços:', servicesQuery.error);
    }
  }, [servicesQuery.data, servicesQuery.error]);

  // Buscar clientes
  const clientsQuery = useQuery<Client[]>({
    queryKey: ['/api/provider/clients'],
    enabled: !!user && user.userType === "provider"
  });
  
  const clients = clientsQuery.data;
  const isLoadingClients = clientsQuery.isLoading;
  
  // Log para depuração quando os dados são carregados
  useEffect(() => {
    if (clientsQuery.data) {
      console.log('Clientes carregados:', clientsQuery.data);
    }
    if (clientsQuery.error) {
      console.error('Erro ao carregar clientes:', clientsQuery.error);
    }
  }, [clientsQuery.data, clientsQuery.error]);

  // Criar novo agendamento
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof appointmentSchema>) => {
      console.log("Criando agendamento manual:", data);
      
      // Estruturar os dados conforme esperado pela API
      const appointmentData = {
        title: data.title,
        clientId: parseInt(data.client_id),
        providerId: user?.id, // Usar o ID do provedor logado
        serviceId: parseInt(data.service_id),
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        notes: data.notes || "",
        status: "confirmado", // Status padrão para agendamentos manuais
        paymentMethod: data.payment_method,
        isManuallyCreated: true
      };

      const res = await apiRequest('POST', '/api/appointments', appointmentData);
      return await res.json();
    },
    onSuccess: (data) => {
      console.log("Agendamento criado com sucesso:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/provider/appointments'] });
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso!",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Erro ao criar agendamento:", error);
      toast({
        title: "Erro ao criar agendamento",
        description: error.message || "Não foi possível criar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Atualizar agendamento
  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: { id: string } & z.infer<typeof appointmentSchema>) => {
      console.log("Atualizando agendamento:", data);
      
      const { id, ...formData } = data;
      
      // Estruturar os dados conforme esperado pela API
      const appointmentData = {
        title: formData.title,
        clientId: parseInt(formData.client_id),
        providerId: user?.id, // Usar o ID do provedor logado
        serviceId: parseInt(formData.service_id),
        date: formData.date,
        startTime: formData.start_time,
        endTime: formData.end_time,
        notes: formData.notes || "",
        paymentMethod: formData.payment_method,
        // Mantemos o status atual
        status: "confirmado"
      };

      const res = await apiRequest('PUT', `/api/appointments/${id}`, appointmentData);
      return await res.json();
    },
    onSuccess: (data) => {
      console.log("Agendamento atualizado com sucesso:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/provider/appointments'] });
      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi atualizado com sucesso!",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar agendamento:", error);
      toast({
        title: "Erro ao atualizar agendamento",
        description: error.message || "Não foi possível atualizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Excluir agendamento
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Excluindo agendamento:", id);
      
      const res = await apiRequest('DELETE', `/api/appointments/${id}`);
      return await res.json();
    },
    onSuccess: (data) => {
      console.log("Agendamento excluído com sucesso");
      queryClient.invalidateQueries({ queryKey: ['/api/provider/appointments'] });
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso!",
      });
      setIsDialogOpen(false);
      setSelectedEvent(null);
    },
    onError: (error: Error) => {
      console.error("Erro ao excluir agendamento:", error);
      toast({
        title: "Erro ao excluir agendamento",
        description: error.message || "Não foi possível excluir o agendamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Converter os agendamentos para o formato do FullCalendar
  useEffect(() => {
    if (appointments && Array.isArray(appointments)) {
      const formattedEvents: Appointment[] = appointments.map((appointment: any) => {
        // Determinar a cor com base no status
        let backgroundColor = '#10b981'; // verde para confirmado
        let borderColor = '#059669';
        let textColor = '#ffffff';

        if (appointment.status === 'pendente') {
          backgroundColor = '#f59e0b'; // amarelo para pendente
          borderColor = '#d97706';
        } else if (appointment.status === 'cancelado') {
          backgroundColor = '#ef4444'; // vermelho para cancelado
          borderColor = '#dc2626';
        } 
        
        // Modificar a aparência para agendamentos manuais
        if (appointment.isManuallyCreated) {
          // Adicionar um tom laranja para destacar agendamentos manuais
          if (appointment.status === 'confirmado') {
            backgroundColor = '#38bdf8'; // azul para agendamentos manuais confirmados
            borderColor = '#0284c7';
          } else if (appointment.status === 'pendente') {
            backgroundColor = '#fb923c'; // laranja mais forte para agendamentos manuais pendentes
            borderColor = '#ea580c';
          }
        }

        const start = `${appointment.date}T${appointment.start_time}`;
        const end = `${appointment.date}T${appointment.end_time}`;

        return {
          id: String(appointment.id),
          title: appointment.title,
          start,
          end,
          backgroundColor,
          borderColor,
          textColor,
          extendedProps: {
            client: appointment.client_name,
            client_id: appointment.client_id,
            service: appointment.service_name,
            service_id: appointment.service_id,
            status: appointment.status,
            notes: appointment.notes,
            payment_status: appointment.payment_status,
            isManuallyCreated: appointment.isManuallyCreated || false,
          }
        };
      });

      setEvents(formattedEvents);
    }
  }, [appointments]);

  // Manipular clique em evento existente
  const handleEventClick = (info: any) => {
    const event = info.event;
    const eventData = {
      id: String(event.id),
      title: event.title,
      start: event.start,
      end: event.end,
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      textColor: event.textColor,
      extendedProps: event.extendedProps,
    };

    setSelectedEvent(eventData);
    setIsEditMode(true);

    // Formatando a data e hora para o formulário
    const date = format(new Date(event.start), 'yyyy-MM-dd');
    const start_time = format(new Date(event.start), 'HH:mm');

    form.reset({
      title: event.title,
      client_id: String(event.extendedProps.client_id || ""),
      service_id: String(event.extendedProps.service_id || ""),
      date,
      start_time,
      notes: event.extendedProps.notes || "",
      payment_method: "pix", // Valor padrão
    });

    setIsDialogOpen(true);
  };

  // Manipular novo agendamento por clique em data
  const handleDateClick = (info: any) => {
    setActionDate(info.date);
    setActionSlot(format(info.date, 'HH:mm'));
    setIsEditMode(false);
    setSelectedEvent(null);

    form.reset({
      title: "",
      client_id: "",
      service_id: "",
      date: format(info.date, 'yyyy-MM-dd'),
      start_time: format(info.date, 'HH:mm'),
      notes: "",
      payment_method: "pix",
    });

    setIsDialogOpen(true);
  };

  // Manipular arrastar e soltar
  const handleEventDrop = async (info: any) => {
    const event = info.event;
    
    const newDate = format(new Date(event.start), 'yyyy-MM-dd');
    const newStartTime = format(new Date(event.start), 'HH:mm');
    const newEndTime = format(new Date(event.end), 'HH:mm');
    
    console.log("Movendo agendamento:", event.id, { newDate, newStartTime, newEndTime });

    try {
      await apiRequest('PUT', `/api/appointments/${event.id}`, {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime
      });

      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi movido com sucesso!",
      });

      queryClient.invalidateQueries({ queryKey: ['/api/provider/appointments'] });
    } catch (error) {
      console.error("Erro ao mover agendamento:", error);
      info.revert();
      toast({
        title: "Erro ao mover agendamento",
        description: "Não foi possível mover o agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Manipular redimensionamento de eventos
  const handleEventResize = async (info: any) => {
    const event = info.event;
    
    const newEndTime = format(new Date(event.end), 'HH:mm');
    console.log("Redimensionando agendamento:", event.id, { newEndTime });

    try {
      await apiRequest('PUT', `/api/appointments/${event.id}`, {
        endTime: newEndTime
      });

      toast({
        title: "Agendamento atualizado",
        description: "A duração do agendamento foi alterada com sucesso!",
      });

      queryClient.invalidateQueries({ queryKey: ['/api/provider/appointments'] });
    } catch (error) {
      console.error("Erro ao redimensionar agendamento:", error);
      info.revert();
      toast({
        title: "Erro ao alterar duração",
        description: "Não foi possível alterar a duração do agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função auxiliar para calcular o horário de término com base no serviço selecionado
  const calculateEndTime = (startTime: string, serviceDuration: number) => {
    if (!startTime) return "";
    
    try {
      const parsedTime = parse(startTime, 'HH:mm', new Date());
      const endTime = addMinutes(parsedTime, serviceDuration);
      return format(endTime, 'HH:mm');
    } catch (e) {
      console.error("Erro ao calcular horário de término:", e);
      return "";
    }
  };

  // Manipular alteração do serviço selecionado
  const handleServiceChange = (serviceId: string) => {
    form.setValue("service_id", serviceId);
    const startTime = form.getValues("start_time");
    
    if (startTime && serviceId && services) {
      const selectedService = services.find(s => s.id === Number(serviceId));
      if (selectedService) {
        // Atualizar o título do agendamento com o nome do serviço
        if (!form.getValues("title") || isEditMode === false) {
          form.setValue("title", selectedService.name);
        }
        
        // Atualizar horário de término com base na duração do serviço
        if (startTime) {
          const endTime = calculateEndTime(startTime, selectedService.duration);
          form.setValue("end_time", endTime);
        }
      }
    }
  };
  
  // Manipular alteração do cliente selecionado
  const handleClientChange = (clientId: string) => {
    form.setValue("client_id", clientId);
    
    // Se título estiver vazio e um serviço estiver selecionado, atualizar o título
    const serviceId = form.getValues("service_id");
    const title = form.getValues("title");
    
    if ((!title || title === "") && serviceId) {
      const selectedService = services?.find(s => s.id === Number(serviceId));
      if (selectedService) {
        form.setValue("title", selectedService.name);
      }
    }
  };

  // Manipular envio do formulário
  const onSubmit = (data: z.infer<typeof appointmentSchema>) => {
    const selectedService = services?.find(s => s.id === Number(data.service_id));
    
    // Calcular horário de término
    const endTime = calculateEndTime(data.start_time, selectedService?.duration || 60);
    
    if (isEditMode && selectedEvent) {
      updateAppointmentMutation.mutate({
        id: selectedEvent.id,
        ...data,
        endTime: endTime,
      });
    } else {
      createAppointmentMutation.mutate({
        ...data,
        endTime: endTime,
      });
    }
  };

  // Manipular exclusão de agendamento
  const handleDeleteAppointment = () => {
    if (selectedEvent) {
      deleteAppointmentMutation.mutate(selectedEvent.id);
    }
  };

  if (isLoadingAppointments || isLoadingServices || isLoadingClients) {
    return <div className="flex justify-center items-center h-64">Carregando calendário...</div>;
  }
  
  // Função para renderizar o conteúdo do evento personalizado
  const renderEventContent = (eventInfo: any) => {
    const appointment = eventInfo.event;
    const isManual = appointment.extendedProps.isManuallyCreated;
    
    return (
      <div className="flex flex-col w-full overflow-hidden p-1">
        <div className="font-semibold text-xs truncate flex items-center">
          {appointment.title}
          {isManual && (
            <span className="ml-1 text-[8px] py-0 px-1 rounded bg-white/20 text-white border border-white/30">
              Manual
            </span>
          )}
        </div>
        <div className="text-[10px] truncate">
          {appointment.extendedProps.client && (
            <span>Cliente: {appointment.extendedProps.client}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="week">
            <div className="flex justify-between items-center p-4 border-b">
              <TabsList>
                <TabsTrigger value="month">Mês</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="day">Dia</TabsTrigger>
              </TabsList>
              <Button onClick={() => {
                setIsEditMode(false);
                setSelectedEvent(null);
                form.reset({
                  title: "",
                  client_id: "",
                  service_id: "",
                  date: format(new Date(), 'yyyy-MM-dd'),
                  start_time: format(new Date(), 'HH:mm'),
                  notes: "",
                  payment_method: "pix",
                });
                setIsDialogOpen(true);
              }}>
                Novo Agendamento
              </Button>
            </div>
            
            <div className="p-3 bg-muted/20 flex flex-wrap items-center gap-2 text-xs border-b">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#10b981] mr-1"></div>
                <span>Confirmado</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-1"></div>
                <span>Pendente</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#ef4444] mr-1"></div>
                <span>Cancelado</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#38bdf8] mr-1"></div>
                <span>Manual</span>
              </div>
            </div>

            <TabsContent value="month" className="p-0">
              <div className="h-[650px] md:h-[750px]">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  locale={ptBrLocale}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                  }}
                  events={events}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  editable={true}
                  droppable={true}
                  eventDrop={handleEventDrop}
                  eventContent={renderEventContent}
                  height="100%"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="week" className="p-0">
              <div className="h-[650px] md:h-[750px]">
                <FullCalendar
                  plugins={[timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  locale={ptBrLocale}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                  }}
                  events={events}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  editable={true}
                  droppable={true}
                  eventDrop={handleEventDrop}
                  eventResize={handleEventResize}
                  eventContent={renderEventContent}
                  slotDuration="00:30:00"
                  slotLabelInterval="01:00"
                  slotMinTime="07:00:00"
                  slotMaxTime="22:00:00"
                  allDaySlot={false}
                  height="100%"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="day" className="p-0">
              <div className="h-[650px] md:h-[750px]">
                <FullCalendar
                  plugins={[timeGridPlugin, interactionPlugin]}
                  initialView="timeGridDay"
                  locale={ptBrLocale}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                  }}
                  events={events}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  editable={true}
                  droppable={true}
                  eventDrop={handleEventDrop}
                  eventResize={handleEventResize}
                  eventContent={renderEventContent}
                  slotDuration="00:15:00"
                  slotLabelInterval="01:00"
                  slotMinTime="07:00:00"
                  slotMaxTime="22:00:00"
                  allDaySlot={false}
                  height="100%"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Diálogo para criar/editar agendamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Altere os detalhes do agendamento existente."
                : actionDate 
                  ? `Agendamento para ${format(actionDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}`
                  : "Preencha os detalhes para criar um novo agendamento."
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título do agendamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select
                      onValueChange={(value) => handleClientChange(value)}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-primary/30 bg-primary/5">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients && clients.length > 0 ? (
                          clients.map((client) => (
                            <SelectItem 
                              key={client.id} 
                              value={client.id.toString()}
                              className="flex items-center py-2 px-2"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{client.name}</span>
                                <span className="text-xs text-muted-foreground">{client.email}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Nenhum cliente encontrado
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {field.value && clients && 
                        `Cliente selecionado: ${clients.find(c => c.id === Number(field.value))?.name}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço</FormLabel>
                    <Select
                      onValueChange={(value) => handleServiceChange(value)}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-primary/30 bg-primary/5">
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services && services.length > 0 ? (
                          services.map((service) => (
                            <SelectItem 
                              key={service.id} 
                              value={service.id.toString()}
                              className="flex items-center py-2 px-2"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{service.name}</span>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <span className="inline-flex items-center mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {service.duration} min
                                  </span>
                                  <span className="inline-flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    R$ {(service.price / 100).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Nenhum serviço encontrado
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {field.value && services && (
                        <div className="text-xs mt-1">
                          {(() => {
                            const selectedService = services.find(s => s.id === Number(field.value));
                            if (selectedService) {
                              const endTime = calculateEndTime(form.getValues("start_time"), selectedService.duration);
                              return (
                                <span>
                                  Serviço: {selectedService.name} | Duração: {selectedService.duration} min | 
                                  {endTime && ` Término previsto: ${endTime}`}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="border-primary/30 bg-primary/5" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Início</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                          className="border-primary/30 bg-primary/5"
                          onChange={(e) => {
                            field.onChange(e);
                            const startTime = e.target.value;
                            const serviceId = form.getValues("service_id");
                            if (startTime && serviceId && services) {
                              const selectedService = services.find(s => s.id === Number(serviceId));
                              if (selectedService) {
                                const endTime = calculateEndTime(startTime, selectedService.duration);
                                form.setValue("end_time", endTime);
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        {(() => {
                          const startTime = field.value;
                          const serviceId = form.getValues("service_id");
                          if (startTime && serviceId && services) {
                            const selectedService = services.find(s => s.id === Number(serviceId));
                            if (selectedService) {
                              const endTime = calculateEndTime(startTime, selectedService.duration);
                              return (
                                <div className="flex items-center mt-1 text-xs">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Término estimado: <span className="font-medium ml-1">{endTime}</span>
                                </div>
                              );
                            }
                          }
                          return null;
                        })()}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={`
                          ${field.value === 'pix' ? 'border-emerald-400 bg-emerald-50' : ''}
                          ${field.value === 'cartao' ? 'border-blue-400 bg-blue-50' : ''}
                          ${field.value === 'dinheiro' ? 'border-yellow-400 bg-yellow-50' : ''}
                        `}>
                          <SelectValue placeholder="Selecione a forma de pagamento">
                            {field.value && (
                              <div className="flex items-center">
                                {field.value === 'pix' && (
                                  <div className="h-4 w-4 bg-emerald-500 rounded flex items-center justify-center mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  </div>
                                )}
                                {field.value === 'cartao' && (
                                  <div className="h-4 w-4 bg-blue-500 rounded flex items-center justify-center mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                      <line x1="1" y1="10" x2="23" y2="10"></line>
                                    </svg>
                                  </div>
                                )}
                                {field.value === 'dinheiro' && (
                                  <div className="h-4 w-4 bg-yellow-500 rounded flex items-center justify-center mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                      <circle cx="12" cy="12" r="2"></circle>
                                      <path d="M6 12h.01M18 12h.01"></path>
                                    </svg>
                                  </div>
                                )}
                                {field.value === 'pix' ? 'PIX' : 
                                 field.value === 'cartao' ? 'Cartão' : 
                                 field.value === 'dinheiro' ? 'Dinheiro' : field.value}
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pix" className="flex items-center">
                          <div className="flex items-center">
                            <div className="h-4 w-4 bg-emerald-500 rounded flex items-center justify-center mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                            PIX
                          </div>
                        </SelectItem>
                        <SelectItem value="cartao" className="flex items-center">
                          <div className="flex items-center">
                            <div className="h-4 w-4 bg-blue-500 rounded flex items-center justify-center mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                              </svg>
                            </div>
                            Cartão
                          </div>
                        </SelectItem>
                        <SelectItem value="dinheiro" className="flex items-center">
                          <div className="flex items-center">
                            <div className="h-4 w-4 bg-yellow-500 rounded flex items-center justify-center mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                <circle cx="12" cy="12" r="2"></circle>
                                <path d="M6 12h.01M18 12h.01"></path>
                              </svg>
                            </div>
                            Dinheiro
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Status do pagamento para este agendamento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações importantes sobre o agendamento"
                        rows={3}
                        className="border-primary/30 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Adicione notas importantes sobre este agendamento (visível apenas para você)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t mt-6">
                <div className="text-sm text-muted-foreground mb-4">
                  {isEditMode ? (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Editando agendamento existente. As alterações serão aplicadas imediatamente.
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Este agendamento será adicionado à sua agenda. O cliente receberá uma notificação.
                    </div>
                  )}
                </div>
              
                <DialogFooter className="gap-2 sm:gap-0">
                  {isEditMode && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteAppointment}
                      className="flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir
                    </Button>
                  )}
                  <Button type="submit" className="flex items-center gap-2">
                    {isEditMode ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Atualizar Agendamento
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Criar Agendamento
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractiveCalendar;