import { useNavigate } from '@tanstack/react-router';
import { useGetLanguages, useSetSelectedLanguage, useGetUserProgress } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import LanguageIcon from '../components/languages/LanguageIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function LanguageSelectPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: languages, isLoading } = useGetLanguages();
  const { data: progress } = useGetUserProgress();
  const setLanguage = useSetSelectedLanguage();

  const isAuthenticated = !!identity;
  const selectedLanguageId = progress?.selectedLanguage || BigInt(1);

  const handleSelectLanguage = async (languageId: bigint) => {
    if (!isAuthenticated) {
      toast.info('Please log in to save your language selection');
      return;
    }

    try {
      await setLanguage.mutateAsync(languageId);
      toast.success('Language updated successfully!');
      navigate({ to: '/' });
    } catch (error) {
      console.error('Failed to set language:', error);
      toast.error('Failed to update language. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <img
            src="/assets/generated/nuru-mascot-head-genz.dim_256x256.png"
            alt="Nuru"
            className="h-24 w-24"
          />
        </div>
        <h1 className="text-4xl font-bold">Choose Your Language</h1>
        <p className="text-xl text-muted-foreground">
          Select the language you want to learn with Nuru
        </p>
      </div>

      {/* Language Cards */}
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
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground">
              💡 Log in to save your language selection and track your progress
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
