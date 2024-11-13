export type SiteConfig = typeof siteConfig;

export const siteConfig = (isAdmin: boolean) => ({
  name: "PeerPrep",
  description: "Your Interview Prep Platform.",
  navItems: [
    {
      label: "Match",
      href: "/match",
    },
    {
      label: "Questions",
      href: isAdmin ? "/admin/questions" : "/questions",
    },
    {
      label: "History",
      href: "/history",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g47",
    docs: "https://nextui-docs-v2.vercel.app",
    login: "/login",
  },
});
