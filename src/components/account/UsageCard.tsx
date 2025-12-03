import { subscriptionData } from "./SubscriptionCard";
import CustomContentCard from "../shared/CustomContentCard";
import { HardDrive } from "lucide-react";

function UsageCard() {
  return (
    <CustomContentCard
      title=" Current Usage"
      Icon={HardDrive}
      iconProps={{ className: "w-5 h-5 text-purple-600" }}
      contentContainerStyles="space-y-6"
      cardStyles="border"
    >
      <div>
        <div className="flex justify-between mb-1 text-sm">
          <span className="font-medium">Assessments This Month</span>
          <span className="text-gray-500">
            {subscriptionData.assessments_this_month} /{" "}
            {subscriptionData.assessment_limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{
              width: `${
                (subscriptionData.assessments_this_month /
                  subscriptionData.assessment_limit) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1 text-sm">
          <span className="font-medium">Storage Used</span>
          <span className="text-gray-500">
            {subscriptionData.storage_used} / {subscriptionData.storage_limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full"
            style={{ width: "24%" }}
          ></div>
        </div>
      </div>
    </CustomContentCard>
  );
}

export default UsageCard;
