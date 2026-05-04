
"use server";

import { getGlobalStatsAdmin } from "@/lib/firebase/posts-admin";

export async function fetchDashboardStats() {
  return await getGlobalStatsAdmin();
}
