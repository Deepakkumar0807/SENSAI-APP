import { checkUser } from "./checkUser";

export const getUserOnboardingStatus = async () => {
  const user = await checkUser();

  if (!user) return { isOnboarding: false };

  const isOnboarding = user.industry ? false : true;

  return { isOnboarding };
};

