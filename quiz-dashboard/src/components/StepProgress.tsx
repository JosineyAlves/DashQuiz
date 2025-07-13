import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import DateRangeFilter from './DateRangeFilter';
import type { DateRangeOption } from './DateRangeFilter';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StepProgress() {
  const [dados, setDados] = useState<any[]>([]);
  const [userUnicos, setUserUnicos] = useState(0);
  const [etapaMaiorSaida, setEtapaMaiorSaida] = useState<number | null>(null);
  const [periodo, setPeriodo] = useState<DateRangeOption>('7dias');

  useEffect(() => {
    async function fetchData() {
      let query = supabase
        .from('quiz_respostas')
        .select('*');

      // Filtro de datas
      const now = new Date();
      let start: Date | null = null;
      let end: Date | null = null;
      if (periodo === 'hoje') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (periodo === 'ontem') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (periodo === '7dias') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (periodo === '30dias') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (periodo === 'ultimomes') {
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        start = firstDayLastMonth;
        end = new Date(lastDayLastMonth.getTime() + 1); // até o fim do último mês
      }
      if (start) query = query.gte('timestamp', start.toISOString());
      if (end) query = query.lt('timestamp', end.toISOString());

      const { data, error } = await query;
      if (!error && data) {
        setDados(data);
        const usuarios = [...new Set(data.map(d => d.user_id))];
        setUserUnicos(usuarios.length);

        // calcular saída por etapa
        const etapas: Record<number, Set<string>> = {};
        data.forEach(({ user_id, step }) => {
          if (!etapas[step]) etapas[step] = new Set();
          etapas[step].add(user_id);
        });

        let maiorDrop = 0;
        let etapaSaida = 0;
        for (let i = 1; i < 24; i++) {
          const atual = etapas[i]?.size || 0;
          const prox = etapas[i + 1]?.size || 0;
          const drop = atual - prox;
          if (drop > maiorDrop) {
            maiorDrop = drop;
            etapaSaida = i;
          }
        }
        setEtapaMaiorSaida(etapaSaida);
      }
    }
    fetchData();
  }, [periodo]);

  const etapasPassos: Record<number, Set<string>> = {};
  dados.forEach(({ step, user_id }) => {
    if (!etapasPassos[step]) etapasPassos[step] = new Set();
    etapasPassos[step].add(user_id);
  });

  const labels = Array.from({ length: 24 }, (_, i) => `Etapa ${i + 1}`);
  const dadosGrafico = {
    labels,
    datasets: [
      {
        label: '% de usuários que chegaram',
        data: labels.map((_, i) => {
          const etapa = i + 1;
          const total = etapasPassos[etapa]?.size || 0;
          return userUnicos > 0 ? ((total / userUnicos) * 100).toFixed(1) : 0;
        }),
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
    ],
  };

  const opcoes = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.raw}%`
        }
      },
      title: {
        display: true,
        text: 'Porcentagem de Usuários por Etapa',
        font: {
          size: 18
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        ticks: {
          callback: function (tickValue: string | number | undefined) {
            return `${tickValue}%`;
          },
        },
        grid: {
          color: '#e5e7eb'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const taxaConclusao = etapasPassos[24]?.size || 0;

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen space-y-8">
      <DateRangeFilter value={periodo} onChange={setPeriodo} />
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        📊 Progresso por Etapa
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow border text-center">
          <div className="text-3xl font-bold text-indigo-600">{userUnicos}</div>
          <div className="text-gray-600 mt-1 text-sm">Usuários únicos</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border text-center">
          <div className="text-3xl font-bold text-green-600">
            {userUnicos > 0 ? ((taxaConclusao / userUnicos) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-gray-600 mt-1 text-sm">Taxa de Conclusão</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border text-center">
          <div className="text-3xl font-bold text-red-600">{etapaMaiorSaida || '-'}</div>
          <div className="text-gray-600 mt-1 text-sm">Maior Saída</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border w-full overflow-hidden">
        <Bar data={dadosGrafico} options={opcoes} />
      </div>
    </div>
  );
}

export default StepProgress;
