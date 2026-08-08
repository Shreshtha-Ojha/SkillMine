/**
 * Purpose
 * -------
 * NextAuth.js configuration — handles Google OAuth sign-in and bridges it into
 * the platform's custom JWT session shape.
 *
 * Responsibilities
 * - Register Google as the only OAuth provider.
 * - On first Google sign-in, upsert a User document in MongoDB with a synthetic
 *   password placeholder (Google users never authenticate with a password).
 * - Mint a `jsonwebtoken` JWT that matches the same shape used by the manual
 *   email/password flow, stored as `session.accessToken`.
 * - Propagate user identity and admin status into the NextAuth session object.
 *
 * Used by
 * - `src/app/api/auth/[...nextauth]/route.ts` — mounts this config on the NextAuth handler.
 * - `src/auth/callback/page.tsx` — reads `session.accessToken` after OAuth redirect
 *   and stores it in the `token` cookie so `getUserFromRequest` can find it.
 *
 * Interview Talking Points
 * - Two auth systems exist side-by-side: NextAuth (Google) and a manual JWT flow
 *   (email/password). They converge on the same JWT shape so `getUserFromRequest`
 *   and middleware work identically for both.
 * - Admin status is derived from the `ADMINS` env var at sign-in time and baked
 *   into the token, avoiding a DB lookup on every request.
 * - The `jwt` callback re-queries MongoDB on Google sign-in to ensure the token
 *   always reflects the persisted user ID, not a transient OAuth profile ID.
 *
 * TODO: Consolidate the admin-email check (currently duplicated across authOptions,
 * login route, and middleware) into a single shared `isAdminEmail(email)` helper.
 */

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connect();
          
          // Check if user exists
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user with Google auth (no password, auto-verified)
            const username = user.email?.split("@")[0] + "_" + Date.now().toString(36);
            existingUser = await User.create({
              email: user.email,
              username: username,
              password: "google_oauth_" + Date.now(), // Placeholder password for OAuth users
              isVerified: true, // Google users are auto-verified
              fullName: user.name || "",
              googleId: account.providerAccountId,
              authProvider: "google",
            });
          } else {
            // Update existing user to mark as verified if not already
            if (!existingUser.isVerified) {
              existingUser.isVerified = true;
              await existingUser.save();
            }
          }
          
          return true;
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user) {
        try {
          await connect();
          const dbUser = await User.findOne({ email: user.email });
          
          if (dbUser) {
            // Admin check using env variable
            const adminEmails = process.env.ADMINS ? process.env.ADMINS.split(",").map(e => e.trim().toLowerCase()) : [];
            const userEmail = dbUser.email.trim().toLowerCase();
            
            token.id = dbUser._id.toString();
            token.username = dbUser.username;
            token.email = dbUser.email;
            token.isAdmin = adminEmails.includes(userEmail) || dbUser.isAdmin === true;
            token.fullName = dbUser.fullName || user.name;
            
            // Create JWT token compatible with existing system
            const jwtToken = jwt.sign(
              {
                id: dbUser._id.toString(),
                username: dbUser.username,
                email: dbUser.email,
                isAdmin: adminEmails.includes(userEmail) || dbUser.isAdmin === true,
              },
              process.env.TOKEN_SECRET!,
              { expiresIn: "1d" }
            );
            
            token.accessToken = jwtToken;
          }
        } catch (error) {
          console.error("Error in JWT callback:", error);
        }
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.fullName = token.fullName as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // After successful sign in, redirect to callback page to sync tokens
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  
  events: {
    async signIn({ user, account }) {
      console.log("User signed in:", user.email, "Provider:", account?.provider);
    },
  },
  
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  
  secret: process.env.NEXTAUTH_SECRET || process.env.TOKEN_SECRET,
};
