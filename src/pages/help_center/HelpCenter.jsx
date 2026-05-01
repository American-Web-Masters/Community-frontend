import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Header from "../../components/ui/Header";
import { getAllFaqs, reactToFaq } from "../../api/faqs";
import { selectUser, selectUserId } from "../../store/userSlice";
import TawkChat from "../../components/tawk_to/TawkChat";
import { openTawk } from "../../services/tawkService";
import toast from "react-hot-toast";
import {
  HelpCenterAccordionItem,
  HelpCenterCategoryTabs,
  HelpCenterForumTab,
  HelpCenterLiveTab,
  HelpCenterMainTabs,
} from "./subcomponents";

const HelpCenter = () => {
  const currentUserId = useSelector(selectUserId);
  const currentUser = useSelector(selectUser);
  const [activeMainTab, setActiveMainTab] = useState("FAQ's");
  const [activeCategoryTab, setActiveCategoryTab] = useState("All");
  const [liveChatEnabled, setLiveChatEnabled] = useState(false);
  const [openItemId, setOpenItemId] = useState(null);
  const [faqItems, setFaqItems] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState("");
  const [reactingFaqId, setReactingFaqId] = useState(null);

  const mainTabs = useMemo(() => ["FAQ's", "Forum", "Live"], []);
  const categoryTabs = useMemo(() => ["All", "Notification", "Communities", "Profile"], []);

  useEffect(() => {
    if (activeMainTab !== "Live" && liveChatEnabled) {
      setLiveChatEnabled(false);
    }
  }, [activeMainTab, liveChatEnabled]);

  const handleStartLiveChat = () => {
    setLiveChatEnabled(true);
    openTawk();
  };

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        setFaqLoading(true);
        setFaqError("");

        const data = await getAllFaqs();
        console.log("Raw FAQ data:", data);

        const source = data?.data?.faqs

        const toId = (value) => {
          if (!value) return null;
          if (typeof value === "string") return value;
          if (typeof value === "object") {
            return value._id || value.id || null;
          }
          return null;
        };

        const getReactionTypeForUser = (faq) => {
          const normalizedUserId = String(currentUserId || "");
          if (!normalizedUserId) return null;

          const useful = Array.isArray(faq?.useful) ? faq.useful : [];
          const notUseful = Array.isArray(faq?.notUseful) ? faq.notUseful : [];

          const hasUseful = useful.some((entry) => String(toId(entry) || "") === normalizedUserId);
          if (hasUseful) return "useful";

          const hasNotUseful = notUseful.some((entry) => String(toId(entry) || "") === normalizedUserId);
          if (hasNotUseful) return "notUseful";

          return null;
        };

        const normalizedFaqs = Array.isArray(source)
          ? source.map((faq) => ({
              id: faq._id || faq.id,
              category: (faq.category || "").toLowerCase(),
              title: faq.question || "Untitled question",
              answer: faq.answer || faq.answeres || "",
              usefulCount: typeof faq.usefulCount === "number" ? faq.usefulCount : Array.isArray(faq.useful) ? faq.useful.length : 0,
              notUsefulCount:
                typeof faq.notUsefulCount === "number"
                  ? faq.notUsefulCount
                  : Array.isArray(faq.notUseful)
                    ? faq.notUseful.length
                    : 0,
              userReaction: getReactionTypeForUser(faq),
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
  }, [currentUserId]);

  const handleFaqReaction = async (faqId, reactionType) => {
    const previousItems = faqItems;
    const targetFaq = faqItems.find((faq) => faq.id === faqId);

    if (!targetFaq) return;

    const previousReaction = targetFaq.userReaction;
    const isSameReaction = previousReaction === reactionType;

    const optimisticItems = faqItems.map((faq) => {
      if (faq.id !== faqId) return faq;

      if (isSameReaction) {
        return faq;
      }

      const next = { ...faq, userReaction: reactionType };

      if (reactionType === "useful") {
        next.usefulCount = (faq.usefulCount || 0) + 1;
        next.notUsefulCount = Math.max(0, (faq.notUsefulCount || 0) - (previousReaction === "notUseful" ? 1 : 0));
      } else {
        next.notUsefulCount = (faq.notUsefulCount || 0) + 1;
        next.usefulCount = Math.max(0, (faq.usefulCount || 0) - (previousReaction === "useful" ? 1 : 0));
      }

      return next;
    });

    if (!isSameReaction) {
      setFaqItems(optimisticItems);
    }

    setReactingFaqId(faqId);
    try {
      await reactToFaq(faqId, reactionType);
      toast.success(reactionType === "useful" ? "Marked as useful" : "Marked as not useful");
    } catch (error) {
      console.error("Failed to react to FAQ:", error);
      if (!isSameReaction) {
        setFaqItems(previousItems);
      }
      toast.error(error?.response?.data?.message || "Failed to save your reaction");
    } finally {
      setReactingFaqId(null);
    }
  };

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
      <TawkChat user={currentUser} enabled={activeMainTab === "Live" && liveChatEnabled} />
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
        ) : activeMainTab === "Live" ? (
          <HelpCenterLiveTab onStartChat={handleStartLiveChat} />
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
                    onReact={handleFaqReaction}
                    isReacting={reactingFaqId === item.id}
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
