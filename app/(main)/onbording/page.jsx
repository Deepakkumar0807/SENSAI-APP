import { industries } from "@/data/industries";
import OnbordingForm from "./_component/onbording-form";
import { redirect } from "next/navigation";
import { getUserOnboardingStatus } from "@/lib/getUserOnboardingStatus";


const OnBordingPage = async() => {
  //if user are already onBording
  const { isOnboarding } = await getUserOnboardingStatus();
  if (!isOnboarding) {
    redirect("/dashboard");
  }
  return (
   <main>
    <OnbordingForm industries={industries}/>
   </main>
  )
}

export default OnBordingPage;
