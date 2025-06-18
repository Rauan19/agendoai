
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ClientLayout from "@/components/layout/client-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Clock, Star, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface Provider {
  id: number;
  name: string;
  email: string;
  profileImage: string;
  phone: string;
  address: string;
  rating: number;
  services: Array<{
    id: number;
    name: string;
    price: number;
    duration: number;
  }>;
}

export default function ServiceSearchNewPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [, navigate] = useLocation();

  // Buscar categorias
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => apiRequest("/api/categories"),
  });

  // Buscar prestadores
  const { data: providersData, isLoading } = useQuery({
    queryKey: ["/api/providers", searchTerm, selectedCategory],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("categoryId", selectedCategory.toString());
      return apiRequest(`/api/providers?${params.toString()}`);
    },
  });

  const providers = providersData?.providers || [];

  const handleBookService = (providerId: number, serviceId: number) => {
    navigate(`/client/new-booking?providerId=${providerId}&serviceId=${serviceId}`);
  };

  return (
    <ClientLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Buscar Serviços</h1>
          <p className="text-muted-foreground">
            Encontre os melhores prestadores para seus serviços
          </p>
        </div>

        {/* Barra de busca */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por serviço ou prestador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="md:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filtros por categoria */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Todas
          </Button>
          {categories.map((category: any) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Lista de prestadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : providers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Nenhum prestador encontrado</p>
            </div>
          ) : (
            providers.map((provider: Provider) => (
              <Card key={provider.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <img
                      src={provider.profileImage || "/uploads/profiles/default.png"}
                      alt={provider.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">
                          {provider.rating || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {provider.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{provider.address}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Serviços:</h4>
                    {provider.services?.slice(0, 3).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{service.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{service.duration}min</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            R$ {(service.price / 100).toFixed(2)}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleBookService(provider.id, service.id)}
                          >
                            Agendar
                          </Button>
                        </div>
                      </div>
                    ))}
                    {provider.services?.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{provider.services.length - 3} serviços
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
