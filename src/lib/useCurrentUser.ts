import { useEffect, useState } from "react";
import axios from "axios";

export interface CurrentUser {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  profilePhoto?: { url?: string; publicId?: string };
  solvedProblems?: string[];
  reviewProblems?: string[];
  purchases?: {
    premium?: { purchased?: boolean; purchasedAt?: Date; paymentId?: string; amount?: number };
    oaQuestions?: { purchased?: boolean; purchasedAt?: Date; paymentId?: string; amount?: number };
    mockInterviews?: { purchased?: boolean; purchasedAt?: Date; paymentId?: string; amount?: number };
    resumeScreening?: { purchased?: boolean; purchasedAt?: Date; paymentId?: string; amount?: number };
    skillTest?: { purchased?: boolean; purchasedAt?: Date; paymentId?: string; amount?: number };
  };
  atsChecker?: {
    used?: number;
    allowedByAdmin?: boolean;
    requested?: boolean;
  };
}

// Returns: undefined (loading), null (not logged in), or CurrentUser object
export default function useCurrentUser(): CurrentUser | null | undefined {
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        // Ensure cookies are sent
        const res = await axios.get("/api/users/me", { withCredentials: true });
        if (isMounted && res.data.user) {
          setUser(res.data.user);
        } else if (isMounted) {
          setUser(null);
        }
      } catch (err) {
        if (isMounted) setUser(null);
      }
    };

    fetchUser();

    // Listen for logout broadcasts from other tabs and clear user
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user_logged_out_at') {
        if (isMounted) setUser(null);
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  
  return user; // undefined = loading, null = not logged in, object = logged in
}
