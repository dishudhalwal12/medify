import { redirect } from "next/navigation";

export default function LiverRedirectPage() {
  redirect("/assessments/kidney-or-liver?module=liver");
}
