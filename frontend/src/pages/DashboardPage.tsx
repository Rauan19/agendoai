import React from 'react';
import { useAuth } from '../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard - {user?.userType === 'provider' ? 'Prestador' : 'Cliente'}
        </h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo, {user?.name}!
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Agendamentos Hoje</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-gray-500 text-sm">Nenhum agendamento para hoje</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">
            {user?.userType === 'provider' ? 'Serviços Ativos' : 'Agendamentos Futuros'}
          </h3>
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-gray-500 text-sm">
            {user?.userType === 'provider' ? 'Nenhum serviço cadastrado' : 'Nenhum agendamento futuro'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Status da Conta</h3>
          <p className="text-sm text-gray-600">
            Tipo: <span className="font-medium">{user?.userType === 'provider' ? 'Prestador' : 'Cliente'}</span>
          </p>
          <p className="text-sm text-gray-600">
            Verificado: <span className="font-medium">{user?.isVerified ? 'Sim' : 'Não'}</span>
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Próximos Passos</h2>
          {user?.userType === 'provider' ? (
            <div className="space-y-2">
              <p className="text-gray-600">• Configure seus serviços na seção "Serviços"</p>
              <p className="text-gray-600">• Defina sua disponibilidade de horários</p>
              <p className="text-gray-600">• Complete seu perfil profissional</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">• Explore os serviços disponíveis</p>
              <p className="text-gray-600">• Faça seu primeiro agendamento</p>
              <p className="text-gray-600">• Complete seu perfil</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;