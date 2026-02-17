import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  completedCount?: number;
  totalCount?: number;
  onNavigate: () => void;
  variant?: 'default' | 'learning' | 'listening' | 'conversation' | 'culture' | 'games';
}

export default function SectionCard({
  title,
  description,
  icon: Icon,
  completedCount,
  totalCount,
  onNavigate,
  variant = 'default',
}: SectionCardProps) {
  const variantColors = {
    default: 'from-amber-500 to-orange-500',
    learning: 'from-indigo-500 to-violet-500',
    listening: 'from-blue-500 to-cyan-500',
    conversation: 'from-purple-500 to-pink-500',
    culture: 'from-green-500 to-emerald-500',
    games: 'from-red-500 to-rose-500',
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${variantColors[variant]}`} />
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${variantColors[variant]} text-white`}>
            <Icon className="h-6 w-6" />
          </div>
          {completedCount !== undefined && totalCount !== undefined && (
            <Badge variant="secondary">
              {completedCount}/{totalCount}
            </Badge>
          )}
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onNavigate} className="w-full group-hover:scale-105 transition-transform">
          Start Learning
        </Button>
      </CardContent>
    </Card>
  );
}
