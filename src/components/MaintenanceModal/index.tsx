"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";

interface Maintenance {
  id?: string;
  tenant_id: string | null;
  description: string;
  status: "pending" | "in_progress" | "completed";
  cost: number | null;
}

interface Props {
  initialData: Maintenance | null;
  onSave: (data: Maintenance) => void;
  onClose: () => void;
  tenants?: { id: string; name: string }[];
}

export const MaintenanceModal: React.FC<Props> = ({
  initialData,
  onSave,
  onClose,
  tenants = [],
}) => {
  const [formData, setFormData] = useState<Maintenance>({
    tenant_id: null,
    description: "",
    status: "pending",
    cost: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        tenant_id: null,
        description: "",
        status: "pending",
        cost: null,
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof Maintenance, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.description.trim()) {
      alert("Description is required.");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData
              ? "Edit Maintenance Request"
              : "Add Maintenance Request"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tenant Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="tenant">Tenant (Optional)</Label>
            <Select
              value={formData.tenant_id ?? "none"}
              onValueChange={(val) =>
                handleChange("tenant_id", val === "none" ? null : val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter maintenance details"
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val) =>
                handleChange("status", val as Maintenance["status"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cost */}
          <div className="space-y-2">
            <Label htmlFor="cost">Cost (₱)</Label>
            <Input
              type="number"
              id="cost"
              value={formData.cost ?? ""}
              onChange={(e) =>
                handleChange(
                  "cost",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              placeholder="Enter cost"
              min={0}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {initialData ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
