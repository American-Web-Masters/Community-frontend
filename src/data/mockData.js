
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



    // Mock data for answered prayers - used as fallback
  export const mockAnsweredPrayers = [
    {
      id: 1,
      user: { name: "Maria Rodriguez" },
      timeAgo: "1 week ago",
      urgency: "Answered",
      prayerText: "ANSWERED PRAYER: My daughter got accepted into her dream college with a full scholarship! Thank you everyone for your prayers over the past year. God's timing is perfect!",
      status: "Answered",
      communities: ["Youth Group", "Education Ministry", "Family Prayer"],
      mood: "🎉",
      timeline: [
        { user: "College Advisor", action: "Celebrated", time: "1w ago" },
        { user: "Youth Pastor", action: "Celebrated", time: "1w ago" },
        { user: "Maria Rodriguez", action: "Marked Answered", time: "1w ago" }
      ],
      comments: [
        { 
          user: "Youth Pastor Mike", 
          text: "This is incredible! We've been praying for this for months. God is so faithful!", 
          time: "6 days ago",
          reactions: { "🙏": 25, "♥️": 18, "🎉": 20, "🎓": 12 }
        },
        { 
          user: "College Advisor Sarah", 
          text: "As someone who helped with applications, I can say this is truly a miracle. Praise God!", 
          time: "5 days ago",
          reactions: { "🙏": 15, "♥️": 10, "🎉": 8 }
        },
        { 
          user: "Community Member Lisa", 
          text: "I'm crying tears of joy! Your daughter deserves this blessing. So happy for your family!", 
          time: "4 days ago",
          reactions: { "🙏": 12, "♥️": 15, "😭": 6 }
        }
      ]
    },
    {
      id: 2,
      user: { name: "Robert Kim" },
      timeAgo: "2 weeks ago",
      urgency: "Answered",
      prayerText: "ANSWERED PRAYER: My father's heart surgery was successful and he's made a full recovery! The doctors said it was one of the smoothest operations they've performed. Thank you for all your emergency prayers!",
      status: "Answered",
      communities: ["Prayer Group", "Emergency Prayer Team", "Medical Ministry"],
      mood: "🙏",
      timeline: [
        { user: "Dr. Johnson", action: "Confirmed", time: "2w ago" },
        { user: "Prayer Team Lead", action: "Celebrated", time: "2w ago" },
        { user: "Robert Kim", action: "Marked Answered", time: "2w ago" }
      ],
      comments: [
        { 
          user: "Dr. Johnson", 
          text: "As his surgeon, I can attest that this recovery has been remarkable. Truly blessed.", 
          time: "12 days ago",
          reactions: { "🙏": 30, "♥️": 22, "🩺": 8, "👨‍⚕️": 5 }
        },
        { 
          user: "Prayer Team Lead", 
          text: "Our entire prayer team mobilized for this. Seeing God's healing power is always amazing!", 
          time: "10 days ago",
          reactions: { "🙏": 28, "♥️": 18, "✨": 10 }
        }
      ]
    },
    {
      id: 3,
      user: { name: "Jennifer and Michael Adams" },
      timeAgo: "3 weeks ago",
      urgency: "Answered",
      prayerText: "ANSWERED PRAYER: We found the perfect house within our budget after months of searching! The whole process went smoothly and we close next week. Thank you for praying for God's provision and wisdom!",
      status: "Answered",
      communities: ["Marriage Ministry", "Financial Peace", "New Beginnings"],
      mood: "🏠",
      timeline: [
        { user: "Real Estate Agent", action: "Celebrated", time: "3w ago" },
        { user: "Financial Counselor", action: "Celebrated", time: "3w ago" },
        { user: "Jennifer Adams", action: "Marked Answered", time: "3w ago" }
      ],
      comments: [
        { 
          user: "Real Estate Agent Tom", 
          text: "In 20 years of real estate, I've rarely seen everything fall into place so perfectly. Blessed!", 
          time: "18 days ago",
          reactions: { "🙏": 18, "♥️": 14, "🏠": 12, "✨": 6 }
        },
        { 
          user: "Financial Counselor Mary", 
          text: "Your patience and faith throughout this process has been inspiring. So happy for you both!", 
          time: "16 days ago",
          reactions: { "🙏": 15, "♥️": 12, "💰": 4 }
        }
      ]
    },
    {
      id: 4,
      user: { name: "Pastor John Mitchell" },
      timeAgo: "1 month ago",
      urgency: "Answered",
      prayerText: "ANSWERED PRAYER: Our church's mission trip to Honduras was incredibly successful! We built 3 homes, held 5 medical clinics, and saw 50 people accept Christ. Thank you for your prayers for safety, resources, and hearts to be opened!",
      status: "Answered",
      communities: ["Mission Ministry", "Global Outreach", "Church Leadership"],
      mood: "✝️",
      timeline: [
        { user: "Mission Team", action: "Celebrated", time: "1m ago" },
        { user: "Honduras Partner", action: "Celebrated", time: "1m ago" },
        { user: "Pastor John", action: "Marked Answered", time: "1m ago" }
      ],
      comments: [
        { 
          user: "Mission Team Leader Sarah", 
          text: "This trip exceeded all our expectations. God moved in mighty ways through our church family!", 
          time: "25 days ago",
          reactions: { "🙏": 35, "♥️": 28, "✝️": 20, "🌍": 15 }
        },
        { 
          user: "Honduras Partner Carlos", 
          text: "Your church blessed our community beyond measure. The families you helped will never forget this.", 
          time: "22 days ago",
          reactions: { "🙏": 40, "♥️": 32, "🏠": 12, "❤️‍🔥": 8 }
        }
      ]
    },
    {
      id: 5,
      user: { name: "Sarah Williams" },
      timeAgo: "5 weeks ago",
      urgency: "Answered",
      prayerText: "ANSWERED PRAYER: After 2 years of struggling with infertility, we're pregnant! The doctors said it was unlikely, but God had other plans. We're overwhelmed with gratitude for all your prayers and support!",
      status: "Answered",
      communities: ["Women's Ministry", "Family Prayer", "Couples Support"],
      mood: "👶",
      timeline: [
        { user: "Dr. Martinez", action: "Confirmed", time: "5w ago" },
        { user: "Women's Ministry", action: "Celebrated", time: "5w ago" },
        { user: "Sarah Williams", action: "Marked Answered", time: "5w ago" }
      ],
      comments: [
        { 
          user: "Dr. Martinez", 
          text: "After following Sarah's journey, this is truly a miracle. So happy to share this joy with you!", 
          time: "30 days ago",
          reactions: { "🙏": 45, "♥️": 38, "👶": 25, "✨": 18 }
        },
        { 
          user: "Women's Ministry Leader Anna", 
          text: "We've prayed over you so many times. This baby is already so loved by our entire community!", 
          time: "28 days ago",
          reactions: { "🙏": 40, "♥️": 35, "👶": 22, "😭": 15 }
        }
      ]
    }
  ];



    // Mock data for my prayers - used as fallback
  export const mockMyPrayers = [
    {
      id: 1,
      user: { name: "Arham" || "You" },
      timeAgo: "2 hours ago",
      urgency: "Normal",
      prayerText: "Please pray for my upcoming job interview. I've been preparing for weeks and I'm feeling nervous but hopeful.",
      status: "Draft",
      communities: ["Career Ministry", "Personal"],
      mood: "😰",
      timeline: [
        { user: "You", action: "Created", time: "2h ago" }
      ],
      comments: []
    },
    {
      id: 2,
      user: { name: "Ahad" || "You" },
      timeAgo: "1 day ago",
      urgency: "Urgent",
      prayerText: "Thank you all for your prayers! My grandmother's surgery went well and she's recovering nicely. God is faithful!",
      status: "Submitted",
      communities: ["Family Prayer", "Church Group"],
      mood: "🙏",
      timeline: [
        { user: "Pastor Mike", action: "Read", time: "1h ago" },
        { user: "Sarah K.", action: "Read", time: "3h ago" },
        { user: "You", action: "Submitted", time: "1d ago" }
      ],
      comments: [
        { 
          user: "Pastor Mike", 
          text: "Praise God! So wonderful to hear this testimony of His faithfulness.", 
          time: "20 hours ago",
          reactions: { "🙏": 8, "♥️": 5, "🎉": 3 }
        }
      ]
    },
    {
      id: 3,
      user: { name: "Ahad" || "You" },
      timeAgo: "3 days ago",
      urgency: "Low",
      prayerText: "Please pray for wisdom in making some important financial decisions for our family. We want to honor God with our choices.",
      status: "Scheduled",
      communities: ["Financial Peace", "Marriage Ministry"],
      mood: "🤔",
      timeline: [
        { user: "Financial Counselor", action: "Read", time: "2d ago" },
        { user: "You", action: "Scheduled", time: "3d ago" }
      ],
      comments: [
        { 
          user: "Financial Counselor Tom", 
          text: "Happy to pray for you both. Feel free to reach out if you need guidance.", 
          time: "2 days ago",
          reactions: { "🙏": 4, "♥️": 2 }
        }
      ]
    }
  ];
