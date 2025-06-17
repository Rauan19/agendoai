
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AdminLayout } from '@/components/layout/admin-layout';
import { 
  Download, 
  Database, 
  Clock, 
  FileText, 
  Loader2,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BackupInfo {
  backups: string[];
}

export default function BackupPage() {
  const [isCreatingFull, setIsCreatingFull] = useState(false);
  const [isCreatingIncremental, setIsCreatingIncremental] = useState(false);
  const queryClient = useQueryClient();

  // Buscar lista de backups
  const { data: backupData, isLoading } = useQuery<BackupInfo>({
    queryKey: ['admin-backups'],
    queryFn: async () => {
      const response = await fetch('/api/backup/list', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Erro ao carregar backups');
      }
      return response.json();
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Mutation para criar backup completo
  const createFullBackup = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/backup/full', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Erro ao criar backup completo');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Backup Criado",
        description: `Backup completo criado: ${data.filename}`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-backups'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar backup completo",
        variant: "destructive",
      });
    }
  });

  // Mutation para criar backup incremental
  const createIncrementalBackup = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/backup/incremental', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Erro ao criar backup incremental');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Backup Criado",
        description: `Backup incremental criado: ${data.filename}`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-backups'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar backup incremental",
        variant: "destructive",
      });
    }
  });

  const handleCreateFullBackup = async () => {
    setIsCreatingFull(true);
    try {
      await createFullBackup.mutateAsync();
    } finally {
      setIsCreatingFull(false);
    }
  };

  const handleCreateIncrementalBackup = async () => {
    setIsCreatingIncremental(true);
    try {
      await createIncrementalBackup.mutateAsync();
    } finally {
      setIsCreatingIncremental(false);
    }
  };

  const handleDownload = (filename: string) => {
    window.open(`/api/backup/download/${filename}`, '_blank');
  };

  const formatFileSize = (filename: string) => {
    // Estimativa simples baseada no tipo de backup
    if (filename.includes('incremental')) {
      return '~500KB';
    }
    return '~2-5MB';
  };

  const formatDate = (filename: string) => {
    // Extrair timestamp do nome do arquivo
    const match = filename.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
    if (match) {
      const timestamp = match[1].replace(/T/, ' ').replace(/-/g, ':');
      return new Date(timestamp.replace(/:/g, '-').replace(' ', 'T')).toLocaleString('pt-BR');
    }
    return 'Data não disponível';
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Backup do Banco de Dados</h1>
            <p className="text-muted-foreground">
              Gerencie backups do sistema em formato SQL
            </p>
          </div>
        </div>

        {/* Ações de Backup */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup Completo
              </CardTitle>
              <CardDescription>
                Cria um backup completo de todas as tabelas do banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateFullBackup}
                disabled={isCreatingFull}
                className="w-full"
              >
                {isCreatingFull ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando Backup...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Criar Backup Completo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Backup Incremental
              </CardTitle>
              <CardDescription>
                Cria um backup apenas dos dados modificados nas últimas 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateIncrementalBackup}
                disabled={isCreatingIncremental}
                variant="outline"
                className="w-full"
              >
                {isCreatingIncremental ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando Backup...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Criar Backup Incremental
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Lista de Backups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Backups Disponíveis
            </CardTitle>
            <CardDescription>
              Lista de todos os backups criados (arquivos .sql)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : backupData?.backups?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum backup encontrado</p>
                <p className="text-sm">Crie seu primeiro backup usando os botões acima</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backupData?.backups?.map((filename, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{filename}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatDate(filename)}</span>
                          <span>•</span>
                          <span>{formatFileSize(filename)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {filename.includes('incremental') ? (
                        <Badge variant="outline">Incremental</Badge>
                      ) : (
                        <Badge>Completo</Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(filename)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações Importantes */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="h-5 w-5" />
              Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <ul className="space-y-2 text-sm">
              <li>• Os backups são gerados em formato SQL e podem ser executados em qualquer banco compatível</li>
              <li>• Backups completos incluem todas as tabelas: usuários, categorias, serviços, agendamentos e avaliações</li>
              <li>• Backups incrementais incluem apenas dados modificados nas últimas 24 horas</li>
              <li>• Os arquivos são salvos na pasta /backups do servidor</li>
              <li>• Recomenda-se fazer backup completo semanalmente e incremental diariamente</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
