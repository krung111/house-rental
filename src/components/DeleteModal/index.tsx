"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";

interface DeleteModalProps {
  title?: string; // optional, default: "Delete Item"
  description?: string; // optional, default: "Are you sure you want to delete this?"
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  title = "Delete Item",
  description = "Are you sure you want to delete this?",
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-96 p-6 relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Modal content */}
        <div className="text-center space-y-4">
          <Trash2 className="mx-auto text-red-500" size={36} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>

          {/* Actions */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
