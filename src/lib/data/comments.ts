import type { Comment, User } from "./types";

export const mockComments: Comment[] = [
  {
    id: "c1",
    articleSlug: "*",
    author: "Chidi Umeh",
    initials: "CU",
    time: "2 hours ago",
    body: "The thirty-day reporting requirement is the only part of this with teeth. Everything before it has been tried and quietly abandoned twice already.",
    replies: [
      {
        id: "c1r1",
        articleSlug: "*",
        author: "Amina Yusuf",
        initials: "AY",
        time: "1 hour ago",
        body: "Agreed, though the last two attempts were not tied to a disbursement cycle. That is a genuine difference.",
      },
    ],
  },
  {
    id: "c2",
    articleSlug: "*",
    author: "Bola Aderinto",
    initials: "BA",
    time: "5 hours ago",
    body: "Would like to see the actual implementation notes when they are filed. Reporting on the summary is fine but the detail is where the disagreement lives.",
    replies: [],
  },
  {
    id: "c3",
    articleSlug: "*",
    author: "Grace Ekanem",
    initials: "GE",
    time: "Yesterday",
    body: "Useful piece. The state-level split described here matches what our team is seeing in the southeast, especially on the consultation timeline.",
    replies: [
      {
        id: "c3r1",
        articleSlug: "*",
        author: "Musa Danjuma",
        initials: "MD",
        time: "Yesterday",
        body: "Same in the northwest. The assemblies were not briefed until after the fact.",
      },
    ],
  },
];

export const mockUser: User = {
  name: "Adebayo Ogunleye",
  email: "adebayo.ogunleye@example.com",
  tier: "free",
  state: "Lagos",
  joined: "March 2025",
};

export const mockCommentHistory = [
  {
    id: "h1",
    articleTitle: "Naira steadies after CBN clears backlog of matured forward contracts",
    time: "3 days ago",
    body: "The clearing was necessary but the signal matters more than the mechanics here.",
  },
  {
    id: "h2",
    articleTitle: "Kaduna corridor attacks fall for a third month, but displacement persists",
    time: "1 week ago",
    body: "Displacement figures rarely move at the same pace as incident counts. Worth separating the two.",
  },
  {
    id: "h3",
    articleTitle: "Supreme Court reserves judgment in local government autonomy suit",
    time: "2 weeks ago",
    body: "Whatever the ruling, enforcement is the open question.",
  },
];
