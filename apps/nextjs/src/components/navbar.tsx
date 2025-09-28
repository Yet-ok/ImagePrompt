"use client";

import React from "react";
import Link from "next/link";
import type { User } from "@saasfly/auth";
import { useSelectedLayoutSegment } from "next/navigation";

import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";

import { MainNav } from "./main-nav";
import { LocaleChange } from "~/components/locale-change";
import { GitHubStar } from "~/components/github-star";
import { useSigninModal } from "~/hooks/use-signin-modal";
import { UserAccountNav } from "./user-account-nav";
import { ModeToggle } from "~/components/mode-toggle";

import useScroll from "~/hooks/use-scroll";
import type { MainNavItem } from "~/types";

interface NavBarProps {
  user: Pick<User, "name" | "image" | "email"> | undefined;
  items?: MainNavItem[];
  children?: React.ReactNode;
  rightElements?: React.ReactNode;
  scroll?: boolean;
  params: {
    lang: string;
  };
  marketing: Record<string, string | object>;
  dropdown: Record<string, string>;
}

export function NavBar({
  user,
  items,
  children,
  rightElements,
  scroll = false,
  params: { lang },
  marketing,
  dropdown,
}: NavBarProps) {
  const scrolled = useScroll(50);
  const signInModal = useSigninModal();
  const segment = useSelectedLayoutSegment();

  return (
    <header
      className={`sticky top-0 z-40 flex w-full justify-center border-border bg-background/60 backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-background/0") : "border-b"
      }`}
    >
      <div className="container flex h-16 items-center justify-between py-4">
        <MainNav
          items={items}
          params={{ lang: `${lang}` }}
          marketing={marketing}
        >
          {children}
        </MainNav>

        <div className="flex items-center space-x-3">
          <ModeToggle />
          <LocaleChange url="" />
          {user ? (
            <UserAccountNav user={user} params={{ lang }} dict={dropdown} />
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                className="px-3"
                variant="ghost"
                size="sm"
                onClick={() => signInModal.onOpen()}
              >
                {String(marketing.login)}
              </Button>
              <Button
                className="px-3"
                size="sm"
                onClick={() => signInModal.onOpen()}
              >
                {String(marketing.signup)}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
