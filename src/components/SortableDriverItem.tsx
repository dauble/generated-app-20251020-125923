import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Driver } from '@shared/types';
import { Badge } from './ui/badge';
interface SortableDriverItemProps {
  driver: Driver;
  onRemove: (driverId: number, driverName: string) => void;
}
export function SortableDriverItem({ driver, onRemove }: SortableDriverItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: driver.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      className="flex items-center justify-between p-3 bg-background/50 border border-border hover:border-primary transition-colors rounded-lg"
    >
      <div className="flex items-center gap-4">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none p-2 text-muted-foreground hover:text-foreground" aria-label={`Drag to reorder ${driver.name}`}>
          <GripVertical />
        </button>
        <Avatar className="border-2 border-primary/50 h-12 w-12">
          <AvatarImage src={driver.headshotUrl} alt={driver.name} />
          <AvatarFallback className="bg-muted text-primary">
            <User />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-lg text-foreground">{driver.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{driver.teamName}</p>
            <Badge variant="outline" className="text-xs">${driver.price.toFixed(1)}M</Badge>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
        onClick={() => onRemove(driver.id, driver.name)}
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </motion.li>
  );
}