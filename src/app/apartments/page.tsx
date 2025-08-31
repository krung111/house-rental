"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { gql, useQuery, useMutation } from "@apollo/client";
import { GET_APARTMENTS } from "@/lib/queries/GetApartments";
import { INSERT_APARTMENT } from "@/lib/mutations/ApartmentsMutation/InsertApartment";
import { ApartmentModal } from "@/components/ApartmentModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DELETE_APARTMENT,
  UPDATE_APARTMENT,
} from "@/lib/mutations/ApartmentsMutation";

export interface Apartment {
  id?: string;
  name: string;
  type?: string;
  rent_amount: number;
  status: "available" | "occupied";
  address?: string;
}

const Apartments: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(
    null
  );

  const { data, loading } = useQuery(GET_APARTMENTS, {
    variables: { first: 50 },
  });

  const apartmentsData = data?.apartmentsCollection?.edges || [];

  const [insertApartmentMutation] = useMutation(INSERT_APARTMENT, {
    update(cache, { data }) {
      const inserted = data?.insertIntToapartmentsCollection?.records?.[0];
      if (!inserted) return;

      const existing: any = cache.readQuery({
        query: GET_APARTMENTS,
        variables: { first: 50 },
      });

      const newEdges = [
        ...(existing?.apartmentsCollection?.edges || []),
        {
          __typename: "apartmentsEdge",
          node: { ...inserted, __typename: "apartments" },
        },
      ];

      cache.writeQuery({
        query: GET_APARTMENTS,
        variables: { first: 50 },
        data: {
          apartmentsCollection: {
            ...existing.apartmentsCollection,
            edges: newEdges,
            __typename: "apartmentsConnection", // 👈 required
          },
        },
      });
    },
  });

  const [updateApartmentMutation] = useMutation(UPDATE_APARTMENT, {
    update(cache, { data }, { variables }) {
      const updated = data?.updateapartmentsCollection?.records?.[0];
      if (!updated) return;

      const existing: any = cache.readQuery({
        query: GET_APARTMENTS,
        variables: { first: 50 },
      });

      if (!existing?.apartmentsCollection?.edges) return;

      const newEdges = existing.apartmentsCollection.edges.map((edge: any) =>
        edge.node.id === variables?.filter?.id?.eq
          ? {
              __typename: "apartmentsEdge",
              node: { ...updated, __typename: "apartments" },
            }
          : edge
      );

      cache.writeQuery({
        query: GET_APARTMENTS,
        variables: { first: 50 },
        data: {
          apartmentsCollection: {
            ...existing.apartmentsCollection,
            edges: newEdges,
            __typename: "apartmentsConnection",
          },
        },
      });
    },
  });

  const [deleteApartmentMutation] = useMutation(DELETE_APARTMENT, {
    update(cache, { data }) {
      // ✅ fix: your mutation returns records, not affectedCount
      const deleted = data?.deleteFromapartmentsCollection?.records?.[0];
      if (!deleted) return;

      const existing: any = cache.readQuery({
        query: GET_APARTMENTS,
        variables: { first: 50 },
      });

      if (!existing?.apartmentsCollection?.edges) return;

      const deletedId = deleted.id; // ✅ use returned id instead of variables
      const newEdges = existing.apartmentsCollection.edges.filter(
        (edge: any) => edge.node.id !== deletedId
      );

      cache.writeQuery({
        query: GET_APARTMENTS,
        variables: { first: 50 },
        data: {
          apartmentsCollection: {
            ...existing.apartmentsCollection,
            edges: newEdges,
            __typename: "apartmentsConnection",
          },
        },
      });
    },
  });

  const openAddModal = () => {
    setEditingApartment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (apartment: Apartment) => {
    setEditingApartment(apartment);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSaveApartment = (apartmentData: Apartment) => {
    const setInput = {
      name: apartmentData.name,
      type: apartmentData.type || "",
      rent_amount: String(apartmentData.rent_amount),
      status: apartmentData.status,
      address: apartmentData.address || "",
    };

    if (!editingApartment) {
      insertApartmentMutation({ variables: { objects: [setInput] } });
    } else {
      updateApartmentMutation({
        variables: {
          filter: { id: { eq: editingApartment.id } },
          set: setInput,
        },
      });
    }

    closeModal();
  };

  const handleDeleteApartment = (id: string) => {
    if (confirm("Are you sure you want to delete this apartment?")) {
      deleteApartmentMutation({
        variables: { filter: { id: { eq: id } } },
      }).catch((error) => {
        console.error("Error deleting apartment:", error);
      });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Apartment Management
        </h1>
        <Button
          onClick={openAddModal}
          className="rounded-lg px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white shadow-sm flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> <span className="font-medium">Add Apartment</span>
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        <Table className="min-w-full">
          <TableCaption className="text-gray-500 text-sm py-4">
            Manage apartments and their availability
          </TableCaption>
          <TableHeader className="bg-gray-100/70">
            <TableRow>
              <TableHead className="p-4 text-left w-40">Name</TableHead>
              <TableHead className="p-4 text-left w-32">Type</TableHead>
              <TableHead className="p-4 text-left w-60">Address</TableHead>
              <TableHead className="p-4 text-center w-32">
                Rent Amount
              </TableHead>
              <TableHead className="p-4 text-center w-28">Status</TableHead>
              <TableHead className="p-4 text-center w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading
              ? // Skeleton Rows
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : apartmentsData.map(({ node }: { node: any }) => (
                  <TableRow
                    key={node?.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      {node?.name}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {node?.type || "-"}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {node?.address || "-"}
                    </TableCell>
                    <TableCell className="text-center text-gray-800">
                      ₱{Number(node?.rent_amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-3 py-1 capitalize rounded-full text-xs font-medium ${
                          node?.status === "available"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {node?.status}
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-center gap-3">
                      <button
                        onClick={() => openEditModal(node)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteApartment(node?.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ApartmentModal
          initialData={editingApartment}
          onSave={handleSaveApartment}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Apartments;
