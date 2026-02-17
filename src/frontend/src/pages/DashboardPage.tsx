import { useNavigate } from '@tanstack/react-router';
import { useGetUserProgress, useGetLanguages, useSetSelectedLanguage } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import SectionCard from '../components/nuru/SectionCard';
import LanguageIcon from '../components/languages/LanguageIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Headphones, MessageCircle, Globe, Gamepad2, Languages, Sparkles, Check, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: progress, isLoading: progressLoading } = useGetUserProgress();
  const { data: languages, isLoading: languagesLoading } = useGetLanguages();
  const setLanguage = useSetSelectedLanguage();

  const isAuthenticated = !!identity;
  const selectedLanguageId = progress?.selectedLanguage || BigInt(1);
  const selectedLanguage = languages?.find((lang) => lang.id === selectedLanguageId);

  const completedDialogues = progress?.completedDialogues.length || 0;
  const completedCulture = progress?.completedCultureEntries.length || 0;
  const completedMinigames = progress?.completedMinigames.length || 0;

  const handleSelectLanguage = async (languageId: bigint) => {
    if (!isAuthenticated) {
      toast.info('Please log in to save your language selection');
      return;
    }

    try {
      await setLanguage.mutateAsync(languageId);
      toast.success('Language updated successfully!');
    } catch (error) {
      console.error('Failed to set language:', error);
      toast.error('Failed to update language. Please try again.');
    }
  };

  if (progressLoading || languagesLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white p-8 md:p-12">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Welcome to Nuru! {isAuthenticated && progress && <span className="wave">👋</span>}
            </h1>
            <p className="text-xl text-white/90">
              {isAuthenticated
                ? `Continue your ${selectedLanguage?.name || 'language'} learning journey`
                : 'Start your language learning adventure today'}
            </p>
            {isAuthenticated && progress && (
              <div className="flex items-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">Level {Number(progress.level)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{Number(progress.xp)} XP</span>
                </div>
              </div>
            )}
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate({ to: '/languages' })}
              className="gap-2"
            >
              {selectedLanguage ? (
                <>
                  <LanguageIcon
                    languageId={selectedLanguage.id}
                    languageName={selectedLanguage.name}
                    className="h-5 w-5"
                    size={20}
                  />
                  Learning {selectedLanguage.name}
                </>
              ) : (
                <>
                  <Languages className="h-5 w-5" />
                  Choose Language
                </>
              )}
            </Button>
          </div>
          <div className="flex-shrink-0">
            <img
              src="/assets/generated/nuru-mascot-waving-realistic.dim_1024x1024.png"
              alt="Nuru Mascot"
              className="h-48 md:h-64 w-auto drop-shadow-2xl"
            />
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <img
            src="/assets/generated/nuru-bg-pattern.dim_1920x1080.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Learning Sections */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Learning Sections</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <SectionCard
            title="Learning"
            description="Explore curated learning materials and resources"
            icon={BookOpen}
            variant="learning"
            onNavigate={() => navigate({ to: '/learning' })}
          />
          <SectionCard
            title="Listening"
            description="Practice pronunciation and listening comprehension"
            icon={Headphones}
            variant="listening"
            onNavigate={() => navigate({ to: '/listening' })}
          />
          <SectionCard
            title="Conversation"
            description="Practice real-world dialogues and conversations"
            icon={MessageCircle}
            completedCount={completedDialogues}
            totalCount={10}
            variant="conversation"
            onNavigate={() => navigate({ to: '/conversation' })}
          />
          <SectionCard
            title="Culture"
            description="Learn about the language's history and culture"
            icon={Globe}
            completedCount={completedCulture}
            totalCount={5}
            variant="culture"
            onNavigate={() => navigate({ to: '/culture' })}
          />
          <SectionCard
            title="Minigames"
            description="Fun challenges that scale with your level"
            icon={Gamepad2}
            completedCount={completedMinigames}
            totalCount={3}
            variant="games"
            onNavigate={() => navigate({ to: '/minigames' })}
          />
        </div>
      </div>

      {/* Available Languages */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Languages</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {languages?.map((language) => {
            const isSelected = language.id === selectedLanguageId;
            return (
              <Card
                key={Number(language.id)}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectLanguage(language.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center">
                      <LanguageIcon
                        languageId={language.id}
                        languageName={language.name}
                        className="h-6 w-6"
                        size={24}
                      />
                    </div>
                    {isSelected && (
                      <Badge className="gap-1">
                        <Check className="h-3 w-3" />
                        Selected
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{language.name}</CardTitle>
                  <CardDescription>{language.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={isSelected ? 'default' : 'outline'}
                    disabled={setLanguage.isPending}
                  >
                    {isSelected ? 'Currently Learning' : 'Start Learning'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {!isAuthenticated && (
          <Card className="mt-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <p className="text-center text-sm text-muted-foreground">
                💡 Log in to save your language selection and track your progress
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      {isAuthenticated && progress && (
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Keep up the great work!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Conversations Completed</p>
                <p className="text-2xl font-bold">{completedDialogues}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Culture Entries Read</p>
                <p className="text-2xl font-bold">{completedCulture}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Minigames Played</p>
                <p className="text-2xl font-bold">{completedMinigames}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
