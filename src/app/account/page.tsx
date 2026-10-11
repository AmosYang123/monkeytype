import { redirect } from "next/navigation";

// signed-out visitors are sent to the login page, like monkeytype.com/account
export default function Page() {
  redirect("/login");
}
