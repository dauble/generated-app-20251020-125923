import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, AlertTriangle, Trophy, Clock, Repeat, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { Driver, DriverStats } from '@shared/types';
async function fetchDriverStats(driverId: number): Promise<DriverStats> {
  return api<DriverStats>(`/api/drivers/${driverId}/stats`);
}
interface DriverStatsModalProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number | null }) => (
  <motion.div
    className="flex items-center justify-between p-4 bg-background border border-border rounded-lg"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center gap-4">
      <div className="text-primary">{icon}</div>
      <span className="text-muted-foreground">{label}</span>
    </div>
    <span className="font-bold text-2xl text-foreground">{value ?? 'N/A'}</span>
  </motion.div>
);
export function DriverStatsModal({ driver, open, onOpenChange }: DriverStatsModalProps) {
  const { data: stats, isLoading, isError, error } = useQuery<DriverStats, Error>({
    queryKey: ['driverStats', driver?.id],
    queryFn: () => {
      if (!driver) {
        return Promise.reject(new Error("Driver is not available."));
      }
      return fetchDriverStats(driver.id);
    },
    enabled: !!driver && open,
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && driver && (
          <DialogContent className="bg-background border-2 border-primary text-foreground font-sans p-0 max-w-2xl rounded-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <DialogHeader className="p-6 border-b border-border text-left relative">
                <div className="flex items-center gap-4">
                  <img src={driver.headshotUrl} alt={driver.name} className="w-24 h-24 object-cover border-2 border-primary rounded-md" />
                  <div>
                    <DialogTitle className="text-4xl text-primary">{driver.name}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">{driver.teamName}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="p-6">
                {isLoading && (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                )}
                {isError && (
                  <div className="flex flex-col items-center justify-center text-center text-destructive py-10">
                    <AlertTriangle className="w-12 h-12 mb-4" />
                    <h3 className="text-xl font-bold mb-2">STATS UNAVAILABLE</h3>
                    <p className="text-muted-foreground text-sm">{error?.message || 'Could not fetch stats.'}</p>
                  </div>
                )}
                {stats && (
                  <div className="space-y-4">
                    <StatItem icon={<Trophy size={24} />} label="LAST POSITION" value={stats.position} />
                    <StatItem icon={<Star size={24} />} label="POINTS (EST.)" value={stats.points} />
                    <StatItem icon={<Clock size={24} />} label="FASTEST LAP" value={stats.fastestLapTime} />
                    <StatItem icon={<Repeat size={24} />} label="LAPS COMPLETED" value={stats.lapsCompleted} />
                  </div>
                )}
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}