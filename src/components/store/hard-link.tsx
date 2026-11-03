"use client";

import type { ComponentProps } from "react";

type Props = ComponentProps<"a"> & { href: string };

/**
 * Full document navigation — bypasses the App Router RSC fetch.
 * Needed on Hostinger: their CDN ignores Vary for rsc/prefetch and soft nav
 * can crash with "This page couldn't load" while a hard load works.
 */
export function HardLink({ href, children, ...rest }: Props) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
