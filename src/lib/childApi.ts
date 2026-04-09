/**
 * Client helper for the child-data edge function.
 * All child data access goes through this instead of direct Supabase queries.
 */

const CHILD_DATA_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/child-data`;

async function call(body: Record<string, unknown>) {
  const resp = await fetch(CHILD_DATA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const childApi = {
  getChild: (child_id: string) => call({ action: "get_child", child_id }),
  getDashboard: (child_id: string) => call({ action: "get_dashboard", child_id }),
  createSession: (child_id: string, subject: string) =>
    call({ action: "create_session", child_id, subject }),
  saveMessage: (child_id: string, session_id: string, role: string, content: string) =>
    call({ action: "save_message", child_id, session_id, role, content }),
  getAchievementRoom: (child_id: string) => call({ action: "get_achievement_room", child_id }),
  purchaseItem: (child_id: string, item_id: string) =>
    call({ action: "purchase_item", child_id, item_id }),
  toggleEquip: (child_id: string, item_id: string, item_type: string) =>
    call({ action: "toggle_equip", child_id, item_id, item_type }),
  getMissionProgress: (child_id: string, curriculum: string, grade: string) =>
    call({ action: "get_mission_progress", child_id, curriculum, grade }),
  completeActivity: (child_id: string, params: {
    activity_id: string;
    session_id?: string;
    xp_reward?: number;
    topic?: string;
    next_activity_id?: string;
  }) => call({ action: "complete_activity", child_id, ...params }),
  claimReward: (child_id: string, reward_id: string) =>
    call({ action: "claim_reward", child_id, reward_id }),
  updateHomework: (child_id: string, homework_id: string, status: string) =>
    call({ action: "update_homework", child_id, homework_id, status }),
  getSessionHistory: (child_id: string) => call({ action: "get_session_history", child_id }),
};
