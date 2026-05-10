import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isTeacher: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  loading: true,
  isTeacher: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Resolve teacher role from DB (user_roles), not from a client whitelist.
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) {
      setIsTeacher(false);
      setRoleChecked(true);
      return;
    }
    setRoleChecked(false);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "teacher")
      .maybeSingle()
      .then(({ data }) => {
        setIsTeacher(!!data);
        setRoleChecked(true);
      });
  }, [session?.user?.id]);

  const user = session?.user ?? null;

  return (
    <Ctx.Provider
      value={{
        session,
        user,
        loading: loading || (!!user && !roleChecked),
        isTeacher,
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
