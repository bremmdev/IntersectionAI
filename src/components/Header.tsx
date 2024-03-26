import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import React from "react";
import { Button } from "./ui/button";

const userButtonAppearance = {
  elements: {
    userButtonTrigger: {
      height: "32px",
      width: "32px",
    },
    avatarBox: {
      height: "32px",
      width: "32px",
    },
  },
};

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 sm:px-8 border-b border-slate-300 bg-slate-50">
      <h1 className="text-2xl tracking-wider font-light">
        Intersection<span className="text-primary-blue">AI</span>
      </h1>
      <SignedIn>
        <UserButton appearance={userButtonAppearance} />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button className="bg-primary-blue hover:bg-primary-blue hover:bg-opacity-90">
            Sign In
          </Button>
        </SignInButton>
      </SignedOut>
    </header>
  );
};

export default Header;
