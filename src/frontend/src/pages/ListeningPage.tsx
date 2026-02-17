import { useState, useEffect } from 'react';
import { useGetUserProgress } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Headphones, Volume2, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { speak, loadVoices } from '../utils/tts';

// Listening content for all seeded languages (1-6)
const listeningLessons: Record<number, Array<{ id: number; word: string; translation: string; category: string }>> = {
  1: [ // Arabic
    { id: 1, word: 'مرحبا (Marhaba)', translation: 'Hello', category: 'Greetings' },
    { id: 2, word: 'شكرا (Shukran)', translation: 'Thank you', category: 'Greetings' },
    { id: 3, word: 'مع السلامة (Ma\'a salama)', translation: 'Goodbye', category: 'Greetings' },
    { id: 4, word: 'أين الفندق؟ (Ayn al-funduq?)', translation: 'Where is the hotel?', category: 'Directions' },
    { id: 5, word: 'يمين (Yamin)', translation: 'Right', category: 'Directions' },
    { id: 6, word: 'يسار (Yasar)', translation: 'Left', category: 'Directions' },
    { id: 7, word: 'أريد الماء (Urid alma\'a)', translation: 'I want water', category: 'Food' },
    { id: 8, word: 'دجاج (Dajaj)', translation: 'Chicken', category: 'Food' },
    { id: 9, word: 'أرز (Aruz)', translation: 'Rice', category: 'Food' },
  ],
  2: [ // Swahili
    { id: 1, word: 'Habari', translation: 'Hello/How are you', category: 'Greetings' },
    { id: 2, word: 'Asante', translation: 'Thank you', category: 'Greetings' },
    { id: 3, word: 'Kwaheri', translation: 'Goodbye', category: 'Greetings' },
    { id: 4, word: 'Soko liko wapi?', translation: 'Where is the market?', category: 'Directions' },
    { id: 5, word: 'Kulia', translation: 'Right', category: 'Directions' },
    { id: 6, word: 'Kushoto', translation: 'Left', category: 'Directions' },
    { id: 7, word: 'Samaki', translation: 'Fish', category: 'Food' },
    { id: 8, word: 'Wali', translation: 'Rice', category: 'Food' },
    { id: 9, word: 'Maji', translation: 'Water', category: 'Food' },
  ],
  3: [ // Hausa
    { id: 1, word: 'Sannu', translation: 'Hello', category: 'Greetings' },
    { id: 2, word: 'Na gode', translation: 'Thank you', category: 'Greetings' },
    { id: 3, word: 'Sai an jima', translation: 'Goodbye', category: 'Greetings' },
    { id: 4, word: 'Ina otal?', translation: 'Where is the hotel?', category: 'Directions' },
    { id: 5, word: 'Dama', translation: 'Right', category: 'Directions' },
    { id: 6, word: 'Hagu', translation: 'Left', category: 'Directions' },
    { id: 7, word: 'Kaza', translation: 'Chicken', category: 'Food' },
    { id: 8, word: 'Shinkafa', translation: 'Rice', category: 'Food' },
    { id: 9, word: 'Ruwa', translation: 'Water', category: 'Food' },
  ],
  4: [ // Amharic
    { id: 1, word: 'ሰላም (Selam)', translation: 'Hello', category: 'Greetings' },
    { id: 2, word: 'አመሰግናለሁ (Ameseginalew)', translation: 'Thank you', category: 'Greetings' },
    { id: 3, word: 'ደህና ሁን (Dehna hun)', translation: 'Goodbye', category: 'Greetings' },
    { id: 4, word: 'ሆቴል የት ነው? (Hotel yet new?)', translation: 'Where is the hotel?', category: 'Directions' },
    { id: 5, word: 'ቀኝ (Qegn)', translation: 'Right', category: 'Directions' },
    { id: 6, word: 'ግራ (Gra)', translation: 'Left', category: 'Directions' },
    { id: 7, word: 'ዶሮ (Doro)', translation: 'Chicken', category: 'Food' },
    { id: 8, word: 'ሩዝ (Ruz)', translation: 'Rice', category: 'Food' },
    { id: 9, word: 'ውሃ (Wiha)', translation: 'Water', category: 'Food' },
  ],
  5: [ // Yoruba
    { id: 1, word: 'Bawo ni', translation: 'Hello', category: 'Greetings' },
    { id: 2, word: 'E se', translation: 'Thank you', category: 'Greetings' },
    { id: 3, word: 'O dabo', translation: 'Goodbye', category: 'Greetings' },
    { id: 4, word: 'Nibo ni hotẹẹli wa?', translation: 'Where is the hotel?', category: 'Directions' },
    { id: 5, word: 'Ọtun', translation: 'Right', category: 'Directions' },
    { id: 6, word: 'Osi', translation: 'Left', category: 'Directions' },
    { id: 7, word: 'Adie', translation: 'Chicken', category: 'Food' },
    { id: 8, word: 'Iresi', translation: 'Rice', category: 'Food' },
    { id: 9, word: 'Omi', translation: 'Water', category: 'Food' },
  ],
  6: [ // Zulu
    { id: 1, word: 'Sawubona', translation: 'Hello', category: 'Greetings' },
    { id: 2, word: 'Ngiyabonga', translation: 'Thank you', category: 'Greetings' },
    { id: 3, word: 'Hamba kahle', translation: 'Goodbye', category: 'Greetings' },
    { id: 4, word: 'Ihhotela likuphi?', translation: 'Where is the hotel?', category: 'Directions' },
    { id: 5, word: 'Kwesokudla', translation: 'Right', category: 'Directions' },
    { id: 6, word: 'Kwesokunxele', translation: 'Left', category: 'Directions' },
    { id: 7, word: 'Inkukhu', translation: 'Chicken', category: 'Food' },
    { id: 8, word: 'Irayisi', translation: 'Rice', category: 'Food' },
    { id: 9, word: 'Amanzi', translation: 'Water', category: 'Food' },
  ],
};

export default function ListeningPage() {
  const { data: progress } = useGetUserProgress();
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const selectedLanguageId = Number(progress?.selectedLanguage || 1);
  const lessons = listeningLessons[selectedLanguageId] || [];

  useEffect(() => {
    loadVoices().then(() => setVoicesLoaded(true));
  }, []);

  const handleSpeak = (text: string, id: number) => {
    speak(
      text,
      selectedLanguageId,
      () => setPlayingId(id),
      () => setPlayingId(null),
      (error) => {
        setPlayingId(null);
        toast.error(error);
      }
    );
  };

  // Group lessons by category
  const categories = ['Greetings', 'Directions', 'Food'];
  const lessonsByCategory = categories.map(category => ({
    name: category,
    items: lessons.filter(lesson => lesson.category === category),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <Headphones className="h-12 w-12" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Listening Practice</h1>
        <p className="text-xl text-muted-foreground">
          Practice pronunciation and improve your listening skills
        </p>
      </div>

      {/* Empty State */}
      {lessons.length === 0 && (
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No listening content available</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Listening practice for this language is coming soon. Try selecting a different language or explore other learning sections.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons by Category */}
      {lessonsByCategory.map((category) => (
        <div key={category.name} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <Badge variant="secondary">{category.items.length} {category.items.length === 1 ? 'word' : 'words'}</Badge>
          </div>

          <div className="grid gap-4">
            {category.items.map((lesson) => (
              <Card key={lesson.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold">{lesson.word}</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSpeak(lesson.word, lesson.id)}
                          disabled={playingId === lesson.id}
                          className="gap-2"
                        >
                          {playingId === lesson.id ? (
                            <Volume2 className="h-4 w-4 animate-pulse" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-lg text-muted-foreground">{lesson.translation}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSpeak(lesson.word, lesson.id)}
                      disabled={playingId === lesson.id}
                    >
                      Listen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Info Card */}
      {lessons.length > 0 && (
        <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              Practice Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Listen to each word multiple times</p>
            <p>• Try to repeat the pronunciation out loud</p>
            <p>• Pay attention to the accent and intonation</p>
            <p>• Practice regularly for best results</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
