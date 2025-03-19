import Link, { type LinkProps } from "next/link";
import { FC, memo } from "react";
import {
  type LinkProps as YamadaLinkProps,
  Link as YamadaLink,
} from "@yamada-ui/react";

interface UILinkProps
  extends YamadaLinkProps,
    Omit<LinkProps, keyof YamadaLinkProps> {
  children: React.ReactNode;
}

export const UILink: FC<UILinkProps> = memo((props) => {
  return <YamadaLink as={Link} {...props} />;
});
