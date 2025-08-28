import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/Header';
import { FilterSidebar } from '@/components/FilterSidebar';
import { AuctionCard } from '@/components/AuctionCard';
import { BiddingPanel } from '@/components/BiddingPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKV } from '@github/spark/hooks';
import { Auction, Bid } from '@/types/auction';
import { TrendingUp, Clock, Eye, Gavel } from '@phosphor-icons/react';

// Helper function to convert date strings to Date objects
const convertDatesToObjects = (auctions: any[]): Auction[] => {
  return auctions.map(auction => ({
    ...auction,
    endTime: new Date(auction.endTime),
    startTime: new Date(auction.startTime),
    bids: auction.bids.map((bid: any) => ({
      ...bid,
      timestamp: new Date(bid.timestamp)
    }))
  }));
};

function App() {
  const [storedAuctions, setStoredAuctions] = useKV<any[]>('auctions', []);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [watchedAuctions, setWatchedAuctions] = useKV<string[]>('watched-auctions', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Convert stored auctions to proper Date objects
  useEffect(() => {
    const convertedAuctions = convertDatesToObjects(storedAuctions);
    setAuctions(convertedAuctions);
  }, [storedAuctions]);

  useEffect(() => {
    let filtered = auctions;

    if (searchQuery) {
      filtered = filtered.filter(auction =>
        auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auction.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(auction => auction.category === selectedCategory);
    }

    setFilteredAuctions(filtered);
  }, [auctions, searchQuery, selectedCategory]);

  const handleWatchToggle = (auctionId: string) => {
    setWatchedAuctions(current => 
      current.includes(auctionId)
        ? current.filter(id => id !== auctionId)
        : [...current, auctionId]
    );
  };

  const handleBidPlaced = (bid: Bid) => {
    const updatedAuctions = auctions.map(auction =>
      auction.id === bid.auctionId
        ? {
            ...auction,
            currentBid: bid.amount,
            bids: [...auction.bids.map(b => ({ ...b, isWinning: false })), bid]
          }
        : auction
    );
    setAuctions(updatedAuctions);
    
    // Update stored auctions as well
    setStoredAuctions(updatedAuctions.map(auction => ({
      ...auction,
      endTime: auction.endTime.toISOString(),
      startTime: auction.startTime.toISOString(),
      bids: auction.bids.map(bid => ({
        ...bid,
        timestamp: bid.timestamp.toISOString()
      }))
    })));
  };

  const featuredAuctions = auctions.filter(a => a.status === 'active').slice(0, 3);
  const endingSoonAuctions = auctions
    .filter(a => a.status === 'active')
    .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={setSearchQuery}
        onCategorySelect={setSelectedCategory}
      />

      <main className="container mx-auto px-4 py-8">
        {!searchQuery && !selectedCategory ? (
          // Homepage
          <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center py-12 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">
                  Discover Amazing Auctions
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Bid on unique items from trusted sellers worldwide. Join thousands of active bidders today.
                </p>
                <div className="flex justify-center gap-4">
                  <Button size="lg" className="gap-2">
                    <Gavel size={20} />
                    Start Bidding
                  </Button>
                  <Button variant="outline" size="lg">
                    Browse Categories
                  </Button>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-card rounded-lg border">
                <div className="text-3xl font-bold text-primary mb-2">
                  {auctions.filter(a => a.status === 'active').length}
                </div>
                <div className="text-muted-foreground">Live Auctions</div>
              </div>
              <div className="text-center p-6 bg-card rounded-lg border">
                <div className="text-3xl font-bold text-accent mb-2">
                  {auctions.reduce((sum, a) => sum + a.bids.length, 0)}
                </div>
                <div className="text-muted-foreground">Total Bids</div>
              </div>
              <div className="text-center p-6 bg-card rounded-lg border">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {auctions.filter(a => a.status === 'sold').length}
                </div>
                <div className="text-muted-foreground">Items Sold</div>
              </div>
              <div className="text-center p-6 bg-card rounded-lg border">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {new Set(auctions.flatMap(a => a.bids.map(b => b.bidder))).size}
                </div>
                <div className="text-muted-foreground">Active Bidders</div>
              </div>
            </section>

            {/* Featured Auctions */}
            {featuredAuctions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={24} className="text-accent" />
                  <h2 className="text-2xl font-bold">Featured Auctions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredAuctions.map(auction => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      onWatchToggle={handleWatchToggle}
                      isWatched={watchedAuctions.includes(auction.id)}
                      onClick={() => setSelectedAuction(auction)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Ending Soon */}
            {endingSoonAuctions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Clock size={24} className="text-accent" />
                  <h2 className="text-2xl font-bold">Ending Soon</h2>
                  <Badge variant="outline">Don't miss out!</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {endingSoonAuctions.map(auction => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      onWatchToggle={handleWatchToggle}
                      isWatched={watchedAuctions.includes(auction.id)}
                      onClick={() => setSelectedAuction(auction)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          // Search/Category Results
          <div className="flex gap-8">
            <FilterSidebar 
              auctions={filteredAuctions}
              onFiltersChange={setFilteredAuctions}
            />
            
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">
                  {searchQuery ? `Search results for "${searchQuery}"` : selectedCategory}
                </h1>
                <p className="text-muted-foreground">
                  {filteredAuctions.length} auction{filteredAuctions.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAuctions.map(auction => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    onWatchToggle={handleWatchToggle}
                    isWatched={watchedAuctions.includes(auction.id)}
                    onClick={() => setSelectedAuction(auction)}
                  />
                ))}
              </div>

              {filteredAuctions.length === 0 && (
                <div className="text-center py-12">
                  <Gavel size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No auctions found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Auction Detail Modal */}
      <Dialog open={!!selectedAuction} onOpenChange={() => setSelectedAuction(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedAuction && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedAuction.title}</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    {selectedAuction.images.length > 0 ? (
                      <img
                        src={selectedAuction.images[0]}
                        alt={selectedAuction.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gavel size={64} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {selectedAuction.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedAuction.images.slice(1, 5).map((image, index) => (
                        <div key={index} className="aspect-square bg-muted rounded overflow-hidden">
                          <img
                            src={image}
                            alt={`${selectedAuction.title} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="font-semibold mb-3">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selectedAuction.description}
                    </p>
                  </div>
                </div>

                {/* Bidding Panel */}
                <div>
                  <BiddingPanel 
                    auction={selectedAuction}
                    onBidPlaced={handleBidPlaced}
                  />
                </div>
              </div>

              {/* Bidding History */}
              {selectedAuction.bids.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold mb-4">Bidding History</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedAuction.bids
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((bid) => (
                        <div key={bid.id} className="flex justify-between items-center p-3 bg-muted rounded">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{bid.bidder}</span>
                            {bid.isWinning && <Badge variant="default">Winning</Badge>}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              ${bid.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(bid.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

export default App;