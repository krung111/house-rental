"use client";

import React, { useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import moment from "moment";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payment: {
    tenant_id: string;
    amount: number;
    date_paid: string;
    status: string;
  }) => void;
  tenantId: string;
}

export default function PaymentModal({
  open,
  onClose,
  onSave,
  tenantId,
}: PaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [datePaid, setDatePaid] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState("Paid");

  const handleSave = () => {
    if (!datePaid) return;

    onSave({
      tenant_id: tenantId,
      amount: parseFloat(amount),
      date_paid: datePaid.toISOString().slice(0, 10), // format as YYYY-MM-DD
      status,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Amount */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="col-span-3"
            />
          </div>

          {/* Date Picker with Calendar */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label>Date Paid</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="col-span-3 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {datePaid ? (
                    moment(datePaid).format("YYYY-MM-DD")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={datePaid}
                  onSelect={setDatePaid}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label>Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="col-span-3 border rounded p-2"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
