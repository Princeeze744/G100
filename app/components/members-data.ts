// ============================================================
// G100 MEMBERS - edit this file to update the site.
// photo is OPTIONAL - members without one get an initials badge.
// Put photos in: public/members/  then use "/members/name.jpg"
// accent: "eye" (amber) | "ember" (coral) | "surf" (teal)
// ============================================================

export type Member = {
  id: string;
  name: string;
  role: string;
  city: string;
  line: string;
  accent: "eye" | "ember" | "surf";
  photo?: string;
};

export const MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Quin Favour",
    role: "Visionary Leader",
    city: "Port Harcourt",
    line: "Grace in the walk, fire in the vision.",
    accent: "eye",
    photo: "/members/favour-1.jpg",
  },
  {
    id: "m2",
    name: "Joeling",
    role: "Visionary Leader",
    city: "Port Harcourt",
    line: "Culture is a crown - wear it boldly.",
    accent: "ember",
    photo: "/members/joeling.jpg",
  },
  {
    id: "m3",
    name: "Emeka N.",
    role: "Software Engineer",
    city: "Abuja",
    line: "Build quietly. Ship loudly.",
    accent: "surf",
  },
  {
    id: "m4",
    name: "Adaeze O.",
    role: "Product Designer",
    city: "Lagos",
    line: "Design is how we love people at scale.",
    accent: "eye",
  },
  {
    id: "m5",
    name: "Ngozi E.",
    role: "Medical Doctor",
    city: "Enugu",
    line: "Healing hands, eagle eyes.",
    accent: "surf",
  },
  {
    id: "m6",
    name: "Ifeanyi C.",
    role: "Financial Analyst",
    city: "Port Harcourt",
    line: "Discipline today, freedom tomorrow.",
    accent: "ember",
  },
  {
    id: "m7",
    name: "Blessing U.",
    role: "Content Creator",
    city: "Uyo",
    line: "Stories move people. People move the world.",
    accent: "eye",
  },
  {
    id: "m8",
    name: "Segun F.",
    role: "Civil Engineer",
    city: "Eket",
    line: "We build things that outlive us.",
    accent: "surf",
  },
];

