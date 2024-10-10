import NextLink from "next/link";
import { ReactNode } from "react";

interface NavLinkProps {
  children: ReactNode;
  href: string;
  isActive?: boolean;
  hover?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({
  href,
  isActive,
  children,
  hover,
}) => {
  let className;

  if (isActive) {
    className = "py-1 px-2 bg-white rounded-md text-black";
  } else {
    className = "text-white";
  }

  if (hover) {
    return (
      <div className="p-1 rounded-md hover:bg-blue-900">
        <NextLink className={className} href={href}>
          <p className="text-center capitalize">{children}</p>
        </NextLink>
      </div>
    );
  } else {
    return (
      <NextLink className={className} href={href}>
        {children}
      </NextLink>
    );
  }
};

export default NavLink;
