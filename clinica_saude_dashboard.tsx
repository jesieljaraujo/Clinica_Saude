import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, Activity, Users, Calendar, TrendingUp, DollarSign } from 'lucide-react';

// Componente principal do dashboard
const DashboardClinica = () => {
  // Estado para armazenar os dados carregados
  const [dados, setDados] = useState(null);
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('Todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState('Todos');

  // Dados de exemplo da clínica (simulando um CSV carregado)
  const dadosExemplo = [
    { data: '2024-01', paciente: 'Maria Silva', idade: 45, especialidade: 'Cardiologia', valor: 350, status: 'Concluído' },
    { data: '2024-01', paciente: 'João Santos', idade: 32, especialidade: 'Ortopedia', valor: 280, status: 'Concluído' },
    { data: '2024-01', paciente: 'Ana Costa', idade: 28, especialidade: 'Dermatologia', valor: 200, status: 'Concluído' },
    { data: '2024-02', paciente: 'Pedro Lima', idade: 55, especialidade: 'Cardiologia', valor: 350, status: 'Concluído' },
    { data: '2024-02', paciente: 'Julia Mendes', idade: 41, especialidade: 'Ginecologia', valor: 300, status: 'Concluído' },
    { data: '2024-02', paciente: 'Carlos Souza', idade: 38, especialidade: 'Ortopedia', valor: 280, status: 'Agendado' },
    { data: '2024-03', paciente: 'Beatriz Alves', idade: 50, especialidade: 'Cardiologia', valor: 350, status: 'Concluído' },
    { data: '2024-03', paciente: 'Ricardo Dias', idade: 29, especialidade: 'Dermatologia', valor: 200, status: 'Concluído' },
    { data: '2024-03', paciente: 'Fernanda Rocha', idade: 35, especialidade: 'Ginecologia', valor: 300, status: 'Concluído' },
    { data: '2024-03', paciente: 'Lucas Martins', idade: 44, especialidade: 'Ortopedia', valor: 280, status: 'Cancelado' },
  ];

  // Função para processar o arquivo CSV carregado
  const processarArquivo = (evento) => {
    const arquivo = evento.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onload = (e) => {
        const texto = e.target.result;
        const linhas = texto.split('\n');
        const dadosProcessados = [];
        
        // Processar cada linha do CSV (pulando o cabeçalho)
        for (let i = 1; i < linhas.length; i++) {
          if (linhas[i].trim()) {
            const colunas = linhas[i].split(',');
            dadosProcessados.push({
              data: colunas[0]?.trim(),
              paciente: colunas[1]?.trim(),
              idade: parseInt(colunas[2]) || 0,
              especialidade: colunas[3]?.trim(),
              valor: parseFloat(colunas[4]) || 0,
              status: colunas[5]?.trim()
            });
          }
        }
        setDados(dadosProcessados);
      };
      leitor.readAsText(arquivo);
    }
  };

  // Usar dados de exemplo se nenhum arquivo foi carregado
  const dadosAtivos = dados || dadosExemplo;

  // Filtrar dados baseado nas seleções do usuário
  const dadosFiltrados = useMemo(() => {
    return dadosAtivos.filter(item => {
      const filtroEsp = filtroEspecialidade === 'Todas' || item.especialidade === filtroEspecialidade;
      const filtroPer = filtroPeriodo === 'Todos' || item.data === filtroPeriodo;
      return filtroEsp && filtroPer;
    });
  }, [dadosAtivos, filtroEspecialidade, filtroPeriodo]);

  // Calcular métricas principais
  const metricas = useMemo(() => {
    const totalConsultas = dadosFiltrados.length;
    const receitaTotal = dadosFiltrados.reduce((soma, item) => soma + item.valor, 0);
    const idadeMedia = dadosFiltrados.reduce((soma, item) => soma + item.idade, 0) / totalConsultas || 0;
    const taxaConclusao = (dadosFiltrados.filter(item => item.status === 'Concluído').length / totalConsultas * 100) || 0;
    
    return { totalConsultas, receitaTotal, idadeMedia, taxaConclusao };
  }, [dadosFiltrados]);

  // Preparar dados para gráfico de receita por mês
  const dadosReceitaMensal = useMemo(() => {
    const agrupado = {};
    dadosFiltrados.forEach(item => {
      if (!agrupado[item.data]) {
        agrupado[item.data] = { mes: item.data, receita: 0, consultas: 0 };
      }
      agrupado[item.data].receita += item.valor;
      agrupado[item.data].consultas += 1;
    });
    return Object.values(agrupado).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [dadosFiltrados]);

  // Preparar dados para gráfico de especialidades
  const dadosEspecialidades = useMemo(() => {
    const agrupado = {};
    dadosFiltrados.forEach(item => {
      if (!agrupado[item.especialidade]) {
        agrupado[item.especialidade] = { nome: item.especialidade, valor: 0 };
      }
      agrupado[item.especialidade].valor += 1;
    });
    return Object.values(agrupado);
  }, [dadosFiltrados]);

  // Preparar dados para gráfico de distribuição de idade
  const dadosIdade = useMemo(() => {
    const faixas = {
      '18-30': 0,
      '31-45': 0,
      '46-60': 0,
      '60+': 0
    };
    dadosFiltrados.forEach(item => {
      if (item.idade <= 30) faixas['18-30']++;
      else if (item.idade <= 45) faixas['31-45']++;
      else if (item.idade <= 60) faixas['46-60']++;
      else faixas['60+']++;
    });
    return Object.entries(faixas).map(([faixa, quantidade]) => ({ faixa, quantidade }));
  }, [dadosFiltrados]);

  // Obter lista única de especialidades e períodos para os filtros
  const especialidades = ['Todas', ...new Set(dadosAtivos.map(item => item.especialidade))];
  const periodos = ['Todos', ...new Set(dadosAtivos.map(item => item.data))].sort();

  // Cores para os gráficos
  const CORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Activity className="text-blue-600" size={36} />
                Dashboard - Clínica de Saúde
              </h1>
              <p className="text-gray-600 mt-2">Análise de consultas e desempenho da clínica</p>
            </div>
            
            {/* Botão para upload de arquivo CSV */}
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
              <Upload size={20} />
              <span>Carregar CSV</span>
              <input type="file" accept=".csv" onChange={processarArquivo} className="hidden" />
            </label>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade</label>
              <select 
                value={filtroEspecialidade}
                onChange={(e) => setFiltroEspecialidade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {especialidades.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select 
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {periodos.map(per => (
                  <option key={per} value={per}>{per}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cards de métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Consultas</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{metricas.totalConsultas}</p>
              </div>
              <Calendar className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Receita Total</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  R$ {metricas.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="text-green-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Idade Média</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{metricas.idadeMedia.toFixed(0)} anos</p>
              </div>
              <Users className="text-purple-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{metricas.taxaConclusao.toFixed(1)}%</p>
              </div>
              <TrendingUp className="text-blue-600" size={40} />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Receita Mensal */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Receita Mensal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosReceitaMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="receita" stroke="#3b82f6" strokeWidth={2} name="Receita (R$)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Consultas por Especialidade */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Consultas por Especialidade</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosEspecialidades}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="valor" fill="#10b981" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Distribuição de Idade */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Distribuição de Idade dos Pacientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosIdade}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ faixa, quantidade }) => `${faixa}: ${quantidade}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="quantidade"
              >
                {dadosIdade.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Rodapé com instruções */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Como usar</h3>
          <ul className="text-gray-600 space-y-2">
            <li>• O dashboard mostra dados de exemplo automaticamente</li>
            <li>• Clique em "Carregar CSV" para importar seus próprios dados</li>
            <li>• Formato do CSV: data,paciente,idade,especialidade,valor,status</li>
            <li>• Use os filtros para analisar especialidades e períodos específicos</li>
            <li>• Os gráficos são interativos - passe o mouse para ver detalhes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardClinica;