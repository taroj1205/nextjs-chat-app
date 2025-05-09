import type { Metadata } from "next";
import { ColorModeScript, Container } from "@yamada-ui/react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ height: "100dvh", overflowY: "clip" }}
    >
      <body suppressHydrationWarning>
        <ColorModeScript initialColorMode="dark" />
        <Providers>
          <Container centerContent h="100dvh" maxH="100dvh" p="0">
            {children}
          </Container>
        </Providers>
      </body>
    </html>
  );
}
