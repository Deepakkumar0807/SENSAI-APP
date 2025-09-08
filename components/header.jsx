import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  PenBox,
  StarIcon,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { checkUser } from "@/lib/checkUser";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";

const Header = async () => {
  await checkUser();
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo (2).png"
            alt="Sensai Logo"
            width={200}
            height={60}
            className="h-12 py-1 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
          <AnimatedThemeToggler />
          <SignedIn>
            <Link href={"/dashboard"}>
              <Button variant="outline">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:block">Indestry Insights</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button>
                  <StarIcon className="h-4 w-4" />
                  <span className="hidden md:block">Grouth Tools</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={"/resume"} className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Build Resume</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href={"/ai-cover-letter"}
                    className="flex items-center gap-2"
                  >
                    <PenBox className="h-4 w-4" />
                    <span>Cover Letter</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={"/Interview"} className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Interview Prepration</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              {/* <Button variant="outline">Sign In</Button> */}
              <InteractiveHoverButton>Sign In</InteractiveHoverButton>
            </SignInButton>
          </SignedOut>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
                userButtonPopoverCard: "shadow-xl",
                userPreviewMainIdentifier: "font-semibold",
              },
            }}
            afterSignOutUrl="/"
          />
        </div>
      </nav>
    </header>
  );
};

export default Header;
