"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_TENANTS } from "@/lib/queries/GetTenants";
import { GET_APARTMENTS } from "@/lib/queries/GetApartments";
import { GET_PAYMENTS } from "@/lib/queries/GetPayments";

import DashboardContent from "@/components/Dashboard/DashboardContent";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/Dashboard/Sidebar";

type Tenant = {
  id: string;
  name: string;
  apartment_id: string;
  due_date: string;
};

type Apartment = {
  id: string;
  name: string;
  location: string;
};

type Payment = {
  id: string;
  tenant_id: string;
  amount: number;
  date: string;
};

export default function Home() {
  const {
    data: tenantsData,
    loading: tenantsLoading,
    error: tenantsError,
    refetch: refetchTenants,
  } = useQuery(GET_TENANTS, {
    variables: { first: 100 },
    fetchPolicy: "cache-and-network",
  });

  const {
    data: apartmentsData,
    loading: apartmentsLoading,
    error: apartmentsError,
    refetch: refetchApartments,
  } = useQuery(GET_APARTMENTS, {
    variables: { first: 100 },
    fetchPolicy: "cache-and-network",
  });

  const {
    data: paymentsData,
    loading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useQuery(GET_PAYMENTS, {
    fetchPolicy: "cache-and-network",
  });

  const isLoading = tenantsLoading || apartmentsLoading || paymentsLoading;
  const hasError = tenantsError || apartmentsError || paymentsError;

  const tenants = useMemo<Tenant[]>(
    () =>
      tenantsData?.tenantsCollection?.edges?.map(({ node }: any) => node) ?? [],
    [tenantsData]
  );

  const apartments = useMemo<Apartment[]>(
    () =>
      apartmentsData?.apartmentsCollection?.edges?.map(
        ({ node }: any) => node
      ) ?? [],
    [apartmentsData]
  );

  const payments = useMemo<Payment[]>(
    () =>
      paymentsData?.paymentsCollection?.edges?.map(({ node }: any) => node) ??
      [],
    [paymentsData]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-[300px]">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <p className="text-red-600 font-semibold mb-4">
          Something went wrong while loading data.
        </p>
        <Button
          onClick={() => {
            refetchTenants();
            refetchApartments();
            refetchPayments();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="min-h-screen flex bg-gray-50 p-6">
          <main className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-4">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Dashboard
              </h1>
            </div>

            <div className="flex-1 overflow-y-auto ">
              <DashboardContent
                tenants={tenants}
                apartments={apartments}
                payments={payments}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
