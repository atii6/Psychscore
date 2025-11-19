import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type TabItems = {
  value: string;
  title: string;
  content: React.ReactNode;
};

type CustomTabsProps = {
  defaultValue: string;
  tabStyles?: string;
  tabs: TabItems[];
};

function CustomTabs({ defaultValue, tabs, tabStyles }: CustomTabsProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue={defaultValue}>
        <TabsList className={cn("grid w-full grid-cols-2 mb-6", tabStyles)}>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-sm font-medium"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default CustomTabs;
