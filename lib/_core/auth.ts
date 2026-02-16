import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { SESSION_TOKEN_KEY, USER_INFO_KEY } from "@/constants/oauth";

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
};

export async function getSessionToken(): Promise<string | null> {
  console.log("[Auth] Session token retrieval disabled");
  return null;
}

export async function setSessionToken(token: string): Promise<void> {
  console.log("[Auth] Session token storage disabled");
}

export async function removeSessionToken(): Promise<void> {
  console.log("[Auth] Session token removal disabled");
}

export async function getUserInfo(): Promise<User | null> {
  console.log("[Auth] User info retrieval disabled");
  return null;
}

export async function setUserInfo(user: User): Promise<void> {
  console.log("[Auth] User info storage disabled");
}

export async function clearUserInfo(): Promise<void> {
  console.log("[Auth] User info clearing disabled");
}
