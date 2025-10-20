import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Driver, Constructor } from '@shared/types';
import { DriverCard, DriverCardSkeleton } from '@/components/DriverCard';
import { ConstructorCard, ConstructorCardSkeleton } from '@/components/ConstructorCard';
import { DraftBoard } from '@/components/DraftBoard';
import { DriverStatsModal } from '@/components/DriverStatsModal';
import { Button } from '@/components/ui/button';
import { useDraftStore } from '@/hooks/useDraftStore';
import { Toaster } from '@/components/ui/sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BudgetTracker } from '@/components/BudgetTracker';
const queryClient = new QueryClient();
async function fetchDrivers(): Promise<Driver[]> {
  return api<Driver[]>('/api/drivers');
}
async function fetchConstructors(): Promise<Constructor[]> {
  return api<Constructor[]>('/api/constructors');
}
function ApexDraftDashboard() {
  const [isBoardOpen, setIsBoardOpen] = React.useState(false);
  const [selectedDriver, setSelectedDriver] = React.useState<Driver | null>(null);
  const [driverSortBy, setDriverSortBy] = React.useState('price');
  const [constructorSortBy, setConstructorSortBy] = React.useState('price');
  const [activeTab, setActiveTab] = React.useState('drivers');
  const draftedDriversCount = useDraftStore((s) => s.draftedDrivers.length);
  const draftedConstructorsCount = useDraftStore((s) => s.draftedConstructors.length);
  const totalDrafted = draftedDriversCount + draftedConstructorsCount;
  const { data: drivers, isLoading: isLoadingDrivers, isError: isErrorDrivers, error: errorDrivers } = useQuery<Driver[], Error>({
    queryKey: ['drivers'],
    queryFn: fetchDrivers,
  });
  const { data: constructors, isLoading: isLoadingConstructors, isError: isErrorConstructors, error: errorConstructors } = useQuery<Constructor[], Error>({
    queryKey: ['constructors'],
    queryFn: fetchConstructors,
  });
  const handleViewStats = (driver: Driver) => {
    setSelectedDriver(driver);
  };
  const sortedDrivers = React.useMemo(() => {
    if (!drivers) return [];
    const driversCopy = [...drivers];
    switch (driverSortBy) {
      case 'points':
        return driversCopy.sort((a, b) => (b.points ?? -1) - (a.points ?? -1));
      case 'name':
        return driversCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'team':
        return driversCopy.sort((a, b) => a.teamName.localeCompare(b.teamName));
      case 'price':
        return driversCopy.sort((a, b) => b.price - a.price);
      default:
        return driversCopy;
    }
  }, [drivers, driverSortBy]);
  const sortedConstructors = React.useMemo(() => {
    if (!constructors) return [];
    const constructorsCopy = [...constructors];
    switch (constructorSortBy) {
      case 'price':
        return constructorsCopy.sort((a, b) => b.price - a.price);
      case 'name':
        return constructorsCopy.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return constructorsCopy;
    }
  }, [constructors, constructorSortBy]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const isError = isErrorDrivers || isErrorConstructors;
  const error = errorDrivers || errorConstructors;
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 flex-wrap gap-4 py-2">
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl md:text-5xl font-black text-primary tracking-widest">
              APEXDRAFT
            </motion.h1>
            <div className="flex items-center gap-4">
              <BudgetTracker />
              <Button onClick={() => setIsBoardOpen(true)} variant="outline" className="font-bold rounded-md border-2 transition-all duration-300 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-glow-red relative h-full">
                <Users className="mr-2 h-4 w-4" />
                DRAFT BOARD
                {totalDrafted > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground animate-pulse">
                    {totalDrafted}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-32 md:pt-36 lg:pt-40">
          <Tabs defaultValue="drivers" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <TabsList>
                <TabsTrigger value="drivers">Drivers</TabsTrigger>
                <TabsTrigger value="constructors">Constructors</TabsTrigger>
              </TabsList>
              <AnimatePresence mode="wait">
                {activeTab === 'drivers' && (
                  <motion.div key="driver-sort" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <Select value={driverSortBy} onValueChange={setDriverSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="points">Points</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
                {activeTab === 'constructors' && (
                  <motion.div key="constructor-sort" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <Select value={constructorSortBy} onValueChange={setConstructorSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              {isError && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center text-destructive py-20">
                  <AlertTriangle className="w-16 h-16 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">ERROR: FAILED TO LOAD DATA</h2>
                  <p className="text-muted-foreground max-w-md">{error?.message || 'Could not fetch data from the server.'}</p>
                </motion.div>
              )}
              {!isError && (
                <>
                  <TabsContent value="drivers">
                    {isLoadingDrivers ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <DriverCardSkeleton key={i} />)}
                      </div>
                    ) : (
                      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {sortedDrivers.map((driver) => <DriverCard key={driver.id} driver={driver} onViewStats={handleViewStats} />)}
                      </motion.div>
                    )}
                  </TabsContent>
                  <TabsContent value="constructors">
                    {isLoadingConstructors ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => <ConstructorCardSkeleton key={i} />)}
                      </div>
                    ) : (
                      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {sortedConstructors.map((team) => <ConstructorCard key={team.id} constructor={team} />)}
                      </motion.div>
                    )}
                  </TabsContent>
                </>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </main>
      <footer className="text-center py-6 text-muted-foreground/50 text-sm mt-12">
        Built with ❤️ at Cloudflare
      </footer>
      <DraftBoard open={isBoardOpen} onOpenChange={setIsBoardOpen} />
      <DriverStatsModal driver={selectedDriver} open={!!selectedDriver} onOpenChange={(isOpen) => !isOpen && setSelectedDriver(null)} />
      <Toaster toastOptions={{ style: { background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', fontFamily: 'Inter, sans-serif' } }} />
    </div>
  );
}
export function HomePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApexDraftDashboard />
    </QueryClientProvider>
  );
}