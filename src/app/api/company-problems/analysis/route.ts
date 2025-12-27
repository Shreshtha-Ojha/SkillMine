import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

connect();

// Helper to get user from request
async function getUserFromRequest(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get("token")?.value;
    if (!cookieToken) return null;
    const decoded = jwt.verify(cookieToken, process.env.TOKEN_SECRET!) as { id: string };
    const user = await User.findById(decoded.id);
    return user;
  } catch (error) {
    return null;
  }
}

// Fetch all companies list and then compute frequency of problem titles across companies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = Math.min(100, Math.max(10, parseInt(searchParams.get('perPage') || '25', 10)));
    const titleQuery = searchParams.get('title')?.toLowerCase() || null;

    // All users can access analysis (paywall removed)

    // Fetch list of companies
    const response = await fetch(
      "https://api.github.com/repos/liquidslr/leetcode-company-wise-problems/contents",
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
    }

    const data = await response.json();
    const companies = data
      .filter((item: any) => item.type === "dir" && !item.name.startsWith("."))
      .map((item: any) => item.name);

    // If titleQuery is provided, provide drill-down details for that title
    if (titleQuery) {
      const occurrences: any[] = [];

      await Promise.all(
        companies.map(async (companyName: string) => {
          const urls = [
            `https://raw.githubusercontent.com/liquidslr/leetcode-company-wise-problems/main/${companyName}/5.%20All.csv`,
            `https://raw.githubusercontent.com/liquidslr/leetcode-company-wise-problems/main/${companyName}/All.csv`
          ];

          let csvText = "";
          for (const url of urls) {
            try {
              const res = await fetch(url, { next: { revalidate: 86400 } });
              if (res.ok) { csvText = await res.text(); break; }
            } catch (err) { }
          }

          if (!csvText) return;

          const lines = csvText.trim().split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            const parts = line.includes('\t') ? line.split('\t') : line.split(',');
            if (parts.length < 2) continue;
            const rawTitle = parts[1]?.trim();
            if (!rawTitle) continue;
            const title = rawTitle.replace(/^\"|\"$/g, "").toLowerCase();
            if (title !== titleQuery) continue;

            const difficulty = (parts[0] || '').trim().toUpperCase();
            const frequencyRaw = (parts[2] || '').trim();
            const acceptanceRaw = (parts[3] || '').trim();
            const link = (parts[4] && parts[4].trim()) || `https://leetcode.com/problems/${rawTitle.toLowerCase().replace(/\s+/g, "-")}`;

            occurrences.push({ company: companyName, difficulty, frequency: frequencyRaw, acceptance: acceptanceRaw, link });
          }
        })
      );

      return NextResponse.json({ title: titleQuery, occurrences, count: occurrences.length }, { status: 200 });
    }

    // Otherwise compute aggregated top questions (with optional search + pagination)
    const titleMap = new Map<string, { count: number; companies: Set<string>; sampleLink?: string }>();

    await Promise.all(
      companies.map(async (companyName: string) => {
        const urls = [
          `https://raw.githubusercontent.com/liquidslr/leetcode-company-wise-problems/main/${companyName}/5.%20All.csv`,
          `https://raw.githubusercontent.com/liquidslr/leetcode-company-wise-problems/main/${companyName}/All.csv`
        ];

        let csvText = "";
        for (const url of urls) {
          try {
            const res = await fetch(url, { next: { revalidate: 86400 } });
            if (res.ok) { csvText = await res.text(); break; }
          } catch (err) { }
        }

        if (!csvText) return;

        const lines = csvText.trim().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          const parts = line.includes('\t') ? line.split('\t') : line.split(',');
          if (parts.length < 2) continue;
          const rawTitle = parts[1]?.trim();
          if (!rawTitle) continue;
          const title = rawTitle.replace(/^\"|\"$/g, "");
          const key = title.toLowerCase();

          const link = (parts[4] && parts[4].trim()) || `https://leetcode.com/problems/${title.toLowerCase().replace(/\s+/g, "-")}`;

          if (!titleMap.has(key)) {
            titleMap.set(key, { count: 1, companies: new Set([companyName]), sampleLink: link });
          } else {
            const rec = titleMap.get(key)!;
            rec.count += 1;
            rec.companies.add(companyName);
          }
        }
      })
    );

    let topList = Array.from(titleMap.entries())
      .map(([k, v]) => ({ title: k, count: v.count, companies: Array.from(v.companies), link: v.sampleLink }))
      .sort((a, b) => b.count - a.count);

    if (search) {
      topList = topList.filter(t => t.title.includes(search));
    }

    const total = topList.length;
    const start = (Math.max(1, page) - 1) * perPage;
    const end = start + perPage;
    const paged = topList.slice(start, end);

    return NextResponse.json({ totalCompanies: companies.length, totalUniqueQuestions: titleMap.size, topQuestions: paged, page, perPage, total }, { status: 200 });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
