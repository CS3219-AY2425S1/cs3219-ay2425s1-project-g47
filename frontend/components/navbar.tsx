"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@nextui-org/navbar";
import {
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
} from "@nextui-org/dropdown";
import { Avatar } from "@nextui-org/avatar";
import { Link } from "@nextui-org/link";
import NextLink from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import NavLink from "@/components/navLink";
import { useLogout } from "@/hooks/api/auth";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, Logo } from "@/components/icons";
import { useUser } from "@/hooks/users";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const isAdmin = user?.isAdmin || false;
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/");
        setUser(null);
      },
    });
  };

  const config = siteConfig(isAdmin);

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">PeerPrep</p>
          </NextLink>
        </NavbarBrand>

        {/* Display Links to Pages only when logged in */}
        {isLoggedIn && (
          <div className="hidden lg:flex gap-4 justify-start ml-2">
            {config.navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <NavbarItem key={item.href} isActive={isActive}>
                  <NavLink href={item.href} isActive={isActive}>
                    {item.label}
                  </NavLink>
                </NavbarItem>
              );
            })}
          </div>
        )}
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <Link isExternal href={config.links.github} title="GitHub">
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />

        {isLoggedIn && (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name={user?.username || ""}
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Profile Actions"
              disabledKeys={["profile"]}
              variant="flat"
            >
              <DropdownItem
                key="profile"
                className="h-14 gap-2"
                textValue="profile"
              >
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user?.username || ""}</p>
              </DropdownItem>
              <DropdownItem
                key="myprofile"
                href={`/user-profile/${user?.id}`}
                textValue="myprofile"
              >
                My Profile
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                textValue="logout"
                onPress={() => handleLogout()}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </NavbarContent>
    </NextUINavbar>
  );
};
