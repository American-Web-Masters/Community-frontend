import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/userSlice';
import { fetchPrayerDetails } from '../../api/prayer';
import PrayerCard from '../../components/ui/PrayerCard';
import Header from '../../components/ui/Header';
import BottomNavBar from '../../components/ui/BottomNavBar';

const PrayerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [prayer, setPrayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getPrayer = async () => {
      try {
        setLoading(true);
        const data = await fetchPrayerDetails(id);
        if (data && data.data && data.data.prayer) {
          setPrayer(data.data.prayer);
        } else {
          setError("Prayer not found");
        }
      } catch (err) {
        console.error("Error fetching prayer details:", err);
        setError("Failed to load prayer");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      getPrayer();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen light-background overflow-hidden flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden mt-16 max-w-7xl mx-auto w-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !prayer) {
    return (
      <div className="min-h-screen light-background overflow-hidden flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden mt-16 max-w-7xl mx-auto w-full items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || "Prayer not found"}</h2>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    _id,
    user: prayerUser,
    content,
    communities,
    urgency,
    status,
    comments,
    shares,
    isPrayed,
    createdAt
  } = prayer;

  const timeAgo = new Date(createdAt).toLocaleDateString();

  return (
    <div className="min-h-screen light-background overflow-hidden flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden mt-16 pb-16 max-w-7xl mx-auto w-full justify-center">
        {/* Main Content */}
        <main className="flex-1 w-full max-w-[720px] mx-auto overflow-y-auto custom-scrollbar">
          <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8">
            <PrayerCard
              prayer={prayer}
              prayerId={_id}
              user={{
                name: prayerUser?.firstname ? `${prayerUser.firstname} ${prayerUser.lastname || ''}`.trim() : (prayerUser?.username || "Anonymous"),
                _id: prayerUser?._id,
                username: prayerUser?.username,
                email: prayerUser?.email,
              }}
              timeAgo={timeAgo}
              urgency={urgency || "Regular"}
              prayerText={content}
              status={status}
              communities={communities || []}
              comments={comments?.map(c => ({
                _id: c._id,
                user: c.user?.firstname || c.user?.name || "Anonymous",
                text: c.text,
                time: new Date(c.createdAt).toLocaleDateString(),
                reactions: c.reactions?.reduce((acc, curr) => {
                  acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                  return acc;
                }, {}),
                userReaction: c.reactions?.find(r => r.user?._id === user?._id || r.user === user?._id)?.emoji
              }))}
              tags={prayer.tags || []}
              isExpanded={true}
              isCommunityPrayer={false}
              isOwnerOrModerator={false}
              isPrayed={isPrayed?.some(p => p.user?._id === user?._id || p.user === user?._id)}
              prayerCount={isPrayed?.length || 0}
              isShared={shares?.some(s => s.user?._id === user?._id || s.user === user?._id)}
              shareCount={shares?.length || 0}
              showStatusPill={true}
            />
          </div>
        </main>
      </div>
      <BottomNavBar />
    </div>
  );
};

export default PrayerDetails;
