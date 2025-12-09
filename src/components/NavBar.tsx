import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ESGReportLogo } from "@/components/ui/esgreport-logo";
import { Menu, X, User, Bell, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function NavBar() {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isAuthenticated = !!user;

  useEffect(() => {
    if (user) {
      loadUnreadCount();

      const channel = supabase
        .channel('notifications-count')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            loadUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="nav-container">
        <div className="flex items-center justify-between h-20">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <ESGReportLogo size="md" variant="horizontal" />
            </a>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                <Link href="/about">
                  <a className="text-gray-600 hover:text-primary transition-colors">About</a>
                </Link>
                <Link href="/frameworks">
                  <a className="text-gray-600 hover:text-primary transition-colors">Frameworks</a>
                </Link>
                <Link href="/pricing">
                  <a className="text-gray-600 hover:text-primary transition-colors">Pricing</a>
                </Link>
                <Link href="/contact">
                  <a className="text-gray-600 hover:text-primary transition-colors">Contact</a>
                </Link>
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <Button size="sm" variant="ghost" className="font-normal">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="font-normal">Sign Up</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/dashboard">
                  <a className="text-gray-600 hover:text-primary transition-colors">Dashboard</a>
                </Link>
                <Link href="/reports">
                  <a className="text-gray-600 hover:text-primary transition-colors">Reports</a>
                </Link>
                <Link href="/analytics">
                  <a className="text-gray-600 hover:text-primary transition-colors">Analytics</a>
                </Link>
                <Link href="/ai-assistant">
                  <a className="text-gray-600 hover:text-primary transition-colors">AI Assistant</a>
                </Link>
                <Link href="/frameworks-auth">
                  <a className="text-gray-600 hover:text-primary transition-colors">Frameworks</a>
                </Link>
                <div className="flex items-center space-x-3">
                  <Link href="/search">
                    <Button variant="ghost" size="sm" className="font-normal">
                      <Search className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="ghost" size="sm" className="relative font-normal">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {profile?.first_name || user.email?.split('@')[0]}
                      </span>
                    </div>
                  </Link>
                  <Button size="sm" variant="outline" onClick={handleSignOut} className="font-normal">
                    Sign Out
                  </Button>
                </div>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {!isAuthenticated ? (
              <>
                <Link href="/about">
                  <a className="block text-gray-600 hover:text-primary transition-colors">About</a>
                </Link>
                <Link href="/frameworks">
                  <a className="block text-gray-600 hover:text-primary transition-colors">Frameworks</a>
                </Link>
                <Link href="/pricing">
                  <a className="block text-gray-600 hover:text-primary transition-colors">Pricing</a>
                </Link>
                <Link href="/contact">
                  <a className="block text-gray-600 hover:text-primary transition-colors">Contact</a>
                </Link>
                <div className="space-y-2">
                  <Link href="/login">
                    <Button size="sm" variant="ghost" className="w-full font-normal">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="w-full font-normal">Sign Up</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 px-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {profile?.first_name || user.email?.split('@')[0]}
                  </span>
                </div>
                <Link href="/dashboard">
                  <a className="block text-gray-600 hover:text-primary transition-colors">Dashboard</a>
                </Link>
                <Link href="/reports">
                  <a className="block text-gray-600 hover:text-primary transition-colors">Reports</a>
                </Link>
                <Link href="/analytics">
                  <a className="block text-gray-600 hover:text-primary transition-colors">Analytics</a>
                </Link>
                <Link href="/ai-assistant">
                  <a className="block text-gray-600 hover:text-primary transition-colors">AI Assistant</a>
                </Link>
                <Link href="/frameworks-auth">
                  <a className="block text-gray-600 hover:text-primary transition-colors">Frameworks</a>
                </Link>
                <Button size="sm" variant="outline" className="w-full font-normal" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
