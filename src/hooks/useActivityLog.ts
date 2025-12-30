import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type ActivityAction = 
  | "login"
  | "logout"
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "view";

export type EntityType = 
  | "user"
  | "student"
  | "teacher"
  | "notice"
  | "admission"
  | "settings";

interface LogActivityParams {
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  details?: Record<string, unknown>;
}

export const useActivityLog = () => {
  const { user } = useAuth();

  const logActivity = async ({
    action,
    entityType,
    entityId,
    details,
  }: LogActivityParams) => {
    if (!user) return;

    try {
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details as any,
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  return { logActivity };
};

// Standalone function for logging without hook context
export const logActivityDirect = async (
  userId: string,
  action: ActivityAction,
  entityType: EntityType,
  entityId?: string,
  details?: Record<string, unknown>
) => {
  try {
    await supabase.from("activity_logs").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details as any,
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};
