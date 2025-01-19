"use client";

import { signOutAction } from "@/actions/sign-out-action";
import type { User } from "@proxed/supabase/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@proxed/ui/components/dropdown-menu";
import { useMediaQuery } from "@proxed/ui/hooks/use-media-query";
import {
  CircleHelpIcon,
  LogoutIcon,
  SettingsGearIcon,
  SunIcon,
} from "@proxed/ui/icons";
import { cn } from "@proxed/ui/utils";
import { HardDriveIcon, MoonIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";
import { UserAvatar } from "./user-avatar";

export function UserMenu({ user }: { user: User }) {
  const { setTheme: setCurrentTheme, theme: currentTheme } = useTheme();
  const [theme, setTheme] = useState<string>(currentTheme ?? "system");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const colorModeOptions = [
    {
      value: "system",
      label: "System",
      icon: HardDriveIcon,
    },
    {
      value: "light",
      label: "Light",
      icon: SunIcon,
    },
    {
      value: "dark",
      label: "Dark",
      icon: MoonIcon,
    },
  ];

  if (!user) {
    return null;
  }

  const { full_name, email, avatar_url } = user;

  const signOut = useAction(signOutAction);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="User menu"
        >
          <UserAvatar name={full_name ?? ""} avatarUrl={avatar_url} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          "w-56 p-2",
          isMobile &&
            "right-[16px] left-[16px] w-[calc(100vw-32px)] max-w-[20rem]",
        )}
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{full_name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-md">
            <SunIcon className="mr-2 size-4" />
            Color mode
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent
              className={cn(
                "p-2",
                isMobile &&
                  "right-[16px] left-[16px] w-[calc(100vw-32px)] max-w-[20rem]",
              )}
              sideOffset={-4}
            >
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => {
                  setTheme(value);
                  setCurrentTheme(value);
                }}
              >
                {colorModeOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                    className="rounded-md"
                  >
                    <option.icon className="mr-2 size-4 opacity-50" />
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="rounded-md">
          <Link href="/settings/account/general">
            <SettingsGearIcon className="mr-2 size-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="rounded-md">
          <a
            href="https://docs.proxed.ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            <CircleHelpIcon className="mr-2 size-4" />
            Documentation
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => signOut.execute({})}
          className="rounded-md"
        >
          <LogoutIcon className="mr-2 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
