import CustomContentCard from "../shared/CustomContentCard";
import { Crown } from "lucide-react";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { Button } from "../ui/button";

export const subscriptionData = {
  plan: "Professional",
  status: "Active",
  cost: "$49",
  billing_period: "monthly",
  next_billing_date: "2025-02-15",
  assessments_this_month: 12,
  assessment_limit: 100,
  storage_used: "2.4 GB",
  storage_limit: "10 GB",
};

function SubscriptionCard() {
  return (
    <CustomContentCard
      title="Subscription Plan"
      Icon={Crown}
      iconProps={{ className: "w-5 h-5 text-yellow-500" }}
      cardStyles="border"
    >
      <div className="flex justify-between items-start p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div>
          <Badge className="bg-blue-600 text-white">
            {subscriptionData.plan}
          </Badge>
          <p className="text-3xl font-bold mt-2">
            {subscriptionData.cost}
            <span className="text-lg font-normal text-gray-600">/month</span>
          </p>
          <p className="text-sm text-green-600 font-medium">
            Status: {subscriptionData.status}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Next billing date:</p>
          <p className="font-medium">
            {format(
              new Date(subscriptionData.next_billing_date),
              "MMMM d, yyyy"
            )}
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              Cancel Subscription
            </Button>
            <Button size="sm">Upgrade Plan</Button>
          </div>
        </div>
      </div>
    </CustomContentCard>
  );
}

export default SubscriptionCard;
