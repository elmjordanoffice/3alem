import { redirect } from "next/navigation";

export default function OrgIndex() {
  redirect("/app/org/members");
}
