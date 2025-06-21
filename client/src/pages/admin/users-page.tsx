
import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Trash2, Edit, UserPlus, Upload, UserCircle, Check, X, BadgeCheck, BadgeX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

// Schema para validação do formulário de criação de usuário
const userFormSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }).optional(),
  userType: z.string().min(1, { message: "Tipo de usuário é obrigatório" }),
  profileImage: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  document: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  sendPasswordEmail: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  allowNotifications: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UsersPage() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Consulta para carregar todos os usuários
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    staleTime: 10000,
  });

  // Form para criar/editar usuário
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      userType: "",
      phone: "",
      address: "",
      document: "",
      city: "",
      state: "",
      postalCode: "",
      sendPasswordEmail: false,
      isActive: true,
      isVerified: false,
      allowNotifications: true,
    },
  });

  // Mutation para criar usuário
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormValues) => {
      const res = await apiRequest("POST", "/api/admin/users", userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Usuário criado com sucesso",
        variant: "default",
      });
      setIsModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: Partial<UserFormValues> }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Usuário atualizado com sucesso",
        variant: "default",
      });
      setIsModalOpen(false);
      setCurrentUser(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Usuário excluído com sucesso",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });
  
  // Mutation para atualizar status de ativo/inativo
  const toggleActiveStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, { isActive });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: data.isActive ? "Usuário ativado com sucesso" : "Usuário desativado com sucesso",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status do usuário",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });
  
  // Mutation para atualizar status de verificação
  const toggleVerificationStatusMutation = useMutation({
    mutationFn: async ({ id, isVerified }: { id: number; isVerified: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, { isVerified });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: data.isVerified ? "Usuário verificado com sucesso" : "Verificação removida com sucesso",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar verificação do usuário",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // Confirmar exclusão de usuário
  const confirmDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      deleteUserMutation.mutate(id);
    }
  };

  // Abrir modal para visualizar detalhes do usuário
  const openUserDetails = (user: any) => {
    setCurrentUser(user);
    setIsDetailsModalOpen(true);
  };

  // Abrir modal para editar usuário
  const openEditModal = (user: any) => {
    setCurrentUser(user);
    form.reset({
      name: user.name || "",
      email: user.email,
      password: "", // Não preencher senha na edição
      userType: user.userType,
      profileImage: user.profileImage || "",
      phone: user.phone || "",
      address: user.address || "",
      document: user.document || "",
      city: user.city || "",
      state: user.state || "",
      postalCode: user.postalCode || "",
      sendPasswordEmail: false,
      isActive: user.isActive || true,
      isVerified: user.isVerified || false,
      allowNotifications: user.allowNotifications !== false,
    });
    setIsModalOpen(true);
  };

  // Abrir modal para criar novo usuário
  const openCreateModal = () => {
    setCurrentUser(null);
    form.reset({
      name: "",
      email: "",
      password: "",
      userType: "",
      profileImage: "",
      phone: "",
      address: "",
      document: "",
      city: "",
      state: "",
      postalCode: "",
      sendPasswordEmail: false,
      isActive: true,
      isVerified: false,
      allowNotifications: true,
    });
    setIsModalOpen(true);
  };

  // Enviar formulário
  const onSubmit = (values: UserFormValues) => {
    if (currentUser) {
      // Se estiver editando, remover campos que não devem ser atualizados
      const { password, ...updateData } = values;
      if (password && password.length > 0) {
        // Incluir senha apenas se foi preenchida
        updateUserMutation.mutate({ id: currentUser.id, userData: values });
      } else {
        // Atualizar sem a senha
        updateUserMutation.mutate({ id: currentUser.id, userData: updateData });
      }
    } else {
      // Criar novo usuário
      createUserMutation.mutate(values);
    }
  };

  // Filtrar usuários por tipo
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    if (activeTab === "all") return true;
    return user.userType === activeTab;
  }) : [];

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
          <Button onClick={openCreateModal} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
            <UserPlus size={18} />
            Novo Usuário
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>
              Gerenciamento de usuários da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="admin">Administradores</TabsTrigger>
                  <TabsTrigger value="provider">Prestadores</TabsTrigger>
                  <TabsTrigger value="client">Clientes</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verificado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.name || "(Sem nome)"}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.userType === "admin" ? "default" :
                                user.userType === "provider" ? "secondary" :
                                "outline"
                              }
                            >
                              {user.userType === "admin" && "Administrador"}
                              {user.userType === "provider" && "Prestador"}
                              {user.userType === "client" && "Cliente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={user.isActive ? "success" : "destructive"}
                                className={user.isActive 
                                  ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                                }
                              >
                                {user.isActive ? "Ativo" : "Inativo"}
                              </Badge>
                              <Switch
                                checked={user.isActive}
                                onCheckedChange={(checked) => toggleActiveStatusMutation.mutate({ id: user.id, isActive: checked })}
                                className="data-[state=checked]:bg-green-500"
                                disabled={toggleActiveStatusMutation.isPending}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={user.isVerified ? "outline" : "outline"}
                                className={user.isVerified 
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100" 
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                }
                              >
                                {user.isVerified ? "Verificado" : "Não verificado"}
                              </Badge>
                              <Switch
                                checked={user.isVerified}
                                onCheckedChange={(checked) => toggleVerificationStatusMutation.mutate({ id: user.id, isVerified: checked })}
                                className="data-[state=checked]:bg-blue-500"
                                disabled={toggleVerificationStatusMutation.isPending}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openUserDetails(user)}
                                title="Ver detalhes"
                              >
                                <UserCircle size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(user)}
                                title="Editar usuário"
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDelete(user.id)}
                                className="text-destructive"
                                title="Excluir usuário"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Criação/Edição de Usuário */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentUser ? "Editar Usuário" : "Criar Novo Usuário"}</DialogTitle>
              <DialogDescription>
                {currentUser
                  ? "Atualize as informações do usuário conforme necessário."
                  : "Preencha as informações para criar um novo usuário."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{currentUser ? "Nova Senha (deixe em branco para manter a atual)" : "Senha"}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Usuário</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de usuário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="provider">Prestador</SelectItem>
                          <SelectItem value="client">Cliente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Usuário Ativo</FormLabel>
                        <FormDescription>
                          Se desativado, o usuário não poderá acessar o sistema.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Email Verificado</FormLabel>
                        <FormDescription>
                          Se marcado, o usuário não precisará verificar o email.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                    {createUserMutation.isPending || updateUserMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Salvando...
                      </span>
                    ) : currentUser ? (
                      "Atualizar Usuário"
                    ) : (
                      "Criar Usuário"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal de Detalhes do Usuário */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
              <DialogDescription>
                Informações completas sobre o usuário
              </DialogDescription>
            </DialogHeader>
            
            {currentUser && (
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={currentUser.profileImage || ''} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">{currentUser.name || "Sem nome"}</h3>
                    <p className="text-muted-foreground">{currentUser.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        currentUser.userType === "admin" ? "default" :
                        currentUser.userType === "provider" ? "secondary" :
                        "outline"
                      }
                    >
                      {currentUser.userType === "admin" && "Administrador"}
                      {currentUser.userType === "provider" && "Prestador"}
                      {currentUser.userType === "client" && "Cliente"}
                    </Badge>
                    <Badge variant={currentUser.isActive ? "success" : "destructive"}>
                      {currentUser.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    {currentUser.isVerified && (
                      <Badge variant="outline">Verificado</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">ID</h4>
                    <p>{currentUser.id}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Telefone</h4>
                    <p>{currentUser.phone || "Não informado"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Endereço</h4>
                    <p>{currentUser.address || "Não informado"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Data de Cadastro</h4>
                    <p>{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('pt-BR') : "Não informada"}</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDetailsModalOpen(false)}
                  >
                    Fechar
                  </Button>
                  <div className="space-x-2">
                    <Button 
                      variant="default" 
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        openEditModal(currentUser);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        confirmDelete(currentUser.id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
