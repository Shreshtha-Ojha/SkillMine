import { useEffect, useState } from "react";
import axios from "axios";

export default function useCurrentUser(): any {
  const [user, setUser] = useState<any>(undefined); // undefined = loading, null/false = not logged in
  
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
