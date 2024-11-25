import { createClient } from "@/supabase/server";
import React from "react";

async function Page() {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  console.log(user);
  const subscription = user.data?.user?.app_metadata.subscription_expires;
  return <div>{subscription}</div>;
}

export default Page;
