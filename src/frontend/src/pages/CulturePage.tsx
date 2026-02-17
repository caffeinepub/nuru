import { useState } from 'react';
import { useGetCultureEntries, useGetUserProgress, useCompleteCultureEntry } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { getCultureDisplayText, getCultureTranslation } from '../utils/learningContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, BookOpen, CheckCircle2, Trophy, History, Languages } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function CulturePage() {
  const { identity } = useInternetIdentity();
  const { data: progress } = useGetUserProgress();
  const selectedLanguageId = progress?.selectedLanguage || BigInt(1);
  const { data: entries, isLoading } = useGetCultureEntries(selectedLanguageId);
  const completeCultureEntry = useCompleteCultureEntry();

  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'history'>('all');

  const isAuthenticated = !!identity;
  const completedEntries = progress?.completedCultureEntries || [];

  const handleComplete = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save your progress');
      setSelectedEntry(null);
      return;
    }

    if (!selectedEntry) return;

    try {
      // Generate a stable ID from the entry title/content hash
      const entryId = BigInt(Math.abs(hashCode(selectedEntry.title)));
      await completeCultureEntry.mutateAsync({
        entryId,
        xpReward: selectedEntry.xpReward,
      });
      toast.success(`Completed! +${Number(selectedEntry.xpReward)} XP`, {
        icon: <Trophy className="h-4 w-4" />,
      });
      setSelectedEntry(null);
    } catch (error: any) {
      if (error.message?.includes('already completed')) {
        toast.info('You have already completed this entry');
        setSelectedEntry(null);
      } else {
        console.error('Failed to complete culture entry:', error);
        toast.error('Failed to save progress. Please try again.');
      }
    }
  };

  // Simple hash function for generating stable IDs
  function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash;
  }

  const isEntryCompleted = (entry: any) => {
    const entryId = BigInt(Math.abs(hashCode(entry.title)));
    return completedEntries.some((id) => id === entryId);
  };

  const isHistoryEntry = (title: string) => {
    const lowerTitle = title.toLowerCase();
    return (
      lowerTitle.includes('history') ||
      lowerTitle.startsWith('ancient') ||
      lowerTitle.includes('empire') ||
      lowerTitle.includes('heritage') ||
      lowerTitle.includes('roots') ||
      lowerTitle.includes('nation') ||
      lowerTitle.includes('colonial') ||
      lowerTitle.includes('formation') ||
      lowerTitle.includes('renaissance') ||
      lowerTitle.includes('kingdoms')
    );
  };

  const filteredEntries = entries?.filter((entry) => {
    if (filter === 'history') {
      return isHistoryEntry(entry.title);
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white mb-4">
          <Globe className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-bold">Culture & History</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the rich cultural heritage and historical background of the language
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'history')}>
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Globe className="h-4 w-4" />
              All Entries
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Culture Entries Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredEntries?.map((entry, index) => {
          const completed = isEntryCompleted(entry);
          const isHistory = isHistoryEntry(entry.title);
          const displayText = getCultureDisplayText(entry);
          const preview = displayText.length > 150 ? displayText.substring(0, 150) + '...' : displayText;

          return (
            <Card
              key={index}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              onClick={() => setSelectedEntry(entry)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    {isHistory ? <History className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {completed && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </Badge>
                    )}
                    {isHistory && <Badge variant="outline">History</Badge>}
                  </div>
                </div>
                <CardTitle className="mt-4">{entry.title}</CardTitle>
                <CardDescription className="line-clamp-3">{preview}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Read More
                  </Button>
                  {!completed && (
                    <Badge variant="outline" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      {Number(entry.xpReward)} XP
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEntries?.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center space-y-2">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              {filter === 'history'
                ? 'No history entries available for this language yet.'
                : 'No culture entries available for this language yet. Check back soon!'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reading Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEntry?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {selectedEntry && isHistoryEntry(selectedEntry.title) && (
                <Badge variant="outline">History</Badge>
              )}
              {selectedEntry && !isEntryCompleted(selectedEntry) && (
                <Badge variant="outline" className="gap-1">
                  <Trophy className="h-3 w-3" />
                  {Number(selectedEntry.xpReward)} XP
                </Badge>
              )}
              <Badge variant="outline" className="gap-1">
                <Languages className="h-3 w-3" />
                Target Language
              </Badge>
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-4">
            <div className="space-y-6">
              {/* Primary content in target language */}
              <div className="space-y-3">
                {selectedEntry &&
                  getCultureDisplayText(selectedEntry)
                    .split('\n')
                    .map((paragraph: string, index: number) => (
                      <p key={index} className="text-base leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
              </div>

              {/* Optional translation/additional context */}
              {selectedEntry && getCultureTranslation(selectedEntry) && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2 font-medium">Translation & Context:</p>
                    <p className="text-sm leading-relaxed">{getCultureTranslation(selectedEntry)}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setSelectedEntry(null)}>
              Close
            </Button>
            {selectedEntry && !isEntryCompleted(selectedEntry) && (
              <Button
                onClick={handleComplete}
                disabled={completeCultureEntry.isPending}
                className="gap-2"
              >
                {completeCultureEntry.isPending ? (
                  'Completing...'
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Mark as Complete
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
