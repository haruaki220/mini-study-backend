import type { SupabaseClient, User } from "@supabase/supabase-js";

export type Env = {
  Variables: {
    supabase: SupabaseClient;
    user: User;
  };
};
