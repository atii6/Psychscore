import React from "react";
import CustomContentCard from "../shared/CustomContentCard";
import { CreditCard, Download } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const billingHistory = [
  {
    date: "2025-01-15",
    amount: "$49.00",
    status: "Paid",
    invoice: "INV-2025-001",
  },
  {
    date: "2024-12-15",
    amount: "$49.00",
    status: "Paid",
    invoice: "INV-2024-012",
  },
  {
    date: "2024-11-15",
    amount: "$49.00",
    status: "Paid",
    invoice: "INV-2024-011",
  },
];

function BillingHistoryCard() {
  return (
    <CustomContentCard
      title="Billing History"
      Icon={CreditCard}
      iconProps={{ className: "w-5 h-5 text-green-600" }}
      cardStyles="border"
    >
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left font-medium">Date</th>
              <th className="p-3 text-left font-medium">Amount</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {billingHistory.map((item) => (
              <tr key={item.invoice} className="border-t">
                <td className="p-3">{item.date}</td>
                <td className="p-3">{item.amount}</td>
                <td className="p-3">
                  <Badge
                    variant="outline"
                    className="text-green-700 bg-green-50 border-green-200"
                  >
                    {item.status}
                  </Badge>
                </td>
                <td className="p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> {item.invoice}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CustomContentCard>
  );
}

export default BillingHistoryCard;
