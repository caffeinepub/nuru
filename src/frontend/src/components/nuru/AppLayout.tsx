import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import LoginButton from '../auth/LoginButton';
import ProfileSetupModal from '../auth/ProfileSetupModal';
import XpProgressBar from '../progression/XpProgressBar';
import { Home, Headphones, MessageCircle, Globe, Gamepad2, BookOpen } from 'lucide-react';
import { SiX, SiFacebook, SiInstagram } from 'react-icons/si';

export default function AppLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/learning', label: 'Learning', icon: BookOpen },
    { path: '/listening', label: 'Listening', icon: Headphones },
    { path: '/conversation', label: 'Conversation', icon: MessageCircle },
    { path: '/culture', label: 'Culture', icon: Globe },
    { path: '/minigames', label: 'Games', icon: Gamepad2 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ProfileSetupModal />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-amber-200/50 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/assets/generated/nuru-mascot-head-realistic.dim_256x256.png" alt="Nuru" className="h-10 w-10" />
            <img src="/assets/generated/nuru-wordmark-genz.dim_1200x400.png" alt="Nuru" className="h-8" />
          </button>

          <div className="flex items-center gap-4">
            <XpProgressBar />
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-amber-200/50 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate({ to: item.path })}
                  className="gap-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/50 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Nuru</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                Built with <span className="text-red-500">♥</span> using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  caffeine.ai
                </a>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiX className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiFacebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiInstagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
