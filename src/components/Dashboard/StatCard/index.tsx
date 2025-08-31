export default function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="bg-white shadow-sm hover:shadow-md rounded-2xl p-6 flex items-center gap-4 border border-gray-200 
                 transition-transform duration-200 hover:scale-[1.02]"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-700">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
