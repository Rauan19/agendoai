import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageTransition } from '@/components/ui/page-transition';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Map, Search, Calendar, Filter } from 'lucide-react';
import ServiceAvailabilityHeatmap from '@/components/service-availability-heatmap';

export default function ServiceAvailabilityMapPage() {
  const [serviceId, setServiceId] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Buscar serviços para o filtro
  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ['/api/services'],
  });
  
  // Buscar categorias para o filtro
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Buscar localizações de prestadores com filtros aplicados
  const { data: providers = [], isLoading: isProvidersLoading } = useQuery({
    queryKey: ['/api/providers/locations', serviceId, selectedDate?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (serviceId && serviceId !== 'all') {
        params.append('serviceId', serviceId);
      }
      if (selectedDate) {
        params.append('date', selectedDate.toISOString().split('T')[0]);
      }
      
      const url = `/api/providers/locations${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Falha ao buscar localizações dos prestadores');
      }
      return response.json();
    },
    enabled: true,
  });

  return (
    <PageTransition>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold">Mapa de Disponibilidade de Serviços</h1>
          <p className="text-muted-foreground">
            Visualize a disponibilidade de prestadores de serviços por localização.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtros
            </CardTitle>
            <CardDescription>
              Filtre por serviço, categoria ou data para visualizar a disponibilidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service">Serviço</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os serviços</SelectItem>
                    {services.map((service: any) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <DatePicker 
                  date={selectedDate} 
                  onSelect={setSelectedDate}
                  placeholderText="Selecione uma data" 
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  className="w-full"
                  onClick={() => {
                    // Recarregar o mapa com os filtros
                    // Isso é feito automaticamente pelos useQuery
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Map className="mr-2 h-5 w-5" />
              Mapa de Disponibilidade
            </CardTitle>
            <CardDescription>
              As áreas em verde indicam alta disponibilidade, enquanto as áreas em vermelho indicam baixa disponibilidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ServiceAvailabilityHeatmap
              serviceId={serviceId && serviceId !== 'all' ? parseInt(serviceId) : undefined}
              selectedDate={selectedDate}
              initialCenter={[-23.5558, -46.6396]} // São Paulo como padrão
              initialZoom={12}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Alta disponibilidade (75-100%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Média disponibilidade (50-75%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span className="text-sm">Baixa disponibilidade (25-50%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm">Muito baixa disponibilidade (0-25%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo dos Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Prestadores encontrados:</span>
                  <span className="font-semibold">
                    {isProvidersLoading ? 'Carregando...' : providers.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Serviço filtrado:</span>
                  <span className="font-semibold">
                    {serviceId && serviceId !== 'all' ? 'Sim' : 'Todos'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data filtrada:</span>
                  <span className="font-semibold">
                    {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Todas'}
                  </span>
                </div>
                {providers.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      Disponibilidade média: {Math.round(providers.reduce((acc, p) => acc + (p.availability || 0), 0) / providers.length)}%
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}