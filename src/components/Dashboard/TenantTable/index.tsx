export default function TenantTable({ tenants }: { tenants: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse rounded-2xl shadow-md overflow-hidden">
        <thead>
          <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm uppercase tracking-wide">
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-left">Unit</th>
            <th className="px-6 py-4 text-left">Contact</th>
            <th className="px-6 py-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {tenants.map((tenant, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="px-6 py-4 text-gray-900 font-medium">
                {tenant.name}
              </td>
              <td className="px-6 py-4 text-gray-600">{tenant.unit}</td>
              <td className="px-6 py-4 text-gray-600">{tenant.contact}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    tenant.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {tenant.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
