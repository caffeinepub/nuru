import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/nuru/AppLayout';
import DashboardPage from './pages/DashboardPage';
import LanguageSelectPage from './pages/LanguageSelectPage';
import ListeningPage from './pages/ListeningPage';
import ConversationPage from './pages/ConversationPage';
import CulturePage from './pages/CulturePage';
import MinigamesPage from './pages/MinigamesPage';
import LearningPage from './pages/LearningPage';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const languageSelectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/languages',
  component: LanguageSelectPage,
});

const listeningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listening',
  component: ListeningPage,
});

const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/conversation',
  component: ConversationPage,
});

const cultureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/culture',
  component: CulturePage,
});

const minigamesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/minigames',
  component: MinigamesPage,
});

const learningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/learning',
  component: LearningPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  languageSelectRoute,
  listeningRoute,
  conversationRoute,
  cultureRoute,
  minigamesRoute,
  learningRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
