import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let message = res.statusText;
    try {
      // Tenta analisar o texto como JSON para verificar se há uma mensagem de erro personalizada
      const text = await res.text();
      if (text) {
        try {
          const json = JSON.parse(text);
          if (json.message) {
            message = json.message;
          } else if (json.error) {
            message = json.error;
          } else if (typeof json === 'string') {
            message = json;
          } else {
            message = text;
          }
        } catch (e) {
          // Se não for JSON, use o texto como está
          message = text;
        }
      }
    } catch (e) {
      // Mantém o statusText se houver erro ao ler o corpo da resposta
    }
    throw new Error(message);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    console.log(`Fazendo requisição ${method} para ${url}`, data);
    
    // Verificar o estado de autenticação localmente antes da requisição
    const userDataFromCache = queryClient.getQueryData(["/api/user"]);
    console.log(`Estado de autenticação para requisição ${url}:`, 
      userDataFromCache ? "Autenticado" : "Não autenticado");
    
    // Preparar headers com mais detalhes para debug
    const headers = {
      ...(data ? { "Content-Type": "application/json" } : {}),
      "Accept": "application/json", 
      "X-Requested-With": "XMLHttpRequest" // Ajuda a identificar requisições AJAX no servidor
    };
    
    console.log(`Headers da requisição para ${url}:`, headers);
    
    // Adicionar cabeçalhos específicos para CORS e registro detalhado
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Incluir cookies em todas as requisições
      mode: "cors" // Garantir suporte a CORS para requisições cross-origin
    });

    console.log(`Resposta recebida de ${url}:`, { 
      status: res.status, 
      statusText: res.statusText,
      headers: Object.fromEntries([...res.headers.entries()])
    });
    
    // Para requisições 401, tentar refrescar o estado de autenticação
    if (res.status === 401 && url !== "/api/login" && url !== "/api/logout") {
      console.warn(`Requisição ${url} retornou 401 (Não autorizado). Verificando estado de autenticação.`);
    }
    
    // Clonar resposta antes de consumir o corpo
    const clonedRes = res.clone();
    
    if (!res.ok) {
      // Tentar extrair corpo da resposta para detalhes de erro
      try {
        const errorResponse = await res.clone().json();
        console.error(`Detalhes do erro da API ${url}:`, errorResponse);
      } catch (jsonError) {
        try {
          const errorText = await res.clone().text();
          console.error(`Texto do erro da API ${url}:`, errorText);
        } catch (textError) {
          console.error(`Não foi possível extrair detalhes do erro`);
        }
      }
    }
    
    try {
      await throwIfResNotOk(res);
      return clonedRes;
    } catch (error) {
      console.error(`Erro na requisição para ${url}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Erro na conexão com ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log(`Executando query para: ${queryKey[0]}, comportamento em 401: ${unauthorizedBehavior}`);
    
    // Melhorado para incluir headers consistentes com apiRequest
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      },
      // Importante: o método OPTIONS pode ser usado para verificar permissões CORS
      // antes de fazer uma solicitação real
    });

    console.log(`Resposta para ${queryKey[0]}: status=${res.status}, headers=`, 
      Object.fromEntries([...res.headers.entries()]));

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.warn(`Requisição não autorizada para ${queryKey[0]}, retornando null conforme configurado`);
      return null;
    }

    try {
      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Erro processando requisição para ${queryKey[0]}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
