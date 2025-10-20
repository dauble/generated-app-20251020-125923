import * as React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDraftStore, MAX_DRIVERS, MAX_CONSTRUCTORS } from '@/hooks/useDraftStore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { SortableDriverItem } from './SortableDriverItem';
import { Button } from './ui/button';
import { Trash2, Building, User, PartyPopper } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { Constructor } from '@shared/types';
import { motion } from 'framer-motion';
interface DraftBoardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const ConstructorItem = ({ team, onRemove }: { team: Constructor; onRemove: (id: number, name: string) => void }) => (
  <li className="flex items-center justify-between p-3 bg-background/50 border border-border rounded-lg">
    <div className="flex items-center gap-4">
      <Avatar className="border-2 border-primary/50 h-12 w-12 p-1">
        <AvatarImage src={team.logoUrl ?? ''} alt={team.name} className="object-contain" />
        <AvatarFallback className="bg-muted text-primary"><Building /></AvatarFallback>
      </Avatar>
      <div>
        <p className="font-bold text-lg text-foreground">{team.name}</p>
        <p className="text-xs text-muted-foreground">${team.price.toFixed(1)}M</p>
      </div>
    </div>
    <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-destructive/20 hover:text-destructive" onClick={() => onRemove(team.id, team.name)}>
      <Trash2 className="h-5 w-5" />
    </Button>
  </li>
);
export function DraftBoard({ open, onOpenChange }: DraftBoardProps) {
  const draftedDrivers = useDraftStore((s) => s.draftedDrivers);
  const draftedConstructors = useDraftStore((s) => s.draftedConstructors);
  const removeDriver = useDraftStore((s) => s.removeDriver);
  const removeConstructor = useDraftStore((s) => s.removeConstructor);
  const reorderDrivers = useDraftStore((s) => s.reorderDrivers);
  const clearDraft = useDraftStore((s) => s.clearDraft);
  const isDraftComplete = draftedDrivers.length === MAX_DRIVERS && draftedConstructors.length === MAX_CONSTRUCTORS;
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const toastOptions = {
    style: { background: 'hsl(var(--background))', fontFamily: 'Inter, sans-serif' },
  };
  const handleRemoveDriver = (driverId: number, driverName: string) => {
    removeDriver(driverId);
    toast.error(`${driverName} removed from draft.`, { ...toastOptions, style: { ...toastOptions.style, color: 'hsl(var(--destructive))', border: '1px solid hsl(var(--destructive))' } });
  };
  const handleRemoveConstructor = (constructorId: number, constructorName: string) => {
    removeConstructor(constructorId);
    toast.error(`${constructorName} removed from draft.`, { ...toastOptions, style: { ...toastOptions.style, color: 'hsl(var(--destructive))', border: '1px solid hsl(var(--destructive))' } });
  };
  const handleClearDraft = () => {
    clearDraft();
    toast.info('Draft board has been cleared.', { ...toastOptions, style: { ...toastOptions.style, color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' } });
  };
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = draftedDrivers.findIndex((d) => d.id === active.id);
      const newIndex = draftedDrivers.findIndex((d) => d.id === over.id);
      reorderDrivers(oldIndex, newIndex);
    }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-background border-l border-primary text-primary-foreground font-sans p-0 w-full sm:max-w-md flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-3xl text-primary">DRAFT BOARD</SheetTitle>
            {(draftedDrivers.length > 0 || draftedConstructors.length > 0) && (
              <Button variant="destructive" size="sm" onClick={handleClearDraft}>
                <Trash2 className="h-4 w-4 mr-2" /> Clear All
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            <section>
              <h3 className="text-lg font-bold text-foreground mb-3">DRIVERS ({draftedDrivers.length}/{MAX_DRIVERS})</h3>
              {draftedDrivers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No drivers drafted.</p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={draftedDrivers} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-4">
                      {draftedDrivers.map((driver) => <SortableDriverItem key={driver.id} driver={driver} onRemove={handleRemoveDriver} />)}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
            </section>
            <section>
              <h3 className="text-lg font-bold text-foreground mb-3">CONSTRUCTORS ({draftedConstructors.length}/{MAX_CONSTRUCTORS})</h3>
              {draftedConstructors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No constructors drafted.</p>
              ) : (
                <ul className="space-y-4">
                  {draftedConstructors.map((team) => <ConstructorItem key={team.id} team={team} onRemove={handleRemoveConstructor} />)}
                </ul>
              )}
            </section>
          </div>
        </ScrollArea>
        {isDraftComplete && (
          <SheetFooter className="p-4 border-t border-border bg-background">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-md bg-primary/10 text-primary font-bold"
            >
              <PartyPopper className="h-6 w-6" />
              <span>Team Complete! Ready to race.</span>
            </motion.div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}