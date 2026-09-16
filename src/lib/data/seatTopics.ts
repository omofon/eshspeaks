/**
 * The Seat's topics/threads have no backend yet (`/seat/topics*` is
 * specced but not built, see CMS-BACKEND-REQUESTS-2 B1) — this is the
 * same static dataset the prototype (topics.html / thread.html) used,
 * shared here so /topics and /thread/[id] read one source instead of two
 * copies drifting apart.
 */

export interface SeatReply {
  name: string;
  time: string;
  text: string;
  likes: number;
  replies?: SeatReply[];
}

export interface SeatTopic {
  id: string;
  category: string;
  color: string;
  tag: string;
  title: string;
  startedBy: string;
  lastActive: string;
  followers: number;
  order: number;
  replies: SeatReply[];
}

export const SEAT_TOPICS: SeatTopic[] = [
  {
    id: "housing-policy",
    category: "Politics and Governance",
    color: "var(--orange)",
    tag: "SET BY ESHOMOMOH",
    title: "Is the new housing policy built for people who actually need it, or for the headlines?",
    startedBy: "Eshomomoh",
    lastActive: "20m ago",
    followers: 1204,
    order: 1,
    replies: [
      {
        name: "Adaeze P.",
        time: "2h ago",
        text: "The housing policy piece missed the enforcement gap entirely. Rules mean nothing without teeth. Who's actually tracking whether allocations reach the people they're meant for?",
        likes: 84,
        replies: [
          {
            name: "Tunde B.",
            time: "1h ago",
            text: "Fair, but enforcement is a state-level problem too. Federal policy can only do so much if states don't follow through.",
            likes: 31,
          },
        ],
      },
      {
        name: "Kelechi O.",
        time: "48m ago",
        text: "Nobody's talking about how this affects the informal sector. That's most of the country, and the policy barely mentions them.",
        likes: 56,
      },
      {
        name: "Chioma N.",
        time: "20m ago",
        text: "Genuinely curious what the enforcement budget line looks like. Has anyone actually seen it published anywhere?",
        likes: 19,
      },
    ],
  },
  {
    id: "border-gaps",
    category: "Security Watch",
    color: "var(--red)",
    tag: "TIED TO THE NEWS",
    title: "Security Watch: who's accountable for border gaps?",
    startedBy: "Colouresh Desk",
    lastActive: "1h ago",
    followers: 612,
    order: 3,
    replies: [
      {
        name: "Musa Danjuma",
        time: "3h ago",
        text: "The reporting keeps naming agencies but never a single accountable office. That's the actual story.",
        likes: 47,
      },
      {
        name: "Grace Ekanem",
        time: "2h ago",
        text: "Border communities have been saying this for years. Glad it's finally getting national attention.",
        likes: 38,
        replies: [
          {
            name: "Ibrahim Sule",
            time: "1h ago",
            text: "Attention is not the same as funding though. Let's see what the next budget cycle actually allocates.",
            likes: 22,
          },
        ],
      },
    ],
  },
  {
    id: "naira-strength",
    category: "Business and Economy",
    color: "var(--green)",
    tag: "COMMUNITY SUBMITTED",
    title: "Naira strength, real or PR?",
    startedBy: "Folake Adeyemi",
    lastActive: "40m ago",
    followers: 889,
    order: 2,
    replies: [
      {
        name: "Samuel Dogo",
        time: "4h ago",
        text: "The parallel market rate says one thing, the official rate says another. Which one are we actually supposed to trust?",
        likes: 61,
      },
      {
        name: "Amina Yusuf",
        time: "2h ago",
        text: "It's stabilised, not strengthened. Those are two very different claims being conflated in the coverage.",
        likes: 44,
      },
    ],
  },
  {
    id: "budget-defense",
    category: "Politics and Governance",
    color: "var(--orange)",
    tag: "TIED TO THE NEWS",
    title: "Budget defense reactions: did the National Assembly actually push back?",
    startedBy: "Colouresh Desk",
    lastActive: "3h ago",
    followers: 405,
    order: 5,
    replies: [
      {
        name: "Bola Aderinto",
        time: "5h ago",
        text: "The questioning was sharper than usual this cycle. Whether it changes anything is a different matter.",
        likes: 29,
      },
    ],
  },
  {
    id: "fuel-subsidy-return",
    category: "Business and Economy",
    color: "var(--green)",
    tag: "COMMUNITY SUBMITTED",
    title: "Is the subsidy conversation quietly coming back?",
    startedBy: "Chidi Umeh",
    lastActive: "6h ago",
    followers: 733,
    order: 6,
    replies: [
      {
        name: "Ngozi Eze",
        time: "8h ago",
        text: "Every time pump prices move, this conversation resurfaces. It never really left.",
        likes: 52,
      },
    ],
  },
  {
    id: "transfer-window",
    category: "Sports",
    color: "var(--green)",
    tag: "SET BY ESHOMOMOH",
    title: "The midfield gamble that's dividing Super Eagles fans",
    startedBy: "Eshomomoh",
    lastActive: "1d ago",
    followers: 958,
    order: 7,
    replies: [
      {
        name: "Emeka Nwachukwu",
        time: "1d ago",
        text: "Bold call, but it's the right one if it pays off before the next qualifiers.",
        likes: 73,
      },
      {
        name: "Hauwa Bala",
        time: "20h ago",
        text: "I need to see it in a real match before I trust it. Friendlies don't count.",
        likes: 41,
      },
    ],
  },
  {
    id: "ai-jobs-nigeria",
    category: "Technology",
    color: "var(--purple)",
    tag: "COMMUNITY SUBMITTED",
    title: "Will AI actually cost Nigerian tech jobs, or create the next wave of them?",
    startedBy: "Adaeze Okonkwo",
    lastActive: "2d ago",
    followers: 1120,
    order: 8,
    replies: [
      {
        name: "Tunde Bakare-Ojo",
        time: "2d ago",
        text: "Depends entirely on whether training keeps pace. Right now it isn't.",
        likes: 66,
      },
    ],
  },
  {
    id: "afrobeats-global",
    category: "Entertainment and Lifestyle",
    color: "var(--purple)",
    tag: "TIED TO THE NEWS",
    title: "Afrobeats to Amapiano: the crossover nobody saw coming",
    startedBy: "Colouresh Desk",
    lastActive: "5h ago",
    followers: 1560,
    order: 4,
    replies: [
      {
        name: "Kelechi Obi",
        time: "6h ago",
        text: "This has been building for two years. It just finally broke into the mainstream conversation.",
        likes: 97,
      },
    ],
  },
];

export const getSeatTopic = (id: string) => SEAT_TOPICS.find((t) => t.id === id);

export const countReplies = (t: SeatTopic) =>
  t.replies.reduce((sum, r) => sum + 1 + (r.replies?.length ?? 0), 0);

export const AVATAR_COLORS = [
  "var(--orange)",
  "var(--purple)",
  "var(--green)",
  "var(--red)",
  "var(--yellow-deep)",
];

export const colorForIndex = (i: number) => AVATAR_COLORS[i % AVATAR_COLORS.length]!;

export const initialsFor = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
