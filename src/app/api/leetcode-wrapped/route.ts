import { NextRequest, NextResponse } from "next/server";
import { generateContentWithConfig } from "@/lib/gemini";

async function fetchLeetCodeData(username: string) {
  // LeetCode GraphQL API
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          userAvatar
          reputation
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        badges {
          name
        }
        userCalendar {
          streak
          totalActiveDays
        }
        tagProblemCounts {
          advanced {
            tagName
            problemsSolved
          }
          intermediate {
            tagName
            problemsSolved
          }
          fundamental {
            tagName
            problemsSolved
          }
        }
      }
    }
  `;

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { username },
    }),
  });

  const data = await response.json();

  if (!data.data?.matchedUser) {
    throw new Error("User not found on LeetCode");
  }

  return data.data.matchedUser;
}

function analyzeStats(user: any) {
  const acStats = user.submitStats?.acSubmissionNum || [];
  const totalStats = user.submitStats?.totalSubmissionNum || [];
  
  // Get solved counts by difficulty
  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;
  let totalSolved = 0;

  acStats.forEach((stat: any) => {
    if (stat.difficulty === "Easy") easySolved = stat.count;
    if (stat.difficulty === "Medium") mediumSolved = stat.count;
    if (stat.difficulty === "Hard") hardSolved = stat.count;
    if (stat.difficulty === "All") totalSolved = stat.count;
  });

  // Total submissions
  let totalSubmissions = 0;
  let totalAccepted = 0;
  totalStats.forEach((stat: any) => {
    if (stat.difficulty === "All") {
      totalSubmissions = stat.submissions;
    }
  });
  acStats.forEach((stat: any) => {
    if (stat.difficulty === "All") {
      totalAccepted = stat.submissions;
    }
  });

  const acceptanceRate = totalSubmissions > 0 
    ? Math.round((totalAccepted / totalSubmissions) * 100) 
    : 0;

  // Badges
  const badges = user.badges?.map((b: any) => b.name) || [];

  // Top topics
  const allTags = [
    ...(user.tagProblemCounts?.advanced || []),
    ...(user.tagProblemCounts?.intermediate || []),
    ...(user.tagProblemCounts?.fundamental || []),
  ];
  
  const recentTopics = allTags
    .sort((a: any, b: any) => b.problemsSolved - a.problemsSolved)
    .slice(0, 8)
    .map((t: any) => t.tagName);

  return {
    username: user.username,
    avatar: user.profile?.userAvatar || "",
    ranking: user.profile?.ranking || 0,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    acceptanceRate,
    contributionPoints: 0,
    reputation: user.profile?.reputation || 0,
    streak: user.userCalendar?.streak || 0,
    totalSubmissions,
    activeDays: user.userCalendar?.totalActiveDays || 0,
    badges,
    recentTopics,
  };
}

async function generateCreativeContent(stats: any) {
  const prompt = `You are generating fun content for a LeetCode Wrapped (like Spotify Wrapped but for coders).

User's LeetCode stats:
- Username: ${stats.username}
- Total Solved: ${stats.totalSolved}
- Easy: ${stats.easySolved}, Medium: ${stats.mediumSolved}, Hard: ${stats.hardSolved}
- Ranking: #${stats.ranking}
- Streak: ${stats.streak} days
- Active Days: ${stats.activeDays}
- Acceptance Rate: ${stats.acceptanceRate}%

Generate content in JSON format:
{
  "creativeTaglines": {
    "welcome": "Short welcome message",
    "problems": "Comment about problem solving",
    "difficulty": "Comment about difficulty distribution",
    "streak": "Comment about consistency",
    "personality": "Fun personality assessment",
    "share": "Encouraging share message"
  },
  "funFacts": [
    "3 fun facts about their stats"
  ],
  "coderTitle": "A title like 'Problem Crusher', 'Hard Hitter', 'Consistency King' etc based on stats"
}

Be witty but encouraging. Keep taglines under 60 characters. Return ONLY valid JSON.`;

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
        console.warn('Gemini returned invalid JSON for LeetCode Wrapped — falling back');
      }
    }
  } catch (error) {
    console.error("Gemini error:", error);
  }
  // Range-based, randomized fallback for variety and personality
  const total = stats.totalSolved || 0;
  const hard = stats.hardSolved || 0;
  const medium = stats.mediumSolved || 0;
  const streak = stats.streak || 0;
  const rank = stats.ranking || 0;
  const accept = stats.acceptanceRate || 0;

  const choice = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  const welcome = () => {
    if (total < 50) return choice([`Getting started with ${total} solves — nice!`, `You solved ${total} problems — the journey begins.`]);
    if (total < 200) return choice([`${total} solves — steady progress.`, `You've solved ${total} problems — solid grit.`]);
    return choice([`${total} solves! You're a LeetCode legend.`, `Epic: ${total} problems — mind = blown.`]);
  };

  const problemsLine = () => {
    if (medium < 20) return choice([`Mediums: ${medium} — time to up the challenge!`, `Mediums: ${medium} — climbing up.`]);
    if (medium < 100) return choice([`You crushed ${medium} mediums — real progress.`, `${medium} mediums — consistency wins.`]);
    return choice([`${medium} mediums — master-level momentum.`, `${medium} mediums — unstoppable.`]);
  };

  const difficultyLine = () => (hard > 50 ? choice([`${hard} hards? You are a beast!`, `Hard problems galore: ${hard} solved.`]) : choice([`${hard} hards — keep grinding.`, `Hards: ${hard} — patience pays.`]));

  const streakLine = () => (streak > 30 ? choice([`${streak} day streak! Legendary!`, `Streak: ${streak} days — unstoppable!`]) : `${streak} days strong!`);

  const personality = () => choice([`Problem solver at heart.`, `Focused and persistent — great combo.`, `Quick thinker and steady coder.`]);

  const share = () => choice([`Share your Wrapped — flex responsibly.`, `Put that Wrapped on display — earned it!`, `Share your grind — inspiration incoming.`]);

  const funPool = [
    `You solved ${total} problems this year — that's dedication!`,
    `${hard} hards show real grit — impressive.`,
    `${stats.activeDays || 0} active days of focused solving!`,
    `Acceptance rate: ${accept}% — keep the quality up!`,
    `Ranking: #${rank || 'N/A'} — standings look 💪`,
  ];

  const shuffled = funPool.sort(() => Math.random() - 0.5).slice(0, 3);

  // Occasionally include a playful Gemini fallback note
  const shareNote = Math.random() < 0.25 ? `${share()} (Gemini took a coffee break, so here's a backup wink 😉)` : share();

  return {
    creativeTaglines: {
      welcome: welcome(),
      problems: problemsLine(),
      difficulty: difficultyLine(),
      streak: streakLine(),
      personality: personality(),
      share: shareNote,
    },
    funFacts: shuffled,
    coderTitle: hard > 100 ? "Hard Problem Destroyer" : total > 500 ? "Volume King" : "Rising Coder",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const user = await fetchLeetCodeData(username);
    const stats = analyzeStats(user);
    const creative = await generateCreativeContent(stats);

    return NextResponse.json({
      ...stats,
      creativeTaglines: creative.creativeTaglines,
      funFacts: creative.funFacts,
      coderTitle: creative.coderTitle,
    });
  } catch (error: any) {
    console.error("LeetCode Wrapped error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate LeetCode Wrapped" },
      { status: error.message?.includes("not found") ? 404 : 500 }
    );
  }
}
