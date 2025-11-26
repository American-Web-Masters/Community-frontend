  export const mockPrayerCards = [
    {
      id: 1,
      user: { name: "David Park" },
      timeAgo: "2 min",
      urgency: "Urgent",
      prayerText:
        "Please pray for my grandmother who is in the hospital. She has been struggling with her health and the doctors are running more tests. Our family is really worried and we could use all the prayers we can get during this difficult time. The doctors say the next 48 hours are critical.",
      status: null,
      communities: ["Church Group", "Prayer Group", "Family Prayer"],
      mood: "😢",
      timeline: [
        { user: "Micheal R.", action: "Read", time: "3h ago" },
        { user: "John Ray", action: "Read", time: "3h ago" }
      ],
      comments: [
        { 
          user: "Michael Chen", 
          text: "Praying for your grandmother and your whole family. May God grant her healing and peace.", 
          time: "2 hours ago",
          reactions: { "🙏": 5, "♥️": 3 }
        },
        { 
          user: "Sarah Williams", 
          text: "Sending love and prayers your way. God is faithful and will see you through this difficult time.", 
          time: "1 hour ago",
          reactions: { "🙏": 8, "♥️": 2, "😇": 1 }
        },
        { 
          user: "Pastor John", 
          text: "Our whole church is praying for your grandmother's healing. Trust in the Lord's plan.", 
          time: "45 minutes ago",
          reactions: { "🙏": 12, "♥️": 5, "🎉": 1 }
        }
      ]
    }
  ];