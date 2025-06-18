
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  AlertCircle, 
  Search, 
  Filter,
  ChevronRight,
  ArrowLeft,
  Plus,
  Check,
  Scissors,
  Clock,
  DollarSign,
  Settings
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProviderNavbar from "@/components/layout/provider-navbar";
import { PageTransition } from "@/components/ui/page-transition";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AddServicePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [step, setStep] = useState<'search' | 'select' | 'price' | 'duration' | 'save'>('search');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [price, setPrice] = useState<string>("");
  const [duration, setDuration] = useState<string>("60");
  const [executionTime, setExecutionTime] = useState<string>("60");
  const [breakTime, setBreakTime] = useState<string>("0");
  const [description, setDescription] = useState<string>("");

  const { data: niches } = useQuery({
    queryKey: ["/api/niches"],
  });

  // Filtrar apenas nichos com ID válido
  const validNiches = niches?.filter(niche => niche.id) || [];

  // Fetch categories based on selected niche
  const { data: categories = [], isLoading: isLoadingCategories, error: categoriesError } = useQuery({
    queryKey: ['/api/categories', selectedNiche],
    enabled: !!selectedNiche,
    queryFn: async () => {
      const response = await fetch(`/api/categories${selectedNiche ? `?nicheId=${selectedNiche}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const allCategories = await response.json();
      // Filtrar categorias pelo nicho selecionado se especificado
      if (selectedNiche && selectedNiche !== "all") {
        return allCategories.filter((cat: any) => cat.nicheId === parseInt(selectedNiche));
      }
      return allCategories;
    },
  });

  // Fetch existing provider services to avoid duplicates
  const { data: existingProviderServices = [] } = useQuery({
    queryKey: [`/api/provider-services/provider/${user?.id}`],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/provider-services/provider/${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch provider services');
      }
      return response.json();
    }
  });

  // Fetch available services from services table (admin created)
  const { data: availableServices = [], isLoading: isLoadingServices, error: servicesError } = useQuery({
    queryKey: ['/api/services', 'available', searchTerm, selectedNiche, selectedCategory, existingProviderServices?.length],
    queryFn: async () => {
      try {
        console.log('Buscando serviços disponíveis...');
        
        // Buscar todos os serviços da tabela services
        const servicesResponse = await fetch('/api/services');
        if (!servicesResponse.ok) {
          throw new Error('Failed to fetch services');
        }
        let allServices = await servicesResponse.json();
        console.log('Serviços encontrados na API:', allServices.length, allServices);

        // Buscar todas as categorias para enriquecer os dados
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const allCategories = await categoriesResponse.json();

        // Buscar todos os nichos
        const nichesResponse = await fetch('/api/niches');
        if (!nichesResponse.ok) {
          throw new Error('Failed to fetch niches');
        }
        const allNiches = await nichesResponse.json();

        // Na tabela services, TODOS os serviços são criados pelo admin
        // Não precisamos filtrar por providerId aqui
        const adminServices = allServices;
        
        console.log('Serviços do admin filtrados:', adminServices.length, adminServices);

        // Enriquecer serviços com informações de categoria e nicho
        let enrichedServices = adminServices.map((service: any) => {
          const category = allCategories.find((cat: any) => cat.id === service.categoryId);
          const niche = category ? allNiches.find((n: any) => n.id === category.nicheId) : null;

          return {
            ...service,
            categoryName: category?.name || 'Categoria não encontrada',
            nicheName: niche?.name || 'Nicho não encontrado',
            nicheId: category?.nicheId || null
          };
        });

        // Aplicar filtros
        if (searchTerm && searchTerm.trim()) {
          enrichedServices = enrichedServices.filter((service: any) =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        if (selectedCategory && selectedCategory !== "all") {
          enrichedServices = enrichedServices.filter((service: any) => 
            service.categoryId === parseInt(selectedCategory)
          );
        }

        if (selectedNiche && selectedNiche !== "all") {
          enrichedServices = enrichedServices.filter((service: any) => 
            service.nicheId === parseInt(selectedNiche)
          );
        }

        // Filtrar serviços que já não estão sendo oferecidos pelo prestador
        const existingServiceIds = new Set(existingProviderServices?.map((ps: any) => ps.serviceId) || []);
        console.log('Serviços já oferecidos pelo prestador:', Array.from(existingServiceIds));
        
        const filteredServices = enrichedServices.filter((service: any) => {
          const isNotAlreadyOffered = !existingServiceIds.has(service.id);
          const isActive = service.isActive !== false;
          return isNotAlreadyOffered && isActive;
        });

        console.log('Serviços filtrados finais:', filteredServices.length, filteredServices);
        return filteredServices;
      } catch (error) {
        console.error('Error fetching services:', error);
        return [];
      }
    },
  });

  // Create provider service mutation
  const createProviderServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const response = await fetch('/api/provider-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error creating provider service:", errorText);
        throw new Error(`Failed to create provider service: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Serviço adicionado com sucesso!",
        description: "O serviço foi adicionado ao seu catálogo.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/provider-services'] });
      queryClient.invalidateQueries({ queryKey: [`/api/provider-services/provider/${user?.id}`] });
      navigate("/provider/services");
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar serviço",
        description: "Ocorreu um erro ao adicionar o serviço. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSelectService = (service: any) => {
    setSelectedService(service);
    setDescription(service.description || "");
    setDuration(service.duration?.toString() || "60");
    setExecutionTime(service.duration?.toString() || "60");
    // Se o serviço já tem preço, converte de centavos para reais, senão usa 50 como padrão
    const defaultPrice = service.price && service.price > 0 ? (service.price / 100) : 50;
    setPrice(defaultPrice.toString());
    setStep('price');
  };

  const handleSaveService = () => {
    if (!selectedService || !price || !duration || !executionTime) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    const serviceData = {
      providerId: user.id,
      serviceId: selectedService.id,
      price: Math.round(parseFloat(price) * 100), // Converter para centavos
      duration: parseInt(duration),
      executionTime: parseInt(executionTime),
      breakTime: breakTime ? parseInt(breakTime) : 0,
      description: description || selectedService.description,
      isActive: true,
    };

    createProviderServiceMutation.mutate(serviceData);
  };

  const goBack = () => {
    if (step === 'select') setStep('search');
    if (step === 'price') setStep('select');
    if (step === 'duration') setStep('price');
    if (step === 'save') setStep('duration');
  };

  const goNext = () => {
    if (step === 'price') {
      if (!price) {
        toast({
          title: "Preço não definido",
          description: "Por favor, defina o preço do serviço.",
          variant: "destructive",
        });
        return;
      }
      setStep('duration');
    } 
    else if (step === 'duration') {
      if (!duration || !executionTime) {
        toast({
          title: "Duração não definida",
          description: "Por favor, defina a duração total e o tempo de execução do serviço.",
          variant: "destructive",
        });
        return;
      }
      setStep('save');
    }
  };

  // Verificar se há erros críticos
  const hasErrors = categoriesError || servicesError;

  if (hasErrors) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProviderNavbar />
        <PageTransition>
          <div className="container mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/provider/services")}
                  className="mr-3"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Plus className="h-8 w-8 mr-3 text-primary" />
                  Adicionar Novo Serviço
                </h1>
              </div>
              
              <Alert variant="destructive" className="shadow-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar dados necessários. Por favor, tente recarregar a página.
                </AlertDescription>
              </Alert>
            </motion.div>
          </div>
        </PageTransition>
      </div>
    );
  }

  const stepComponents = {
    search: (
      <motion.div
        key="search"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Buscar Serviços</CardTitle>
                <CardDescription>
                  Encontre serviços disponíveis para adicionar ao seu catálogo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Filtros */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-primary" />
                  Filtros de Busca
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="niche">Nicho</Label>
                    <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                      <SelectTrigger id="niche">
                        <SelectValue placeholder="Selecione um nicho" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os nichos</SelectItem>
                        {validNiches?.filter((niche) => niche.id && niche.id.toString()).map((niche) => (
                          <SelectItem key={niche.id} value={niche.id.toString()}>
                            {niche.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select 
                      value={selectedCategory} 
                      onValueChange={setSelectedCategory}
                      disabled={!selectedNiche || isLoadingCategories}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {Array.isArray(categories) && categories.filter((category: any) => category.id && category.id.toString()).map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="search">Buscar por nome</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Digite para buscar serviços..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Debug Info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="p-3 bg-gray-100 rounded text-sm border">
                  <p><strong>Debug Info:</strong></p>
                  <p>Total serviços encontrados: {availableServices?.length || 0}</p>
                  <p>Serviços já oferecidos: {existingProviderServices?.length || 0}</p>
                  <p>Filtros ativos: Nicho={selectedNiche || 'nenhum'}, Categoria={selectedCategory || 'nenhuma'}, Busca={searchTerm || 'nenhuma'}</p>
                </div>
              )}

              {/* Resultados */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Serviços disponíveis</h3>
                  <Badge variant="outline" className="text-sm">
                    {availableServices?.length || 0} encontrados
                  </Badge>
                </div>
                
                {isLoadingServices ? (
                  <div className="flex justify-center p-8">
                    <div className="flex flex-col items-center space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-gray-600">Buscando serviços...</p>
                    </div>
                  </div>
                ) : availableServices?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableServices.map((service: any) => (
                      <Card 
                        key={service.id} 
                        className="cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50"
                        onClick={() => {
                          setSelectedService(service);
                          setStep('select');
                        }}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {service.categoryName}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {service.description || "Sem descrição"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              {service.duration || 60} min
                            </div>
                            {service.nicheName && (
                              <Badge variant="secondary" className="text-xs">
                                {service.nicheName}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Scissors className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Nenhum serviço encontrado</h3>
                        <p className="text-gray-500">
                          {existingProviderServices.length > 0 
                            ? "Você já oferece todos os serviços disponíveis nesta categoria."
                            : "Tente outros filtros ou termos de busca."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ),

    select: (
      <motion.div
        key="select"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Confirmar Serviço</CardTitle>
                <CardDescription>
                  Confirme se este é o serviço que deseja adicionar ao seu catálogo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-bold text-primary mb-2">{selectedService?.name}</h3>
                <p className="text-gray-700 mb-4">{selectedService?.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-medium">Duração padrão:</span>
                      <p className="text-sm text-gray-600">{selectedService?.duration || 60} minutos</p>
                    </div>
                  </div>
                  {selectedService?.categoryName && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-primary border-primary">
                        {selectedService.categoryName}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goBack} className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={() => handleSelectService(selectedService)} className="flex items-center">
                  Continuar
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ),

    price: (
      <motion.div
        key="price"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Definir Preço</CardTitle>
                <CardDescription>
                  Defina o preço que você cobrará por este serviço
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <Label htmlFor="service-name" className="text-sm font-medium text-gray-600">Nome do Serviço</Label>
                <p className="text-xl font-bold text-gray-900">{selectedService?.name}</p>
              </div>

              <div>
                <Label htmlFor="price" className="block mb-3 text-lg font-medium">Preço (R$)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-10 text-lg h-12"
                  />
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Defina o valor que será cobrado do cliente por este serviço.</strong>
                  </p>
                  <div className="text-xs text-blue-600 space-y-1">
                    <p>• Uma taxa de serviço será aplicada conforme configurado no sistema</p>
                    <p>• Esta taxa é deduzida do valor total ao processar pagamentos</p>
                    <p>• O valor deve ser competitivo com o mercado local</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goBack} className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={goNext} className="flex items-center">
                  Continuar
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ),

    duration: (
      <motion.div
        key="duration"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Definir Duração</CardTitle>
                <CardDescription>
                  Configure os tempos do seu serviço
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="duration" className="block mb-3 font-medium">Duração Total (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-11"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Tempo total que o serviço ocupa na sua agenda.
                  </p>
                </div>

                <div>
                  <Label htmlFor="executionTime" className="block mb-3 font-medium">Tempo de Execução (minutos)</Label>
                  <Input
                    id="executionTime"
                    type="number"
                    placeholder="60"
                    min="1"
                    value={executionTime}
                    onChange={(e) => setExecutionTime(e.target.value)}
                    className="h-11"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Tempo efetivo que você gasta realizando o serviço.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="breakTime" className="block mb-3 font-medium">Tempo de Intervalo (minutos)</Label>
                <Input
                  id="breakTime"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={breakTime}
                  onChange={(e) => setBreakTime(e.target.value)}
                  className="h-11"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Tempo de pausa necessário após este serviço (opcional).
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goBack} className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={goNext} className="flex items-center">
                  Continuar
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ),

    save: (
      <motion.div
        key="save"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Revisar e Salvar</CardTitle>
                <CardDescription>
                  Confirme os detalhes e adicione o serviço ao seu catálogo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-bold text-primary mb-4">{selectedService?.name}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div>
                      <span className="font-medium text-gray-600">Preço:</span>
                      <p className="text-xl font-bold text-green-600">R$ {parseFloat(price).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <div>
                      <span className="font-medium text-gray-600">Duração Total:</span>
                      <p className="text-xl font-bold text-blue-600">{duration} min</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div>
                      <span className="font-medium text-gray-600">Tempo de Execução:</span>
                      <p className="text-xl font-bold text-orange-600">{executionTime} min</p>
                    </div>
                  </div>
                  {breakTime && parseInt(breakTime) > 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Clock className="h-8 w-8 text-purple-600" />
                      <div>
                        <span className="font-medium text-gray-600">Tempo de Intervalo:</span>
                        <p className="text-xl font-bold text-purple-600">{breakTime} min</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="block mb-3 font-medium">Descrição personalizada (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva detalhes específicos do seu serviço..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Deixe em branco para usar a descrição padrão do serviço.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goBack} className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleSaveService}
                  disabled={createProviderServiceMutation.isPending}
                  className="flex items-center bg-primary hover:bg-primary/90"
                >
                  {createProviderServiceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Serviço
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProviderNavbar />
      
      <PageTransition>
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/provider/services")}
                className="mr-3 hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Plus className="h-8 w-8 mr-3 text-primary" />
                Adicionar Novo Serviço
              </h1>
            </div>
            
            {/* Breadcrumb / Progress */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="hover:text-primary cursor-pointer" onClick={() => navigate("/provider/services")}>
                Meus Serviços
              </span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-primary font-medium">Adicionar Serviço</span>
            </div>
          </motion.div>

          {/* Step Indicator */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white shadow-sm border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {[
                    { key: 'search', label: 'Buscar', icon: Search },
                    { key: 'select', label: 'Selecionar', icon: Check },
                    { key: 'price', label: 'Preço', icon: DollarSign },
                    { key: 'duration', label: 'Duração', icon: Clock },
                    { key: 'save', label: 'Finalizar', icon: Settings }
                  ].map((stepItem, index) => {
                    const Icon = stepItem.icon;
                    const isActive = step === stepItem.key;
                    const isCompleted = ['search', 'select', 'price', 'duration'].indexOf(stepItem.key) < ['search', 'select', 'price', 'duration'].indexOf(step);
                    
                    return (
                      <div key={stepItem.key} className="flex items-center">
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive ? 'bg-primary text-white' : 
                          isCompleted ? 'bg-green-100 text-green-700' : 
                          'bg-gray-100 text-gray-500'
                        }`}>
                          <Icon className="h-4 w-4" />
                          <span className="font-medium text-sm">{stepItem.label}</span>
                        </div>
                        {index < 4 && (
                          <ChevronRight className={`h-4 w-4 mx-2 ${
                            isCompleted || isActive ? 'text-primary' : 'text-gray-300'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {stepComponents[step]}
          </motion.div>
        </div>
      </PageTransition>
    </div>
  );
}
