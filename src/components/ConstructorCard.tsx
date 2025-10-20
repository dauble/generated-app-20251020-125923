import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDraftStore } from '@/hooks/useDraftStore';
import type { Constructor } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
interface ConstructorCardProps {
  constructor: Constructor;
}
export function ConstructorCard({ constructor: team }: ConstructorCardProps) {
  const addConstructor = useDraftStore((s) => s.addConstructor);
  const isConstructorDrafted = useDraftStore((s) => s.isConstructorDrafted(team.id));
  const teamColor = team.teamColour ? `#${team.teamColour}` : '#ffffff';
  const handleDraftClick = () => {
    const result = addConstructor(team);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="bg-card/80 backdrop-blur-sm border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-glow-red flex flex-col h-full"
        style={{ '--team-color': teamColor } as React.CSSProperties}
      >
        <CardContent className="p-4 flex-1 flex flex-col items-center justify-center text-center" style={{ borderTop: `4px solid var(--team-color)` }}>
          <div className="w-32 h-32 mb-4 flex items-center justify-center">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={`${team.name} Logo`} className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                <Building className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground">{team.name}</h2>
        </CardContent>
        <CardFooter className="p-4 bg-background/50 mt-auto grid grid-cols-2 gap-2 items-center">
          <Badge variant="secondary" className="text-lg font-bold justify-center h-10">
            ${team.price.toFixed(1)}M
          </Badge>
          <Button
            onClick={handleDraftClick}
            disabled={isConstructorDrafted}
            variant={isConstructorDrafted ? 'default' : 'outline'}
            className={cn(
              'w-full font-bold transition-all duration-300',
              isConstructorDrafted ? 'cursor-not-allowed' : 'hover:bg-primary hover:text-primary-foreground'
            )}
          >
            {isConstructorDrafted ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            DRAFT
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
export function ConstructorCardSkeleton() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <CardContent className="p-4 flex-1 flex flex-col items-center justify-center text-center">
        <Skeleton className="w-32 h-32 rounded-full mb-4" />
        <Skeleton className="h-8 w-3/4" />
      </CardContent>
      <CardFooter className="p-4 grid grid-cols-2 gap-2 items-center">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}