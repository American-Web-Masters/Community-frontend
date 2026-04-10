import React, { useMemo, useState } from "react";
import Header from "../../components/ui/Header";
import {
  HelpCenterAccordionItem,
  HelpCenterCategoryTabs,
  HelpCenterMainTabs,
} from "./subcomponents";

const HelpCenter = () => {
  const [activeMainTab, setActiveMainTab] = useState("FAQ's");
  const [activeCategoryTab, setActiveCategoryTab] = useState("All");
  const [openItemId, setOpenItemId] = useState(2);

  const mainTabs = useMemo(() => ["FAQ's", "Forum", "Search", "Live"], []);
  const categoryTabs = useMemo(() => ["All", "Notification", "Communities", "Profile"], []);

  const faqItems = useMemo(
    () => [
      {
        id: 1,
        title: "How do I reset my password?",
        answer:
          "Go to login and select Forgot Password. Follow the reset link sent to your email and create a new password.",
      },
      {
        id: 2,
        title: "How do I join a community?",
        answer:
          "Browse communities by tapping the \"Explore\" tab, then tap \"Join\" on any community that interests you. You can also search for specific communities using the search function.",
      },
      {
        id: 3,
        title: "How do I change my notification setting?",
        answer:
          "Open your profile settings, then go to Notifications to enable or disable journal and community alerts.",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen light-background overflow-x-hidden pb-10">
      <Header showNotification={true} showFilter={true} showSearch={true} showLogout={false} />

      <div className="px-2 mt-4">
        <h1 className="text-[15px] text-[#102b56] font-medium">Help Center</h1>

        <div className="mt-3">
          <HelpCenterMainTabs
            tabs={mainTabs}
            activeTab={activeMainTab}
            onTabChange={setActiveMainTab}
          />
        </div>

        <div className="mt-3">
          <HelpCenterCategoryTabs
            tabs={categoryTabs}
            activeTab={activeCategoryTab}
            onTabChange={setActiveCategoryTab}
          />
        </div>

        <section className="mt-4 space-y-2">
          {faqItems.map((item) => (
            <HelpCenterAccordionItem
              key={item.id}
              item={item}
              isOpen={openItemId === item.id}
              onToggle={() => setOpenItemId((prev) => (prev === item.id ? null : item.id))}
            />
          ))}
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
