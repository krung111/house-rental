"use client";

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus } from "lucide-react";
import Sidebar from "@/components/Dashboard/Sidebar";

type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
};

const GET_EXPENSES = gql`
  query GetExpenses($orderBy: [expensesOrderBy!]) {
    expensesCollection(orderBy: $orderBy) {
      edges {
        node {
          id
          description
          amount
          date
          created_at
        }
      }
    }
  }
`;

const ADD_EXPENSE = gql`
  mutation AddExpense($objects: [expensesInsertInput!]!) {
    insertIntoexpensesCollection(objects: $objects) {
      records {
        id
        description
        amount
        date
        created_at
      }
    }
  }
`;

const UPDATE_EXPENSE = gql`
  mutation UpdateExpense($id: UUID!, $set: expensesUpdateInput!) {
    updateexpensesCollection(filter: { id: { eq: $id } }, set: $set) {
      records {
        id
        description
        amount
        date
        created_at
      }
    }
  }
`;

const DELETE_EXPENSE = gql`
  mutation DeleteExpense($id: UUID!) {
    deleteFromexpensesCollection(filter: { id: { eq: $id } }, atMost: 1) {
      records {
        id
        description
        amount
        date
        created_at
      }
    }
  }
`;

export default function ExpensesPage() {
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ description: "", amount: "", date: "" });

  const { data, loading, error } = useQuery(GET_EXPENSES, {
    variables: { orderBy: [{ created_at: "DescNullsLast" }] },
  });

  const expenses: Expense[] =
    data?.expensesCollection?.edges.map((e: any) => e.node) || [];

  const [addExpense] = useMutation(ADD_EXPENSE, {
    update(cache, { data }) {
      if (!data?.insertIntoexpensesCollection?.records?.length) return;
      const newExpense = data.insertIntoexpensesCollection.records[0];
      cache.modify({
        fields: {
          expensesCollection(existing) {
            const newEdge = { __typename: "expensesEdge", node: newExpense };
            return {
              ...existing,
              edges: [newEdge, ...(existing?.edges || [])],
            };
          },
        },
      });
    },
  });

  const [updateExpense] = useMutation(UPDATE_EXPENSE, {
    update(cache, { data }) {
      if (!data?.updateexpensesCollection?.records?.length) return;
      const updated = data.updateexpensesCollection.records[0];
      cache.modify({
        fields: {
          expensesCollection(existing) {
            if (!existing?.edges) return existing;
            const newEdges = existing.edges.map((edge: any) =>
              edge.node.id === updated.id ? { ...edge, node: updated } : edge
            );
            return { ...existing, edges: newEdges };
          },
        },
      });
    },
  });

  const [deleteExpense] = useMutation(DELETE_EXPENSE, {
    update(cache, { data }) {
      const deleted = data?.deleteFromexpensesCollection?.records?.[0];
      if (!deleted) return;
      cache.modify({
        fields: {
          expensesCollection(existing) {
            if (!existing?.edges) return existing;
            const newEdges = existing.edges.filter(
              (edge: any) => edge.node.id !== deleted.id
            );
            return { ...existing, edges: newEdges };
          },
        },
      });
    },
  });

  const handleSave = async () => {
    if (!form.description || !form.amount) return;
    if (editing) {
      await updateExpense({
        variables: {
          id: editing.id,
          set: { ...form, amount: Number(form.amount) },
        },
      });
    } else {
      await addExpense({
        variables: { objects: [{ ...form, amount: Number(form.amount) }] },
      });
    }
    setForm({ description: "", amount: "", date: "" });
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (exp: Expense) => {
    setEditing(exp);
    setForm({
      description: exp.description,
      amount: exp.amount.toString(),
      date: exp.date,
    });
    setOpen(true);
  };

  const confirmDelete = (id: string) => {
    setSelectedDeleteId(id);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    if (selectedDeleteId) {
      await deleteExpense({ variables: { id: selectedDeleteId } });
    }
    setOpenDelete(false);
    setSelectedDeleteId(null);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <Button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white min-h-[50px] px-4"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </Button>
          </div>

          {/* Expenses Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error loading expenses</p>}
            {!loading && !error && expenses.length === 0 && (
              <p className="text-gray-500">No expenses found</p>
            )}

            {!loading &&
              !error &&
              expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white shadow-md rounded-xl p-4 flex flex-col justify-between border-l-4 border-blue-600 hover:shadow-lg transition-shadow"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {exp.description}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      ₱{exp.amount.toLocaleString()}
                    </p>
                    <p className="text-gray-400 mt-1 text-sm">{exp.date}</p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => handleEdit(exp)}
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-1"
                      onClick={() => confirmDelete(exp.id)}
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {/* Add/Edit Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md p-6 rounded-xl shadow-lg">
              <DialogHeader className="border-b border-gray-200 pb-3 mb-4 text-center">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {editing ? "Edit Expense" : "Add Expense"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="e.g. Water Bill"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="₱0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editing ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={openDelete} onOpenChange={setOpenDelete}>
            <DialogContent className="sm:max-w-sm p-6 rounded-xl shadow-lg">
              <DialogHeader className="border-b border-gray-200 pb-3 mb-4 text-center">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Confirm Delete
                </DialogTitle>
              </DialogHeader>
              <p className="text-gray-700 text-center mb-6">
                Are you sure you want to delete this expense? This action cannot
                be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white min-h-[50px] flex items-center justify-center gap-2"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 min-h-[50px]"
                  onClick={() => setOpenDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
