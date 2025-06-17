import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Bem-vindo ao AgendoAI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A plataforma inteligente de agendamento que conecta clientes e prestadores de serviços
            com tecnologia de IA para otimizar horários e maximizar produtividade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Começar Agora
            </Link>
            <Link
              to="/login"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        </div>
        
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Para Clientes</h3>
              <p className="text-gray-600">
                Encontre e agende serviços com facilidade. 
                Sistema inteligente sugere os melhores horários.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Para Prestadores</h3>
              <p className="text-gray-600">
                Gerencie sua agenda com IA. 
                Otimize horários e aumente sua produtividade.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Tecnologia IA</h3>
              <p className="text-gray-600">
                Análise inteligente de padrões para 
                recomendações personalizadas de agendamento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;