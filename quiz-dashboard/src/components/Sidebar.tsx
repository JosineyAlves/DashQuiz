type ScreenType = 'progress' | 'answers';

type SidebarProps = {
  selected: ScreenType;
  onSelect: (view: ScreenType) => void;
};

export default function Sidebar({ selected, onSelect }: SidebarProps) {
  return (
    <aside className="w-64 bg-white shadow-md h-full p-4">
      <h2 className="text-xl font-bold mb-4">📊 Dashboard</h2>
      <nav className="space-y-2">
        <button
          className={`w-full text-left px-4 py-2 rounded ${
            selected === 'progress' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelect('progress')}
        >
          Passagem por Etapas
        </button>
        <button
          className={`w-full text-left px-4 py-2 rounded ${
            selected === 'answers' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelect('answers')}
        >
          Respostas por Etapa
        </button>
      </nav>
    </aside>
  );
}
