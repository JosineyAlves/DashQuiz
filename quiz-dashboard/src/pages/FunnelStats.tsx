// src/pages/FunnelStats.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import {
  Bar,
  Line,
  Pie,
} from 'react-chartjs-2';
import 'chart.js/auto';

export default function FunnelStats() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('quiz_respostas')
        .select('*')
        .order('timestamp', { ascending: true });
      if (error) console.error(error);
      else setData(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <p className="p-4">Carregando...</p>;

  const stepMap = new Map<number, number>();
  const answerMap = new Map<string, number>();
  const utmMap = new Map<string, number>();
  const stepTimeMap = new Map<number, number[]>();
  const dailyMap = new Map<string, number>();
  const userSteps: { [user_id: string]: { step: number; timestamp: number }[] } = {};

  data.forEach((row) => {
    const step = Number(row.step);
    const user = row.user_id;
    const answer = row.answer;
    const utm = row.utm_source || 'direct';
    const time = new Date(row.timestamp).getTime();
    const date = new Date(row.timestamp).toISOString().split('T')[0];

    stepMap.set(step, (stepMap.get(step) || 0) + 1);
    answerMap.set(`${step}-${answer}`, (answerMap.get(`${step}-${answer}`) || 0) + 1);
    utmMap.set(utm, (utmMap.get(utm) || 0) + 1);
    dailyMap.set(date, (dailyMap.get(date) || 0) + 1);

    if (!userSteps[user]) userSteps[user] = [];
    userSteps[user].push({ step, timestamp: time });
  });

  Object.values(userSteps).forEach((steps) => {
    const sorted = steps.sort((a, b) => a.step - b.step);
    for (let i = 1; i < sorted.length; i++) {
      const step = sorted[i].step;
      const diff = sorted[i].timestamp - sorted[i - 1].timestamp;
      if (!stepTimeMap.has(step)) stepTimeMap.set(step, []);
      stepTimeMap.get(step)?.push(diff);
    }
  });

  const steps = Array.from(stepMap.keys()).sort((a, b) => a - b);
  const heatMapData = steps.map((step) => stepMap.get(step) || 0);
  const maxCount = Math.max(...heatMapData);

  const stepTimeAvg = steps.map((step) => {
    const times = stepTimeMap.get(step) || [];
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length / 1000) : 0;
    return avg;
  });

  return (
    <div className="p-4 space-y-8">
      <h2 className="text-xl font-bold">📉 Mapa de Calor de Desistência</h2>
      <Bar
        data={{
          labels: steps.map((s) => `Etapa ${s}`),
          datasets: [
            {
              label: 'Usuários por etapa',
              data: heatMapData,
              backgroundColor: heatMapData.map((v) => `rgba(255, 0, 0, ${v / maxCount})`),
            },
          ],
        }}
      />

      <h2 className="text-xl font-bold">📊 Cliques por Opção</h2>
      <Bar
        data={{
          labels: Array.from(answerMap.keys()),
          datasets: [
            {
              label: 'Total de cliques',
              data: Array.from(answerMap.values()),
            },
          ],
        }}
      />

      <h2 className="text-xl font-bold">🌍 Distribuição por UTM Source</h2>
      <Pie
        data={{
          labels: Array.from(utmMap.keys()),
          datasets: [
            {
              data: Array.from(utmMap.values()),
            },
          ],
        }}
      />

      <h2 className="text-xl font-bold">⏱ Tempo Médio por Etapa (s)</h2>
      <Bar
        data={{
          labels: steps.map((s) => `Etapa ${s}`),
          datasets: [
            {
              label: 'Tempo médio (s)',
              data: stepTimeAvg,
            },
          ],
        }}
      />

      <h2 className="text-xl font-bold">📅 Evolução Diária</h2>
      <Line
        data={{
          labels: Array.from(dailyMap.keys()).sort(),
          datasets: [
            {
              label: 'Usuários únicos por dia',
              data: Array.from(dailyMap.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([, v]) => v),
            },
          ],
        }}
      />
    </div>
  );
}
