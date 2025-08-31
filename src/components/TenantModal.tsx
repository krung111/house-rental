"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog"; // Adjust this import to your Dialog component

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

interface ModalProps {
  initialData: Tenant | null;
  onSave: (tenant: Tenant) => void;
  onClose: () => void;
  apartments: {
    id: string;
    name: string;
    address: string;
    rent_amount: string;
  }[];
}

export const TenantModal: React.FC<ModalProps> = ({
  initialData,
  onSave,
  onClose,
  apartments,
}) => {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<Tenant>({
    id: initialData?.id || 0,
    name: initialData?.name || "",
    contact: initialData?.contact || "+639",
    email: initialData?.email || "",
    occupants: initialData?.occupants || 1,
    address: initialData?.address || "",
    rent: initialData?.rent || "",
    dueDate: initialData?.dueDate || today,
    emergencyName: initialData?.emergencyName || "",
    emergencyContact: initialData?.emergencyContact || "+639",
    apartmentId: initialData?.apartmentId || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof Tenant, value: string | number) => {
    setFormChanged(true);

    if (field === "contact" || field === "emergencyContact") {
      let digits = (value as string).replace(/\D/g, "");
      if (digits.startsWith("63")) digits = digits.slice(2);
      if (!digits.startsWith("9")) digits = "9" + digits.slice(1);

      setFormData((prev) => ({
        ...prev,
        [field]: "+63" + digits,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleApartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormChanged(true);

    const selectedId = e.target.value;
    const selectedApartment = apartments.find((a) => a.id === selectedId);

    if (selectedApartment) {
      setFormData((prev) => ({
        ...prev,
        apartmentId: selectedId,
        address: selectedApartment.address || "",
        rent: selectedApartment.rent_amount || "",
      }));
      setErrors((prev) => ({ ...prev, apartmentId: "" }));
    } else {
      setFormData((prev) => ({ ...prev, apartmentId: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.contact.trim()) newErrors.contact = "Contact is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.dueDate) newErrors.dueDate = "Due Date is required";
    if (!formData.emergencyName.trim())
      newErrors.emergencyName = "Emergency name is required";
    if (!formData.emergencyContact.trim())
      newErrors.emergencyContact = "Emergency contact is required";
    if (formData.occupants <= 0 || isNaN(formData.occupants))
      newErrors.occupants = "Occupants must be greater than 0";
    if (Number(formData.rent) <= 0 || isNaN(Number(formData.rent)))
      newErrors.rent = "Monthly Rent must be greater than 0";
    if (!formData.apartmentId) newErrors.apartmentId = "Apartment is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      setFormChanged(false);
    }
  };

  const handleClose = () => {
    if (formChanged) {
      setIsDiscardModalOpen(true);
    } else {
      onClose();
    }
  };

  const discardChanges = () => {
    setIsDiscardModalOpen(false);
    setFormChanged(false);
    onClose();
  };
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        {/* Modal */}
        <div className="relative z-50 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
          {/* Title */}
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">
            {initialData ? "Edit Tenant" : "Add Tenant"}
          </h2>

          {/* Form */}
          <div className="grid grid-cols-2 gap-6 text-base">
            {/* Tenant Name */}
            <div>
              <input
                type="text"
                placeholder="Tenant Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none transition ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Tenant Contact */}
            <div>
              <input
                type="text"
                placeholder="Tenant Contact (+639XXXXXXXXX)"
                value={formData.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
                className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none transition ${
                  errors.contact ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.contact && (
                <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
              )}
            </div>

            {/* Email */}
            <div className="col-span-2">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Apartment Select */}
            <div className="col-span-2">
              <label className="block mb-2 text-gray-700 dark:text-gray-300 font-semibold">
                Apartment
              </label>
              <select
                value={formData.apartmentId || ""}
                onChange={handleApartmentChange}
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none transition"
              >
                <option value="">Select Apartment</option>
                {apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.name}
                  </option>
                ))}
              </select>
              {errors.apartmentId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.apartmentId}
                </p>
              )}
            </div>

            {/* Occupants */}
            <div>
              <input
                type="number"
                placeholder="Number of Occupants"
                value={formData.occupants}
                onChange={(e) =>
                  handleChange("occupants", Number(e.target.value))
                }
                className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none transition ${
                  errors.occupants ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.occupants && (
                <p className="text-red-500 text-sm mt-1">{errors.occupants}</p>
              )}
            </div>

            {/* Monthly Rent */}
            <div>
              <input
                type="number"
                placeholder="Monthly Rent (₱)"
                value={formData.rent}
                onChange={(e) => handleChange("rent", e.target.value)}
                className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none transition ${
                  errors.rent ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.rent && (
                <p className="text-red-500 text-sm mt-1">{errors.rent}</p>
              )}
            </div>

            {/* Address */}
            <div className="col-span-2">
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none transition ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="col-span-2">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none transition ${
                  errors.dueDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>

            {/* Emergency Section */}
            <div className="col-span-2 mt-6 p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Emergency Contact
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Emergency Name"
                    value={formData.emergencyName}
                    onChange={(e) =>
                      handleChange("emergencyName", e.target.value)
                    }
                    className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none transition ${
                      errors.emergencyName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.emergencyName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.emergencyName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Emergency Contact (+639XXXXXXXXX)"
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      handleChange("emergencyContact", e.target.value)
                    }
                    className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none transition ${
                      errors.emergencyContact
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.emergencyContact && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.emergencyContact}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-10">
            <Button
              variant="outline"
              onClick={handleClose} // <- call handleClose here
              className="rounded-xl border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-6 py-2 text-base"
            >
              Cancel
            </Button>
            <Button
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-md px-6 py-2 text-base"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDiscardModalOpen} onOpenChange={setIsDiscardModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            You have unsaved changes. Are you sure you want to discard them?
          </p>
          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDiscardModalOpen(false)}
            >
              Go Back
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={discardChanges}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
