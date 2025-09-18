// app/dashboard/page.jsx
import { getUserOnboardingStatus } from "@/actions/user";
import { getIndustryInsights } from "@/actions/dashboard";
import { redirect } from "next/navigation";
import DashboardView from "./_components/dashboard-view";

export default async function DashboardPage() {
  // Check if user is onboarded
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");

  // Fetch insights (server-side)
  const insights = await getIndustryInsights();

  return (
    <div className="container mx-auto p-4">
      <DashboardView insights={insights} />
    </div>
  );
}
