"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export interface Apartment {
  id?: string;
  name: string;
  type?: string;
  rent_amount: number | null; // allow null
  status: "available" | "occupied";
  created_at?: string;
  address?: string;
}

interface ModalProps {
  initialData: Apartment | null;
  onSave: (apartment: Apartment) => void;
  onClose: () => void;
}

export const ApartmentModal: React.FC<ModalProps> = ({
  initialData,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Apartment>({
    id: initialData?.id,
    name: initialData?.name || "",
    type: initialData?.type || "",
    address: initialData?.address || "",
    rent_amount: initialData?.rent_amount ?? null, // use null if empty
    status: initialData?.status || "available",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Track if there are unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const isChanged =
      formData.name !== (initialData?.name || "") ||
      formData.type !== (initialData?.type || "") ||
      formData.address !== (initialData?.address || "") ||
      formData.rent_amount !== (initialData?.rent_amount ?? null) ||
      formData.status !== (initialData?.status || "available");
    setIsDirty(isChanged);
  }, [formData, initialData]);

  const handleChange = (
    field: keyof Apartment,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Apartment Name is required";
    if (formData.rent_amount === null || formData.rent_amount <= 0)
      newErrors.rent_amount = "Rent must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) onSave(formData);
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleCancel}
        ></div>

        {/* Modal */}
        <div className="relative z-50 bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200 animate-fadeIn">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {initialData ? "Edit Apartment" : "Add Apartment"}
          </h2>

          {/* Form */}
          <div className="grid gap-5 text-base">
            {/* Apartment Name */}
            <div>
              <input
                type="text"
                placeholder="Apartment Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full h-12 border px-4 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none transition text-base ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full h-12 border px-4 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none transition text-base border-gray-300"
              />
            </div>

            {/* Apartment Type */}
            <div>
              <select
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full h-12 border px-4 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none border-gray-300 transition text-base"
              >
                <option value="">Select Type</option>
                <option value="Studio">Studio</option>
                <option value="1BR">1 Bedroom</option>
                <option value="2BR">2 Bedroom</option>
                <option value="3BR">3 Bedroom</option>
              </select>
            </div>

            {/* Rent */}
            <div>
              <input
                type="number"
                placeholder="Rent Amount (₱)"
                value={formData.rent_amount ?? ""} // show empty if null
                onChange={(e) =>
                  handleChange(
                    "rent_amount",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                min={1} // prevents negative values
                className={`w-full h-12 border px-4 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none transition text-base ${
                  errors.rent_amount
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.rent_amount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.rent_amount}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <select
                value={formData.status}
                onChange={(e) =>
                  handleChange(
                    "status",
                    e.target.value as "available" | "occupied"
                  )
                }
                className="w-full h-12 border px-4 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none border-gray-300 text-base"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="rounded-lg border-gray-300 hover:bg-gray-100 text-base px-5"
            >
              Cancel
            </Button>
            <Button
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg shadow-md text-base px-6"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Discard Changes Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDiscardModal(false)}
          ></div>

          {/* Modal */}
          <div className="relative z-50 bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-semibold mb-4">Discard changes?</h3>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to discard them?
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowDiscardModal(false)}
                className="rounded-lg border-gray-300"
              >
                No
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-500 text-white rounded-lg"
                onClick={onClose}
              >
                Yes, Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
