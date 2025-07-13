export type DateRangeOption =
  | 'hoje'
  | 'ontem'
  | '7dias'
  | '30dias'
  | 'maximo'
  | 'ultimomes';

const options: { label: string; value: DateRangeOption }[] = [
  { label: 'Hoje', value: 'hoje' },
  { label: 'Ontem', value: 'ontem' },
  { label: 'Últimos 7 dias', value: '7dias' },
  { label: 'Últimos 30 dias', value: '30dias' },
  { label: 'Máximo', value: 'maximo' },
  { label: 'Último mês', value: 'ultimomes' },
];

type Props = {
  value: DateRangeOption;
  onChange: (value: DateRangeOption) => void;
};

export default function DateRangeFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 items-center mb-4">
      <span className="font-medium text-gray-700">Período:</span>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`px-3 py-1 rounded-full border text-sm transition-colors ${
            value === opt.value
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
          }`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
} 