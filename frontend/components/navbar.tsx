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
import { useRouter } from "next/router";

import NavLink from "@/components/navLink";
import { useLogout } from "@/hooks/api/auth";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, Logo } from "@/components/icons";
import { useUser } from "@/hooks/users";

// Define the props interface
interface NavbarProps {
  isLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isLoggedIn }) => {
  const router = useRouter();
  const { user } = useUser();

  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

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
            {siteConfig.navItems.map((item) => {
              const isActive = router.pathname === item.href;

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
        <Link isExternal href={siteConfig.links.github} title="GitHub">
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
                <p className="font-semibold">{user?.email || ""}</p>
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
