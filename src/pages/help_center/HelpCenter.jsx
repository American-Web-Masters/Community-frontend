import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/ui/Header";
import { getAllFaqs } from "../../api/faqs";
import {
  HelpCenterAccordionItem,
  HelpCenterCategoryTabs,
  HelpCenterForumTab,
  HelpCenterLiveTab,
  HelpCenterMainTabs,
  HelpCenterSearchTab,
} from "./subcomponents";

const HelpCenter = () => {
  const [activeMainTab, setActiveMainTab] = useState("FAQ's");
  const [activeCategoryTab, setActiveCategoryTab] = useState("All");
  const [openItemId, setOpenItemId] = useState(null);
  const [faqItems, setFaqItems] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState("");

  const mainTabs = useMemo(() => ["FAQ's", "Forum", "Search", "Live"], []);
  const categoryTabs = useMemo(() => ["All", "Notification", "Communities", "Profile"], []);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        setFaqLoading(true);
        setFaqError("");

        const data = await getAllFaqs();
        console.log("Raw FAQ data:", data);

        const source = data?.data?.faqs

        const normalizedFaqs = Array.isArray(source)
          ? source.map((faq) => ({
              id: faq._id || faq.id,
              category: (faq.category || "").toLowerCase(),
              title: faq.question || "Untitled question",
              answer: faq.answeres || "",
            }))
          : [];

        setFaqItems(normalizedFaqs);
        setOpenItemId(normalizedFaqs[0]?.id || null);
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
        setFaqError("Failed to load FAQs. Please try again.");
      } finally {
        setFaqLoading(false);
      }
    };

    loadFaqs();
  }, []);

  const normalizedCategoryTab = useMemo(() => {
    return activeCategoryTab.toLowerCase();
  }, [activeCategoryTab]);

  const filteredFaqItems = useMemo(() => {
    if (normalizedCategoryTab === "all") {
      return faqItems;
    }

    const categoryAliases = {
      notification: ["notification", "notifications"],
      communities: ["community", "communities"],
      profile: ["profile"],
    };

    const allowed = categoryAliases[normalizedCategoryTab] || [normalizedCategoryTab];

    return faqItems.filter((faq) => allowed.includes((faq.category || "").toLowerCase()));
  }, [faqItems, normalizedCategoryTab]);

  return (
    <div className="min-h-screen light-background overflow-x-hidden pb-10">
      <Header showNotification={true} showFilter={true} showSearch={true} showLogout={false} />

      <div className="px-3 mt-5">
        <h1 className="text-[18px] text-[#102b56] font-medium">Help Center</h1>

        <div className="mt-4">
          <HelpCenterMainTabs
            tabs={mainTabs}
            activeTab={activeMainTab}
            onTabChange={setActiveMainTab}
          />
        </div>

        {activeMainTab === "Forum" ? (
          <HelpCenterForumTab />
        ) : activeMainTab === "Search" ? (
          <HelpCenterSearchTab />
        ) : activeMainTab === "Live" ? (
          <HelpCenterLiveTab />
        ) : (
          <>
            <div className="mt-4">
              <HelpCenterCategoryTabs
                tabs={categoryTabs}
                activeTab={activeCategoryTab}
                onTabChange={setActiveCategoryTab}
              />
            </div>

            <section className="mt-5 space-y-3">
              {faqLoading ? (
                <article className="rounded-md border border-[#d6e8fa] bg-white/95 px-4 py-5 text-[#12356c]">
                  Loading FAQs...
                </article>
              ) : faqError ? (
                <article className="rounded-md border border-[#f6caca] bg-white/95 px-4 py-5 text-red-600">
                  {faqError}
                </article>
              ) : filteredFaqItems.length === 0 ? (
                <article className="rounded-md border border-[#d6e8fa] bg-white/95 px-4 py-5 text-[#12356c]">
                  No FAQs found for this category.
                </article>
              ) : (
                filteredFaqItems.map((item) => (
                  <HelpCenterAccordionItem
                    key={item.id}
                    item={item}
                    isOpen={openItemId === item.id}
                    onToggle={() => setOpenItemId((prev) => (prev === item.id ? null : item.id))}
                  />
                ))
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
