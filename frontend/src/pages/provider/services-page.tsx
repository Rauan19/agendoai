
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Pencil, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CalendarClock, 
  DollarSign,
  ChevronRight,
  PlusCircle,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Scissors,
  Star,
  MoreVertical
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import ProviderNavbar from "@/components/layout/provider-navbar";
import { PageTransition } from "@/components/ui/page-transition";
import { motion } from "framer-motion";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProviderServicesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  // Fetch provider services
  const { data: services = [], isLoading: isLoadingServices, refetch } = useQuery({
    queryKey: [`/api/provider-services/provider/${user?.id}`],
    enabled: !!user?.id,
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      const response = await fetch(`/api/provider-services/${serviceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir serviço');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Serviço excluído",
        description: "O serviço foi removido com sucesso.",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: [`/api/provider-services/provider/${user?.id}`] });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o serviço. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Toggle service status mutation
  const toggleServiceMutation = useMutation({
    mutationFn: async ({ serviceId, isActive }: { serviceId: number, isActive: boolean }) => {
      const response = await fetch(`/api/provider-services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar serviço');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "O status do serviço foi alterado com sucesso.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do serviço.",
        variant: "destructive",
      });
    }
  });

  // Filtered services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterActive === "all" || 
                         (filterActive === "active" && service.isActive) ||
                         (filterActive === "inactive" && !service.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleDeleteService = (serviceId: number) => {
    deleteServiceMutation.mutate(serviceId);
  };

  const handleToggleService = (serviceId: number, currentStatus: boolean) => {
    toggleServiceMutation.mutate({ serviceId, isActive: !currentStatus });
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Scissors className="h-8 w-8 mr-3 text-primary" />
                  Meus Serviços
                </h1>
                <p className="text-gray-600 mt-2">Gerencie seus serviços e configurações</p>
              </div>
              <Button 
                onClick={() => setLocation("/provider/add-service")}
                className="bg-primary hover:bg-primary/90 shadow-lg"
                size="lg"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Adicionar Serviço
              </Button>
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-2">Como gerenciar seus serviços</h3>
                <p className="text-gray-700 mb-4">
                  Como prestador, você pode selecionar os tipos de serviços disponíveis na plataforma e personalizá-los com seus próprios preços e durações.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-primary">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Adicione serviços da plataforma
                  </div>
                  <div className="flex items-center text-primary">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Defina seus preços e durações
                  </div>
                  <div className="flex items-center text-primary">
                    <Eye className="h-4 w-4 mr-2" />
                    Ative/desative conforme necessário
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters and Search */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 w-full md:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar serviços..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <select 
                        value={filterActive} 
                        onChange={(e) => setFilterActive(e.target.value as any)}
                        className="border rounded px-3 py-2 text-sm"
                      >
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                      </select>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {filteredServices.length} serviços
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Services Grid/Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-0">
                {isLoadingServices ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando serviços...</p>
                  </div>
                ) : filteredServices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold">Serviço</TableHead>
                          <TableHead className="font-semibold">Categoria</TableHead>
                          <TableHead className="font-semibold">Preço</TableHead>
                          <TableHead className="font-semibold">Duração</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredServices.map((service) => (
                          <TableRow key={service.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Scissors className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold">{service.serviceName}</p>
                                  <p className="text-sm text-gray-500">ID: {service.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{service.categoryName || "Categoria"}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(service.defaultPrice || 0)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                {service.duration || 60} min
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={service.isActive}
                                  onCheckedChange={() => handleToggleService(service.id, service.isActive)}
                                  disabled={toggleServiceMutation.isPending}
                                />
                                <Badge 
                                  variant={service.isActive ? "default" : "secondary"}
                                  className={service.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                                >
                                  {service.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem 
                                        className="text-red-600 focus:text-red-600"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja excluir o serviço "{service.serviceName}"? 
                                          Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleDeleteService(service.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Scissors className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Nenhum serviço encontrado</h3>
                        <p className="text-gray-500 mb-6">
                          {searchTerm || filterActive !== "all" 
                            ? "Tente alterar os filtros de busca."
                            : "Comece adicionando seus primeiros serviços."
                          }
                        </p>
                        <Button 
                          onClick={() => setLocation("/provider/add-service")}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Adicionar Primeiro Serviço
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageTransition>
    </div>
  );
}
