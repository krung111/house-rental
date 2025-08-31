"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as XLSX from "xlsx";
import { GET_PAYMENTS } from "@/lib/queries/GetPayments";
import { GET_EXPENSES } from "@/lib/queries/GetExpenses";
import moment from "moment";

type Report = {
  id: string;
  type: "Payment" | "Expense";
  name: string;
  description?: string;
  amount: number;
  date: string;
  status?: string;
};

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const {
    data: paymentsData,
    loading: paymentsLoading,
    error: paymentsError,
  } = useQuery(GET_PAYMENTS, {
    variables: { first: 50 },
    fetchPolicy: "cache-and-network",
  });

  const {
    data: expensesData,
    loading: expensesLoading,
    error: expensesError,
  } = useQuery(GET_EXPENSES, {
    variables: { first: 50 },
    fetchPolicy: "cache-and-network",
  });

  const paymentReports: Report[] = useMemo(() => {
    return (
      paymentsData?.paymentsCollection?.edges.map((edge: any) => ({
        id: edge.node.id,
        type: "Payment",
        name: edge.node.tenant_name || "Unknown Tenant",
        amount: edge.node.amount,
        date: edge.node.date_from,
        description: `Billing period: ${edge.node.date_from} - ${edge.node.date_to}`,
        status: edge.node.status,
      })) || []
    );
  }, [paymentsData]);

  const expenseReports: Report[] = useMemo(() => {
    return (
      expensesData?.expensesCollection?.edges.map((edge: any) => ({
        id: edge.node.id,
        type: "Expense",
        name: "Expense",
        amount: edge.node.amount,
        date: edge.node.date,
        description: edge.node.description,
      })) || []
    );
  }, [expensesData]);

  const filteredReports = useMemo(() => {
    const reports: Report[] = [...paymentReports, ...expenseReports];

    const searchLower = search.toLowerCase();
    return reports.filter((report) => {
      const matchesSearch =
        report.type.toLowerCase().includes(searchLower) ||
        report.name.toLowerCase().includes(searchLower) ||
        (report.description?.toLowerCase().includes(searchLower) ?? false);

      const reportDate = moment(report.date);
      const inDateRange =
        (!dateFrom ||
          reportDate.isSameOrAfter(moment(dateFrom).startOf("day"))) &&
        (!dateTo || reportDate.isSameOrBefore(moment(dateTo).endOf("day")));

      return matchesSearch && inDateRange;
    });
  }, [paymentReports, expenseReports, search, dateFrom, dateTo]);

  const downloadExcel = () => {
    const sheetData = filteredReports.map((r) => ({
      Type: r.type,
      Name: r.name,
      Description: r.description ?? "-",
      Amount: r.amount,
      Status: r.status ?? "-",
      Date: moment(r.date).format("MMM DD, YYYY"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, "reports.xlsx");
  };

  const isLoading = paymentsLoading || expensesLoading;
  const isError = paymentsError || expensesError;

  // Skeleton component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );

  if (isError)
    return (
      <p className="p-6 text-red-500">
        Error: {paymentsError?.message || expensesError?.message}
      </p>
    );

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* Search */}
            <Input
              placeholder="Search by tenant, type, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm min-h-[50px] text-white placeholder-gray-400 border-gray-700 focus:ring-gray-500 focus:border-gray-500 bg-transparent"
            />

            <div className="flex items-center gap-2">
              {/* From Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="w-[200px] min-h-[50px] justify-start text-left text-black border border-gray-700 rounded-lg bg-transparent hover:bg-transparent">
                    {dateFrom
                      ? moment(dateFrom).format("MMM DD, YYYY")
                      : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <span className="mx-2 text-black">to</span>

              {/* To Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="w-[200px] min-h-[50px] justify-start text-left text-black border border-gray-700 rounded-lg bg-transparent hover:bg-transparent">
                    {dateTo ? moment(dateTo).format("MMM DD, YYYY") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Clear Filters */}
              {(dateFrom || dateTo || search) && (
                <Button
                  variant="outline"
                  className="text-gray-400 hover:text-white border-gray-700 min-h-[50px]"
                  onClick={() => {
                    setDateFrom(undefined);
                    setDateTo(undefined);
                    setSearch("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <Button
              className="w-full md:w-auto min-h-[50px] flex items-center justify-center gap-2 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition"
              onClick={downloadExcel}
            >
              Download Excel
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Tenant/Expense</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">{report.type}</td>
                      <td className="px-4 py-3">{report.name}</td>
                      <td className="px-4 py-3">{report.description ?? "-"}</td>
                      <td className="px-4 py-3">
                        ₱{report.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{report.status ?? "-"}</td>
                      <td className="px-4 py-3">
                        {moment(report.date).format("MMM DD, YYYY")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No reports found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
