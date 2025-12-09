import { ReactNode } from "react";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { LiveChat } from "./LiveChat";

interface LayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  user?: {
    email: string;
    role: string;
  };
}

export function Layout({ children, isAuthenticated, user }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar isAuthenticated={isAuthenticated} user={user} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
}
