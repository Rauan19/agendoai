import React from 'react';

const AppointmentsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Agendamentos</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 text-center">
          Esta página exibirá os agendamentos do usuário (clientes verão seus agendamentos, prestadores verão agendamentos recebidos).
        </p>
        <p className="text-gray-500 text-center mt-2 text-sm">
          Funcionalidade será implementada após configuração completa do MongoDB.
        </p>
      </div>
    </div>
  );
};

export default AppointmentsPage;