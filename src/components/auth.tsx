import RainbowButton from "@/components/ui/rainbow-button";
import UserDropdown from "@/components/user";
import { createClient } from "@/supabase/server";
import Link from "next/link";

async function Auth() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();
  return (
    <div>
      {data.session ? (
        <UserDropdown />
      ) : (
        <Link href="/login">
          <RainbowButton colorScheme="black" className="w-full">
            Login
          </RainbowButton>
        </Link>
      )}
    </div>
  );
}

export default Auth;
