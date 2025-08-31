import { Users, Home, Calendar, DollarSign } from "lucide-react";
import StatCard from "../StatCard";
import TenantTable from "../TenantTable";
import { getPaymentStatus } from "@/utils/getPaymentStatus";

export default function DashboardContent({
  tenants,
  apartments,
  payments,
}: {
  tenants: any[];
  apartments: any[];
  payments: any[];
}) {
  const tenantsWithDue = tenants?.map((tenant: any) => {
    const tenantPayments =
      payments?.filter((p: any) => p.tenant_id === tenant.id) || [];
    const status = getPaymentStatus(tenant, tenantPayments);
    return {
      ...tenant,
      apartment: tenant.apartment_name,
      dueDate: tenant.due_date,
      status,
    };
  });

  const totalTenants = tenants?.length || 0;
  const totalApartments = apartments?.length || 0;
  const incomingCount =
    tenantsWithDue?.filter((t: any) => t.status === "Incoming Due").length || 0;
  const overdueCount =
    tenantsWithDue?.filter((t: any) => t.status === "Overdue").length || 0;

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={
            <Users className="text-gray-700 w-7 h-7 group-hover:text-black transition-colors" />
          }
          label="Total Tenants"
          value={totalTenants.toString()}
        />
        <StatCard
          icon={
            <Home className="text-gray-700 w-7 h-7 group-hover:text-black transition-colors" />
          }
          label="Total Apartments"
          value={totalApartments.toString()}
        />
        <StatCard
          icon={
            <Calendar className="text-gray-700 w-7 h-7 group-hover:text-black transition-colors" />
          }
          label="Incoming Due"
          value={incomingCount.toString()}
        />
        <StatCard
          icon={
            <DollarSign className="text-gray-700 w-7 h-7 group-hover:text-black transition-colors" />
          }
          label="Overdue"
          value={overdueCount.toString()}
        />
      </div>

      {/* Tenant Table */}
      <section className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Tenant Overview
        </h3>
        <TenantTable tenants={tenantsWithDue} />
      </section>
    </div>
  );
}
