import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, User, BarChart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDraftStore } from '@/hooks/useDraftStore';
import type { Driver } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
interface DriverCardProps {
  driver: Driver;
  onViewStats: (driver: Driver) => void;
}
export function DriverCard({ driver, onViewStats }: DriverCardProps) {
  const addDriver = useDraftStore((s) => s.addDriver);
  const isDriverDrafted = useDraftStore((s) => s.isDriverDrafted(driver.id));
  const teamColor = driver.teamColour ? `#${driver.teamColour}` : '#ffffff';
  const handleDraftClick = () => {
    const result = addDriver(driver);
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
        <div className="p-0 relative">
          <button
            onClick={() => onViewStats(driver)}
            className="w-full text-left relative block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-t-lg"
          >
            <div className="aspect-[4/3] w-full overflow-hidden relative">
              {driver.headshotUrl ? (
                <img
                  src={driver.headshotUrl}
                  alt={driver.name}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 p-4">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">{driver.name}</h2>
              <p className="text-sm font-mono text-muted-foreground">{driver.teamName}</p>
            </div>
          </button>
          <div
            className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center text-3xl font-black text-white rounded-md"
            style={{ backgroundColor: 'var(--team-color)' }}
          >
            {driver.number}
          </div>
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {driver.points !== null && (
              <Badge variant="secondary" className="bg-background/80 text-foreground font-bold">
                <Star className="h-3 w-3 mr-1.5 text-primary" />
                {driver.points} PTS
              </Badge>
            )}
            <Badge variant="secondary" className="bg-background/80 text-foreground font-bold">
              ${driver.price.toFixed(1)}M
            </Badge>
          </div>
        </div>
        <CardFooter className="p-4 bg-background/50 mt-auto grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={() => onViewStats(driver)}
            className="w-full font-bold"
          >
            <BarChart className="mr-2 h-4 w-4" /> STATS
          </Button>
          <Button
            onClick={handleDraftClick}
            disabled={isDriverDrafted}
            variant={isDriverDrafted ? 'default' : 'outline'}
            className={cn(
              'w-full font-bold transition-all duration-300',
              isDriverDrafted
                ? 'cursor-not-allowed'
                : 'hover:bg-primary hover:text-primary-foreground'
            )}
          >
            {isDriverDrafted ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            DRAFT
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
export function DriverCardSkeleton() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <CardHeader className="p-0 relative">
        <Skeleton className="aspect-[4/3] w-full" />
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter className="p-4">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}