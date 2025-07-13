import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import DateRangeFilter from './DateRangeFilter';
import type { DateRangeOption } from './DateRangeFilter';

function AnswerAnalytics() {
  const [dados, setDados] = useState<any[]>([]);
  const [periodo, setPeriodo] = useState<DateRangeOption>('7dias');

  useEffect(() => {
    async function fetchData() {
      let query = supabase
        .from('quiz_respostas')
        .select('*')
        .order('step', { ascending: true });

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
        end = new Date(lastDayLastMonth.getTime() + 1);
      }
      if (start) query = query.gte('timestamp', start.toISOString());
      if (end) query = query.lt('timestamp', end.toISOString());

      const { data, error } = await query;
      if (!error) setDados(data);
    }
    fetchData();
  }, [periodo]);

  const respostasPorEtapa: Record<number, Record<string, number>> = {};

  dados.forEach(({ step, answer }) => {
    if (!respostasPorEtapa[step]) respostasPorEtapa[step] = {};
    respostasPorEtapa[step][answer] = (respostasPorEtapa[step][answer] || 0) + 1;
  });

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <DateRangeFilter value={periodo} onChange={setPeriodo} />
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        📋 Respostas por Etapa
      </h2>
      <div className="space-y-8">
        {Object.entries(respostasPorEtapa).map(([step, respostas]) => (
          <div key={step} className="bg-white p-6 rounded-2xl shadow border">
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">
              Etapa {step}
            </h3>
            <ul className="space-y-2">
              {Object.entries(respostas).map(([resposta, qtd]) => (
                <li
                  key={resposta}
                  className="flex justify-between border-b border-gray-100 pb-1 text-sm text-gray-700"
                >
                  <span className="font-medium">{resposta}</span>
                  <span>{qtd} cliques</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnswerAnalytics;
