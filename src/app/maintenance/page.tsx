"use client";

import React, { useRef, useState } from "react";
import { Plus, Edit, Trash2, Calendar, Wrench, DollarSign } from "lucide-react";
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
import Sidebar from "@/components/Dashboard/Sidebar";
import { MaintenanceModal } from "@/components/MaintenanceModal";
import { GET_MAINTENANCE_REQUESTS } from "@/lib/queries/GetMaintenanceRequests";
import {
  DELETE_MAINTENANCE_REQUEST,
  INSERT_MAINTENANCE_REQUEST,
  UPDATE_MAINTENANCE_REQUEST,
} from "@/lib/mutations/MaintenanceRequestsMutation";
import { GET_TENANTS } from "@/lib/queries/GetTenants";

interface Maintenance {
  id: string;
  tenant_id: string | null;
  description: string;
  status: "pending" | "in_progress" | "completed";
  cost: number | null;
  created_at: string;
  tenant_name?: string;
}

interface MaintenanceRequest {
  id: string;
  tenant_id: string | null;
  description: string;
  cost: string | null;
  status: string;
  created_at: string;
  __typename: string;
}

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

interface MaintenanceRequestsCollection {
  edges: { node: MaintenanceRequest }[];
  __typename: string;
  totalCount: number;
  pageInfo: PageInfo;
}

interface GetMaintenanceRequestsData {
  maintenance_requestsCollection: MaintenanceRequestsCollection;
}

const Maintenance: React.FC = () => {
  const deletedIdRef = useRef<string | null>(null);
  const { data, loading, error } = useQuery(GET_MAINTENANCE_REQUESTS, {
    variables: { first: 50 },
  });
  const { data: tenantsData, loading: tenantsLoading } = useQuery(GET_TENANTS, {
    variables: { first: 50 },
  });

  const tenants =
    tenantsData?.tenantsCollection?.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
    })) || [];

  const [insertMaintenance] = useMutation(INSERT_MAINTENANCE_REQUEST, {
    update(cache, { data }) {
      const newRecord =
        data?.insertIntomaintenance_requestsCollection?.records?.[0];
      if (!newRecord) return;

      const existing: any = cache.readQuery({
        query: GET_MAINTENANCE_REQUESTS,
        variables: { first: 50 }, // 👈 same vars as useQuery
      });

      if (!existing?.maintenance_requestsCollection) return;

      cache.writeQuery({
        query: GET_MAINTENANCE_REQUESTS,
        variables: { first: 50 }, // 👈 must match
        data: {
          maintenance_requestsCollection: {
            ...existing.maintenance_requestsCollection,
            edges: [
              ...existing.maintenance_requestsCollection.edges,
              {
                __typename: "maintenance_requestsEdge",
                node: {
                  __typename: "maintenance_requests",
                  ...newRecord,
                },
              },
            ],
            totalCount: existing.maintenance_requestsCollection.totalCount + 1,
            pageInfo: existing.maintenance_requestsCollection.pageInfo,
          },
        },
      });
    },
  });

  // Update
  const [updateMaintenance] = useMutation(UPDATE_MAINTENANCE_REQUEST, {
    update(cache, { data }) {
      const updated = data?.updatemaintenance_requestsCollection?.records?.[0];
      if (!updated) return;

      const existing = cache.readQuery<GetMaintenanceRequestsData>({
        query: GET_MAINTENANCE_REQUESTS,
      });

      if (existing?.maintenance_requestsCollection) {
        cache.writeQuery<GetMaintenanceRequestsData>({
          query: GET_MAINTENANCE_REQUESTS,
          data: {
            maintenance_requestsCollection: {
              ...existing.maintenance_requestsCollection,
              edges: existing.maintenance_requestsCollection.edges.map((edge) =>
                edge.node.id === updated.id ? { node: updated } : edge
              ),
            },
          },
        });
      }
    },
  });

  const [deleteMaintenance] = useMutation(DELETE_MAINTENANCE_REQUEST, {
    update(cache, { data }, { variables }) {
      if (!data?.deleteFrommaintenance_requestsCollection?.affectedCount)
        return;

      const existing = cache.readQuery<GetMaintenanceRequestsData>({
        query: GET_MAINTENANCE_REQUESTS,
        variables: { first: 50 },
      });

      if (!existing?.maintenance_requestsCollection) return;

      cache.writeQuery<GetMaintenanceRequestsData>({
        query: GET_MAINTENANCE_REQUESTS,
        variables: { first: 50 },
        data: {
          maintenance_requestsCollection: {
            __typename: existing.maintenance_requestsCollection.__typename,
            edges: existing.maintenance_requestsCollection.edges.filter(
              (edge) => edge.node.id !== variables?.id
            ),
            pageInfo: existing.maintenance_requestsCollection.pageInfo, // keep original
            totalCount: existing.maintenance_requestsCollection.totalCount - 1, // update count
          },
        },
      });
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] =
    useState<Maintenance | null>(null);

  const maintenanceMapped: Maintenance[] =
    data?.maintenance_requestsCollection?.edges.map((edge: any) => {
      const tenant = tenants.find((t) => t.id === edge.node.tenant_id);

      return {
        id: edge.node.id,
        tenant_id: edge.node.tenant_id,
        tenant_name: tenant ? tenant.name : "N/A", // 👈 match tenant by id
        description: edge.node.description,
        status: edge.node.status,
        cost: edge.node.cost,
        created_at: edge.node.created_at,
      };
    }) || [];

  const openAddModal = () => {
    setEditingMaintenance(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Maintenance) => {
    setEditingMaintenance(item);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSaveMaintenance = (data: Maintenance) => {
    const input = {
      tenant_id: data.tenant_id,
      description: data.description,
      status: data.status,
      cost: data.cost !== null ? String(data.cost) : null, // BigFloat must be string
      created_at: new Date().toISOString(),
    };

    if (editingMaintenance) {
      // ✅ Use "id" not "filter"
      updateMaintenance({
        variables: {
          id: editingMaintenance.id,
          set: input,
        },
      }).then(() => closeModal());
    } else {
      insertMaintenance({ variables: { objects: [input] } }).then(() =>
        closeModal()
      );
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this request?")) {
      deletedIdRef.current = id;
      deleteMaintenance({
        variables: { id },
      })
        .then(() => {
          console.log("Deleted maintenance request:", id);
        })
        .catch((err) => {
          console.error("Error deleting maintenance:", err);
          alert("Failed to delete. Please try again.");
        });
    }
  };

  // ✅ Total maintenance cost
  const totalCost = maintenanceMapped.reduce(
    (sum, item) => sum + Number(item.cost || 0),
    0
  );

  // // ✅ Client-only date formatter
  // const [isClient, setIsClient] = useState(false);
  // useEffect(() => setIsClient(true), []);

  if (loading && tenantsLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 mb-4"
            >
              <Skeleton className="h-6 w-40 rounded-md" />
              <Skeleton className="h-6 w-28 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div>Error loading maintenance: {error.message}</div>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Maintenance Management
            </h1>
            <Button
              onClick={openAddModal}
              className="rounded-lg px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white shadow-sm flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Add Request</span>
            </Button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto">
            <Table className="min-w-full">
              <TableCaption className="text-gray-500 text-sm py-4">
                Manage maintenance requests and costs
              </TableCaption>
              <TableHeader className="bg-gray-100/70">
                <TableRow>
                  <TableHead className="p-4">Tenant</TableHead>
                  <TableHead className="p-4">Description</TableHead>
                  <TableHead className="p-4">Status</TableHead>
                  <TableHead className="p-4">Cost</TableHead>
                  <TableHead className="p-4">Created At</TableHead>
                  <TableHead className="p-4 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceMapped.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="p-4 font-medium">
                      {item.tenant_name || "N/A"}
                    </TableCell>
                    <TableCell className="p-4">{item.description}</TableCell>
                    <TableCell className="p-4 capitalize">
                      <div className="flex items-center gap-2">
                        <Wrench size={14} /> {item.status}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      {item.cost ? (
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} /> ₱
                          {Number(item.cost).toLocaleString()}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(item.created_at).toISOString().split("T")[0]}
                        {/* outputs YYYY-MM-DD (same on server & client) */}
                      </div>
                    </TableCell>
                    <TableCell className="p-4 flex justify-center gap-3">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-100 font-semibold text-gray-900">
                  <TableCell className="p-4" colSpan={3}>
                    Total
                  </TableCell>
                  <TableCell className="p-4">
                    ₱{totalCost.toLocaleString()}
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <MaintenanceModal
              initialData={editingMaintenance}
              onSave={handleSaveMaintenance}
              onClose={closeModal}
              tenants={tenants}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
