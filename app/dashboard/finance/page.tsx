import { redirect } from "next/navigation";

export default function FinanceDashboardPage() {
  redirect("/dashboard/finance/recharge-requests");
}
