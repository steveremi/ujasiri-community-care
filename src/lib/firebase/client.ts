"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";

import { env, isFirebaseClientConfigured } from "@/lib/env";

/**
 * Browser-side Firebase, used only to prove who the user is.
 *
 * The moment sign-in succeeds we hand the ID token to our own server, which
 * exchanges it for an httpOnly session cookie (see lib/firebase/admin.ts).
 * No application state is read from Firebase on the client.
 */

let cached: FirebaseApp | null = null;

export function firebaseApp(): FirebaseApp | null {
  if (!isFirebaseClientConfigured) return null;
  if (cached) return cached;

  cached = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: env.firebase.apiKey!,
        authDomain: env.firebase.authDomain!,
        projectId: env.firebase.projectId!,
        storageBucket: env.firebase.storageBucket,
        messagingSenderId: env.firebase.messagingSenderId,
        appId: env.firebase.appId,
      });

  return cached;
}

export function firebaseAuth(): Auth | null {
  const app = firebaseApp();
  if (!app) return null;
  const auth = getAuth(app);
  // Session continuity is our cookie's job, but local persistence keeps the
  // client SDK able to refresh an ID token without a fresh sign-in.
  void setPersistence(auth, browserLocalPersistence).catch(() => {});
  return auth;
}

/** Turn Firebase's error codes into something a person can act on. */
export function authErrorMessage(err: unknown): string {
  const code =
    typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : "";

  switch (code) {
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/user-disabled":
      return "This account has been deactivated. Contact an administrator.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account already exists with that email address.";
    case "auth/weak-password":
      return "Choose a password of at least 8 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network problem — check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    default:
      return err instanceof Error && err.message
        ? err.message
        : "Something went wrong. Please try again.";
  }
}
