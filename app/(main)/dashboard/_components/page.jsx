import { checkUser } from "@/lib/checkUser";

export const getUserOnboardingStatus = async () => {
  const user = await checkUser();

  if (!user) return { isOnboarding: false };

  // अगर user.industry null है → onboarding चल रहा
  const isOnboarding = user.industry ? false : true;

  return { isOnboarding };
};
