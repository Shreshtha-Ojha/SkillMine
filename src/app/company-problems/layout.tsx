import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company-wise DSA Questions | SkillMine - Top Companies LeetCode Problems",
  description:
    "Access company-wise DSA and LeetCode problems from top companies like Google, Amazon, Microsoft, Meta, Apple, Netflix, Adobe, Goldman Sachs, Uber, and more. Prepare for your coding interviews with frequently asked questions and acceptance rates.",
  keywords:
    "company-wise questions, DSA questions, LeetCode problems, Google interview questions, Amazon coding questions, Microsoft interview prep, Meta interview problems, FAANG interview preparation, coding interview, technical interview, software engineer interview, data structures, algorithms",
  
  authors: [
    {
      name: "SkillMine",
      url: "https://skillminelearn.vercel.app",
    },
  ],

  robots: "index, follow",

  openGraph: {
    title: "Company-wise DSA Questions | SkillMine",
    description:
      "450+ companies' LeetCode problems with frequency data. Prepare for Google, Amazon, Microsoft, Meta, Apple interviews and more. Get curated coding interview questions.",
    images: [
      {
        url: "/official_logo.png",
        width: 1200,
        height: 630,
        alt: "SkillMine - Company-wise DSA Questions",
      },
    ],
    url: "https://skillminelearn.vercel.app/company-problems",
    type: "website",
    siteName: "SkillMine",
  },

  twitter: {
    card: "summary_large_image",
    title: "Company-wise DSA Questions | SkillMine",
    description:
      "450+ companies' LeetCode problems. Prepare for FAANG and top tech company interviews.",
    images: ["/official_logo.png"],
  },
};

export default function CompanyProblemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
