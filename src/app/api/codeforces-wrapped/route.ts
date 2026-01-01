import { NextRequest, NextResponse } from "next/server";
import { generateContentWithConfig } from "@/lib/gemini";

async function fetchCFData(handle: string) {
  // Fetch user info
  const userInfoRes = await fetch(
    `https://codeforces.com/api/user.info?handles=${handle}`
  );
  const userInfoData = await userInfoRes.json();

  if (userInfoData.status !== "OK") {
    throw new Error("User not found on Codeforces");
  }

  const user = userInfoData.result[0];

  // Fetch rating history
  const ratingRes = await fetch(
    `https://codeforces.com/api/user.rating?handle=${handle}`
  );
  const ratingData = await ratingRes.json();
  const ratings = ratingData.status === "OK" ? ratingData.result : [];

  // Fetch submissions
  const submissionsRes = await fetch(
    `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`
  );
  const submissionsData = await submissionsRes.json();
  const submissions = submissionsData.status === "OK" ? submissionsData.result : [];

  return { user, ratings, submissions };
}

function analyzeStats(data: { user: any; ratings: any[]; submissions: any[] }) {
  const { user, ratings, submissions } = data;
  const currentYear = new Date().getFullYear();

  // Filter 2024 data
  const ratings2024 = ratings.filter((r) => {
    const date = new Date(r.ratingUpdateTimeSeconds * 1000);
    return date.getFullYear() === currentYear;
  });

  const submissions2024 = submissions.filter((s) => {
    const date = new Date(s.creationTimeSeconds * 1000);
    return date.getFullYear() === currentYear;
  });

  // Rating change in 2024
  let ratingChange = 0;
  if (ratings2024.length > 0) {
    const firstRating = ratings2024[0].oldRating;
    const lastRating = ratings2024[ratings2024.length - 1].newRating;
    ratingChange = lastRating - firstRating;
  }

  // Contests participated
  const contestsParticipated = ratings2024.length;

  // Best/worst/avg rank
  let bestContestRank = Infinity;
  let worstContestRank = 0;
  let totalRank = 0;
  ratings2024.forEach((r) => {
    if (r.rank < bestContestRank) bestContestRank = r.rank;
    if (r.rank > worstContestRank) worstContestRank = r.rank;
    totalRank += r.rank;
  });
  const avgContestRank = contestsParticipated > 0 
    ? Math.round(totalRank / contestsParticipated) 
    : 0;
  if (bestContestRank === Infinity) bestContestRank = 0;

  // Problems solved (unique accepted)
  const solvedProblems = new Set<string>();
  const tagCounts: Record<string, number> = {};
  const difficultyCounts: Record<string, number> = {};
  let accepted = 0;
  let wrongAnswer = 0;
  let tle = 0;

  submissions2024.forEach((s) => {
    const problemId = `${s.problem.contestId}-${s.problem.index}`;
    
    if (s.verdict === "OK") {
      accepted++;
      if (!solvedProblems.has(problemId)) {
        solvedProblems.add(problemId);
        
        // Count tags
        s.problem.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
        
        // Count difficulty
        const rating = s.problem.rating || "unrated";
        difficultyCounts[rating] = (difficultyCounts[rating] || 0) + 1;
      }
    } else if (s.verdict === "WRONG_ANSWER") {
      wrongAnswer++;
    } else if (s.verdict === "TIME_LIMIT_EXCEEDED") {
      tle++;
    }
  });

  // Favorite tag
  const favoriteTag = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "implementation";

  // Solved by difficulty
  const solvedByDifficulty = Object.entries(difficultyCounts)
    .filter(([rating]) => rating !== "unrated")
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([rating, count]) => ({ rating, count }));

  return {
    handle: user.handle,
    rating: user.rating || 0,
    maxRating: user.maxRating || 0,
    rank: user.rank || "newbie",
    maxRank: user.maxRank || "newbie",
    contribution: user.contribution || 0,
    friendOfCount: user.friendOfCount || 0,
    avatar: user.avatar || user.titlePhoto,
    problemsSolved: solvedProblems.size,
    contestsParticipated,
    bestContestRank,
    worstContestRank,
    avgContestRank,
    ratingChange,
    favoriteTag,
    solvedByDifficulty,
    submissionStats: {
      total: submissions2024.length,
      accepted,
      wrongAnswer,
      tle,
    },
  };
}

async function generateCreativeContent(stats: any) {
  const prompt = `You are generating fun, engaging content for a Codeforces Wrapped (like Spotify Wrapped but for competitive programmers).

User's Codeforces stats:
- Handle: ${stats.handle}
- Rating: ${stats.rating} (${stats.rank})
- Max Rating: ${stats.maxRating} (${stats.maxRank})
- Problems Solved: ${stats.problemsSolved}
- Contests: ${stats.contestsParticipated}
- Best Rank: ${stats.bestContestRank}
- Rating Change: ${stats.ratingChange >= 0 ? '+' : ''}${stats.ratingChange}
- Favorite Tag: ${stats.favoriteTag}

Generate creative content in JSON format:
{
  "creativeTaglines": {
    "welcome": "Short welcome message about their CP journey",
    "rating": "Comment about their rating progress",
    "contests": "Comment about contest participation",
    "problems": "Comment about problem solving",
    "personality": "Fun personality assessment",
    "share": "Encouraging share message"
  },
  "funFacts": [
    "3 fun facts about their stats"
  ],
  "coderTitle": "A fun title like 'Rating Grinder', 'Contest Warrior', 'Problem Crusher' etc based on stats"
}

Be witty but not mean. Keep taglines under 80 characters. Be encouraging. Return ONLY valid JSON.`;

  try {
    const text = await generateContentWithConfig(prompt, {
      temperature: 0.85,
      maxOutputTokens: 1000,
    });

    // Ensure text is a string and extract JSON
    const textStr = typeof text === 'string' ? text : '';
    const jsonMatch = textStr?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn('Gemini returned invalid JSON for Codeforces Wrapped — falling back');
      }
    }
  } catch (error) {
    console.error("Gemini error:", error);
  }
  // Range-based, randomized fallback for Codeforces
  const solved = stats.problemsSolved || 0;
  const contests = stats.contestsParticipated || 0;
  const rating = stats.rating || 0;
  const change = stats.ratingChange || 0;
  const best = stats.bestContestRank || 0;
  const favorite = stats.favoriteTag || 'implementation';

  const choice = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  const welcome = () => {
    if (solved < 20) return choice([`${solved} solves — budding problem-solver.`, `Nice start with ${solved} problems — keep pushing!`]);
    if (solved < 100) return choice([`${solved} problems — you're making waves.`, `Solid: ${solved} solves this year.`]);
    return choice([`${solved} problems — CP legend in the making.`, `Incredible: ${solved} solves!`]);
  };

  const ratingBlurb = () => {
    if (rating < 1200) return choice([`Rating ${rating}: learning stage — climb ahead!`, `Rating ${rating} — hungry for improvement.`]);
    if (rating < 1600) return choice([`Rating ${rating}: solidly competent. Keep climbing!`, `Rating ${rating} — steady progress.`]);
    if (rating < 2000) return choice([`Rating ${rating}: impressive — contest threat.`, `Rating ${rating} — well played.`]);
    return choice([`Rating ${rating}: elite-level coder!`, `Legend: ${rating} rating — respect.`]);
  };

  const contestBlurb = () => choice([`${contests} contests — contest warrior.`, `${contests} participations — you love the thrill.`]);

  const problemsBlurb = () => choice([`You shine at ${favorite} problems.`, `${solved} solved — that's commitment.`]);

  const personality = () => choice([`Competitive spirit with a friendly face.`, `Strategic and resilient — contest-ready.`]);

  const funPool = [
    `Solved ${solved} problems this year — nice cadence.`,
    `Best contest rank: ${best || 'N/A'} — peak moments matter.`,
    `Rating change: ${change >= 0 ? '+' : ''}${change} — impactful year.`,
    `${contests} contests — adrenaline junkie confirmed.`,
  ];

  const chosenFacts = funPool.sort(() => Math.random() - 0.5).slice(0, 3);

  // Occasionally include a playful Gemini fallback notice
  const shareNote = Math.random() < 0.2 ? `${choice([`Share and brag — Gemini took a quick nap so here's a backup! 😉`, `Gemini's on a coffee run — fallback content incoming! ☕`])}` : `Share your CP Wrapped — celebrate the grind!`;

  return {
    creativeTaglines: {
      welcome: welcome(),
      rating: ratingBlurb(),
      contests: contestBlurb(),
      problems: problemsBlurb(),
      personality: personality(),
      share: shareNote,
    },
    funFacts: chosenFacts,
    coderTitle: rating >= 2400 ? "Grandmaster" : rating >= 1900 ? "Candidate Master" : rating >= 1600 ? "Expert" : "Dedicated Coder",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle } = body;

    if (!handle) {
      return NextResponse.json(
        { error: "Handle is required" },
        { status: 400 }
      );
    }

    const data = await fetchCFData(handle);
    const stats = analyzeStats(data);
    const creative = await generateCreativeContent(stats);

    return NextResponse.json({
      ...stats,
      creativeTaglines: creative.creativeTaglines,
      funFacts: creative.funFacts,
      coderTitle: creative.coderTitle,
    });
  } catch (error) {
    console.error("CF Wrapped error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json(
      { error: message || "Failed to generate Codeforces Wrapped" },
      { status: message?.includes("not found") ? 404 : 500 }
    );
  }
}
