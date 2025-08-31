"use client";

import React, { useRef, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Users,
  Home,
  Calendar,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@apollo/client";
import { GET_TENANTS } from "@/lib/queries/GetTenants";
import { GET_APARTMENTS } from "@/lib/queries/GetApartments";
import { UPDATE_TENANT } from "@/lib/mutations/UpdateTenants";
import { UPDATE_APARTMENT } from "@/lib/mutations/ApartmentsMutation/UpdateApartment";
import { INSERT_TENANT } from "@/lib/mutations/InsertTenant";
import { TenantModal } from "@/components/TenantModal";
import { DELETE_TENANT } from "@/lib/mutations/DeleteTenant";

interface Tenant {
  id: number;
  name: string;
  contact: string;
  email: string;
  occupants: number;
  address: string;
  rent: string;
  dueDate: string;
  emergencyName: string;
  emergencyContact: string;
  apartmentId: string;
}

interface Apartment {
  id: string;
  name: string;
  address: string;
  rent_amount: string;
  status: string;
}

const Tenants: React.FC = () => {
  const deletedIdRef = useRef<number | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_TENANTS, {
    variables: { first: 50 },
  });

  const { data: apartmentsData } = useQuery(GET_APARTMENTS, {
    variables: { first: 50, filter: { status: { eq: "available" } } },
  });

  const [insertTenant] = useMutation(INSERT_TENANT, {
    onCompleted: () => refetch(),
  });
  const [updateTenant] = useMutation(UPDATE_TENANT);
  const [updateApartmentStatus] = useMutation(UPDATE_APARTMENT);
  const [deleteTenant] = useMutation(DELETE_TENANT);

  const apartmentsMapped: Apartment[] =
    apartmentsData?.apartmentsCollection?.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      address: edge.node.address,
      rent_amount: edge.node.rent_amount,
      status: edge.node.status,
    })) || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const tenantsMapped: Tenant[] =
    data?.tenantsCollection?.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      contact: edge.node.contact,
      email: edge.node.email,
      occupants: edge.node.occupants,
      address: edge.node.address,
      rent: edge.node.rent,
      dueDate: edge.node.due_date,
      emergencyName: edge.node.emergency_name,
      emergencyContact: edge.node.emergency_contact,
      apartmentId: edge.node.apartment_id,
      apartmentName: edge.node.apartment_name,
    })) || [];

  const openAddModal = () => {
    setEditingTenant(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSaveTenant = (tenantData: Tenant) => {
    const selectedApartment = apartmentsMapped.find(
      (a) => a.id === tenantData.apartmentId
    );

    const tenantInput = {
      name: tenantData.name,
      contact: tenantData.contact,
      email: tenantData.email,
      occupants: tenantData.occupants,
      address: tenantData.address,
      rent: tenantData.rent.toString(),
      due_date: tenantData.dueDate,
      emergency_name: tenantData.emergencyName,
      emergency_contact: tenantData.emergencyContact,
      apartment_id: tenantData.apartmentId,
      apartment_name: selectedApartment?.name,
    };

    if (editingTenant) {
      updateTenant({
        variables: { filter: { id: { eq: tenantData.id } }, set: tenantInput },
      }).then(() => {
        if (selectedApartment?.status === "available") {
          updateApartmentStatus({
            variables: {
              filter: { id: { eq: selectedApartment.id } },
              set: { status: "occupied" },
            },
          });
        }
        closeModal();
      });
    } else {
      insertTenant({
        variables: { objects: [tenantInput] },
      }).then(() => {
        if (selectedApartment?.status === "available") {
          updateApartmentStatus({
            variables: {
              filter: { id: { eq: selectedApartment.id } },
              set: { status: "occupied" },
            },
          });
        }
        closeModal();
      });
    }
  };

  const handleDeleteTenant = async (id: number) => {
    if (confirm("Are you sure you want to delete this tenant?")) {
      try {
        deletedIdRef.current = id;
        await deleteTenant({
          variables: { filter: { id: { eq: id } }, atMost: 1 },
        });
      } catch (err) {
        console.error("Error deleting tenant:", err);
        alert("Failed to delete tenant. Please try again.");
      }
    }
  };

  // ✅ Compute total monthly rent
  const totalMonthlyRent = tenantsMapped.reduce(
    (sum, tenant) => sum + Number(tenant.rent || 0),
    0
  );

  // ✅ Skeleton Loader
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto p-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-6 w-40 rounded-md" />
                <Skeleton className="h-6 w-28 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-60 rounded-md" />
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-6 w-40 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div>Error loading tenants: {error.message}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Tenant Management
        </h1>
        <Button
          onClick={openAddModal}
          className="rounded-lg px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white shadow-sm flex items-center gap-2 transition-all duration-200"
        >
          <Plus size={18} className="stroke-[2]" />
          <span className="font-medium">Add Tenant</span>
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto">
        <Table className="min-w-full">
          <TableCaption className="text-gray-500 text-sm py-4">
            Manage tenants and their rental details
          </TableCaption>
          <TableHeader className="bg-gray-100/70">
            <TableRow>
              <TableHead className="p-4 text-left w-40">Name</TableHead>
              <TableHead className="p-4 text-center w-32">
                Monthly Rent
              </TableHead>
              <TableHead className="p-4 text-center w-32">Due Date</TableHead>
              <TableHead className="p-4 text-center w-24">Occupants</TableHead>
              <TableHead className="p-4 text-left w-60">Address</TableHead>
              <TableHead className="p-4 text-left w-32">Contact</TableHead>
              <TableHead className="p-4 text-left w-48">Email</TableHead>
              <TableHead className="p-4 text-center w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tenantsMapped.map((tenant) => (
              <TableRow
                key={tenant.id}
                className="hover:bg-gray-50/70 transition-colors"
              >
                <TableCell className="p-4 font-medium truncate">
                  {tenant.name}
                </TableCell>
                <TableCell className="p-4 truncate">
                  ₱{Number(tenant.rent).toLocaleString()}
                </TableCell>
                <TableCell className="p-4 truncate">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar size={14} />{" "}
                    {new Date(tenant.dueDate).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="p-4 text-center text-gray-700">
                  <div className="flex items-center justify-center gap-1">
                    <Users size={14} /> {tenant.occupants}
                  </div>
                </TableCell>
                <TableCell className="p-4 truncate text-gray-700">
                  <div className="flex items-center gap-1">
                    <Home size={14} /> {tenant.address}
                  </div>
                </TableCell>
                <TableCell className="p-4 text-center font-semibold text-gray-800">
                  <div className="flex items-center gap-1 text-gray-700">
                    <Phone size={14} /> {tenant.contact}
                  </div>
                </TableCell>
                <TableCell className="p-4 text-center text-gray-700">
                  <div className="flex items-center gap-1 text-gray-700">
                    <Mail size={14} /> {tenant.email}
                  </div>
                </TableCell>
                <TableCell className="p-4 flex justify-center gap-3">
                  <button
                    onClick={() => openEditModal(tenant)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTenant(tenant.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}

            {/* ✅ Total Row */}
            <TableRow className="bg-gray-100 font-semibold text-gray-900">
              <TableCell className="p-4" colSpan={1}>
                Total
              </TableCell>
              <TableCell className="p-4">
                ₱{totalMonthlyRent.toLocaleString()}
              </TableCell>
              <TableCell colSpan={6}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TenantModal
          initialData={editingTenant}
          onSave={handleSaveTenant}
          onClose={closeModal}
          apartments={apartmentsMapped}
        />
      )}
    </div>
  );
};

export default Tenants;
