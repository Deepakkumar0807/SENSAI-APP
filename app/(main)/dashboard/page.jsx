import { redirect } from "next/navigation";
import { getUserOnboardingStatus } from "@/lib/getUserOnboardingStatus";

const IndustryInsightspage = async () => {
  const { isOnboarding } = await getUserOnboardingStatus();

  if (!isOnboarding) {
    redirect("/onbording");
  }

  return (
    <div>
      Industry Insights Page
    </div>
  );
};

export default IndustryInsightspage;
