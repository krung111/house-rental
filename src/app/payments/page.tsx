"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2 } from "lucide-react";
import moment from "moment";

import { GET_PAYMENTS } from "@/lib/queries/GetPayments";
import { GET_TENANTS } from "@/lib/queries/GetTenants";
import { INSERT_PAYMENT } from "@/lib/mutations/InsertPayments";
import { DELETE_PAYMENT, EDIT_PAYMENT } from "@/lib/mutations/PaymentMutation";

export default function Payments() {
  const { data, loading } = useQuery(GET_PAYMENTS);
  const { data: tenantsData, loading: tenantsLoading } = useQuery(GET_TENANTS, {
    variables: { first: 50 },
  });

  console.log("tenantsData", tenantsData);

  const [addPayment] = useMutation(INSERT_PAYMENT, {
    update(cache, { data }) {
      const inserted = data?.insertIntopaymentsCollection?.records?.[0];
      if (!inserted) return;
      const existing: any = cache.readQuery({ query: GET_PAYMENTS });
      if (!existing?.paymentsCollection) return;

      cache.writeQuery({
        query: GET_PAYMENTS,
        data: {
          paymentsCollection: {
            ...existing.paymentsCollection,
            edges: [
              ...existing.paymentsCollection.edges,
              { __typename: "paymentsEdge", node: inserted },
            ],
            totalCount: existing.paymentsCollection.totalCount + 1,
            pageInfo: existing.paymentsCollection.pageInfo,
          },
        },
      });
    },
  });

  const [editPayment] = useMutation(EDIT_PAYMENT);
  const [deletePayment] = useMutation(DELETE_PAYMENT, {
    update(cache) {
      const deletedId = selectedPayment?.id;
      if (!deletedId) return;

      const existing: any = cache.readQuery({ query: GET_PAYMENTS });
      if (!existing?.paymentsCollection) return;

      const edges = existing.paymentsCollection.edges.filter(
        (edge: any) => edge.node.id !== deletedId
      );
      cache.writeQuery({
        query: GET_PAYMENTS,
        data: {
          paymentsCollection: {
            ...existing.paymentsCollection,
            edges,
            totalCount: edges.length,
            pageInfo: existing.paymentsCollection.pageInfo,
          },
        },
      });
    },
  });

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const [tenantId, setTenantId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("paid");
  const [dateFrom, setDateFrom] = useState(moment().format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(
    moment().add(1, "month").format("YYYY-MM-DD")
  );

  const resetForm = () => {
    setTenantId("");
    setAmount("");
    setStatus("paid");
    setDateFrom(moment().format("YYYY-MM-DD"));
    setDateTo(moment().add(1, "month").format("YYYY-MM-DD"));
  };

  // Handlers
  const handleAddPayment = () => {
    if (!tenantId || !amount || !dateFrom || !dateTo) return;

    const tenant = tenantsData?.tenantsCollection?.edges?.find(
      ({ node }: any) => node.id === tenantId
    )?.node;
    if (!tenant) return;

    addPayment({
      variables: {
        objects: [
          {
            tenant_id: tenantId,
            tenant_name: tenant.name,
            amount: amount,
            date_from: dateFrom,
            date_to: dateTo,
            status: status.toLowerCase(),
          },
        ],
      },
    }).then(() => {
      resetForm();
      setOpenAdd(false);
    });
  };

  const handleEditPayment = () => {
    if (!selectedPayment) return;

    editPayment({
      variables: {
        filter: { id: { eq: selectedPayment.id } },
        set: {
          tenant_id: tenantId,
          tenant_name: tenantsData?.tenantsCollection?.edges?.find(
            ({ node }: any) => node.id === tenantId
          )?.node.name,
          amount: amount,
          date_from: dateFrom,
          date_to: dateTo,
          status: status.toLowerCase(),
        },
        atMost: 1,
      },
    }).then(() => {
      resetForm();
      setSelectedPayment(null);
      setOpenEdit(false);
    });
  };

  const handleDeletePayment = () => {
    if (!selectedPayment) return;

    deletePayment({
      variables: { filter: { id: { eq: selectedPayment.id } }, atMost: 1 },
    }).then(() => {
      setSelectedPayment(null);
      setOpenDelete(false);
    });
  };

  const isLoading = loading || tenantsLoading;

  const SkeletonRow = () => (
    <TableRow className="animate-pulse">
      <TableCell>
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-20 bg-gray-200 rounded mx-auto" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-48 bg-gray-200 rounded mx-auto" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
      </TableCell>
    </TableRow>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

        {/* Add Payment Modal */}
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2 min-h-[50px]">
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Payment</DialogTitle>
            </DialogHeader>

            <div>
              <Label>Tenant</Label>
              <select
                value={tenantId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setTenantId(selectedId);

                  const tenant = tenantsData?.tenantsCollection?.edges?.find(
                    ({ node }: any) => node.id === selectedId
                  )?.node;

                  if (tenant) {
                    setAmount(tenant.rent || ""); // auto-fill amount
                  } else {
                    setAmount(""); // clear if no tenant
                  }
                }}
                className="w-full min-h-[50px] border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Tenant</option>
                {tenantsData?.tenantsCollection?.edges?.map(({ node }: any) => (
                  <option key={node.id} value={node.id}>
                    {node.name} - {node.apartment_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="min-h-[50px]"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="min-h-[50px]"
                />
              </div>
              <div className="flex-1">
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="min-h-[50px]"
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full min-h-[50px] border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <Button
              onClick={handleAddPayment}
              className="w-full min-h-[50px] bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
            >
              Save
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        <Table className="min-w-full">
          <TableCaption className="text-gray-500 text-sm py-4">
            Manage tenant payments
          </TableCaption>
          <TableHeader className="bg-gray-100/70">
            <TableRow>
              <TableHead className="p-4 text-left w-48">Tenant</TableHead>
              <TableHead className="p-4 text-center w-32">Amount</TableHead>
              <TableHead className="p-4 text-center w-60">Date Range</TableHead>
              <TableHead className="p-4 text-center w-28">Status</TableHead>
              <TableHead className="p-4 text-center w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : data?.paymentsCollection?.edges?.map(({ node }: any) => (
                  <TableRow
                    key={node.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900 pl-4">
                      {node.tenant_name}
                    </TableCell>
                    <TableCell className="text-center text-gray-800">
                      ₱{Number(node.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center text-gray-700">
                      {node.date_from && node.date_to
                        ? `${moment(node.date_from).format(
                            "MMM D, YYYY"
                          )} - ${moment(node.date_to).format("MMM D, YYYY")}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          node.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {node.status}
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-center gap-3">
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setSelectedPayment(node);
                          setTenantId(node.tenant_id);
                          setAmount(node.amount);
                          setDateFrom(node.date_from);
                          setDateTo(node.date_to);
                          setStatus(node.status);
                          setOpenEdit(true);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 transition min-h-[50px]"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          setSelectedPayment(node);
                          setOpenDelete(true);
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition min-h-[50px]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Payment Modal */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>

          <div>
            <Label>Tenant</Label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full min-h-[50px] border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select Tenant</option>
              {tenantsData?.tenantsCollection?.edges?.map(({ node }: any) => (
                <option key={node.id} value={node.id}>
                  {node.name} - {node.apartment_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="min-h-[50px]"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="min-h-[50px]"
              />
            </div>
            <div className="flex-1">
              <Label>Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="min-h-[50px]"
              />
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full min-h-[50px] border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <Button
            onClick={handleEditPayment}
            className="w-full min-h-[50px] bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
          >
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Modal */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="space-y-6 p-6 w-[400px] sm:w-[90%] rounded-xl shadow-lg">
          <DialogHeader className="text-center border-b border-gray-200 pb-3">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-700 ">
            Are you sure you want to delete this payment? This action cannot be
            undone.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              onClick={handleDeletePayment}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium min-h-[50px] flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
            <Button
              onClick={() => setOpenDelete(false)}
              variant="outline"
              className="flex-1 min-h-[50px] font-medium"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
