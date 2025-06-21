import React from 'react';

const ServicesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Serviços</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 text-center">
          Esta página exibirá os serviços disponíveis ou permitirá que prestadores gerenciem seus serviços.
        </p>
        <p className="text-gray-500 text-center mt-2 text-sm">
          Funcionalidade será implementada após configuração completa do MongoDB.
        </p>
      </div>
    </div>
  );
};

export default ServicesPage;