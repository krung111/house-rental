import moment from "moment";

type Payment = {
  tenant_id: string;
  date_from: string;
  date_to: string;
};

type Tenant = {
  id: string;
  name: string;
  apartment_name: string;
  due_date: string; // "2025-08-15"
};

export function getPaymentStatus(
  tenant: Tenant,
  payments: Payment[]
): "On Time" | "Overdue" | "Incoming Due" | "Upcoming" {
  const today = moment().startOf("day");

  // Get the day of month from tenant's due date (always same day every month)
  const dueDay = moment(tenant.due_date).date();

  // Build this month’s due date
  const dueDate = moment().date(dueDay).startOf("day");

  // If today is after dueDate and we haven't reached next month yet,
  // the tenant is overdue until payment is found
  if (today.isAfter(dueDate)) {
    // Check if already paid for this month
    const isPaid = payments.some((p) => {
      const from = moment(p.date_from).startOf("day");
      const to = moment(p.date_to).endOf("day");
      return dueDate.isBetween(from, to, "day", "[]");
    });

    return isPaid ? "On Time" : "Overdue";
  }

  // Check if tenant has already paid covering this due date (before it’s due)
  const isPaid = payments.some((p) => {
    const from = moment(p.date_from).startOf("day");
    const to = moment(p.date_to).endOf("day");
    return dueDate.isBetween(from, to, "day", "[]");
  });

  if (isPaid) return "On Time";

  // If within 5 days before due date → Incoming Due
  if (
    today.isSameOrAfter(moment(dueDate).subtract(5, "days")) &&
    today.isBefore(dueDate)
  ) {
    return "Incoming Due";
  }

  return "Upcoming";
}
