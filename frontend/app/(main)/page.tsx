"use client";

import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

const config = siteConfig(false);

export default function Page() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Start finding a&nbsp;</span>
        <span className={title({ color: "violet" })}>match&nbsp;</span>
        <br />
        <span className={title()}>now on PeerPrep!</span>
        <div className={subtitle({ class: "mt-4" })}>
          Interactive interview prep site.
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          className={buttonStyles({
            color: "danger",
            radius: "full",
            variant: "shadow",
          })}
          href={config.links.login}
        >
          Login here!
        </Link>
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={config.links.github}
        >
          <GithubIcon size={20} />
          GitHub
        </Link>
      </div>
    </section>
  );
}
