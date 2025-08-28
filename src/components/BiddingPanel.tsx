import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Clock, MapPin, Tag } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Auction, Bid } from '@/types/auction';
import { CountdownTimer } from '@/components/CountdownTimer';
import { toast } from 'sonner';

interface BiddingPanelProps {
  auction: Auction;
  onBidPlaced?: (bid: Bid) => void;
}

export function BiddingPanel({ auction, onBidPlaced }: BiddingPanelProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [userBids, setUserBids] = useKV<Bid[]>('user-bids', []);
  const [currentUser] = useKV('current-user', 'user123');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const minimumNextBid = auction.currentBid + auction.bidIncrement;
  const isActive = auction.status === 'active';
  const userHasActiveBid = userBids.some(bid => 
    bid.auctionId === auction.id && bid.isWinning
  );

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    
    if (!amount || amount < minimumNextBid) {
      toast.error(`Minimum bid is ${formatCurrency(minimumNextBid)}`);
      return;
    }

    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      auctionId: auction.id,
      bidder: currentUser,
      amount,
      timestamp: new Date(),
      isWinning: true,
    };

    // Update user bids
    setUserBids(currentBids => {
      const updatedBids = currentBids.map(bid =>
        bid.auctionId === auction.id ? { ...bid, isWinning: false } : bid
      );
      return [...updatedBids, newBid];
    });

    // Update auction data would happen here in real app
    onBidPlaced?.(newBid);
    
    toast.success(`Bid placed for ${formatCurrency(amount)}!`);
    setBidAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Current Status</h3>
          <Badge variant={isActive ? "default" : "secondary"}>
            {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Current Bid</div>
            <div className="text-2xl font-bold">{formatCurrency(auction.currentBid)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Minimum Bid</div>
            <div className="text-xl font-semibold text-accent">
              {formatCurrency(minimumNextBid)}
            </div>
          </div>
        </div>

        {isActive && (
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Time Remaining:</span>
            <CountdownTimer endTime={auction.endTime} size="sm" />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{auction.bids.length} bidders</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{auction.location}</span>
          </div>
        </div>
      </div>

      {/* Bidding Form */}
      {isActive && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>
          
          {userHasActiveBid && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-accent font-medium">
                <Tag size={16} />
                You are the current high bidder!
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Bid Amount (minimum: {formatCurrency(minimumNextBid)})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={minimumNextBid.toString()}
                  className="pl-8"
                  step={auction.bidIncrement}
                  min={minimumNextBid}
                />
              </div>
            </div>
            
            <Button 
              onClick={handlePlaceBid} 
              className="w-full"
              disabled={!bidAmount || parseFloat(bidAmount) < minimumNextBid}
            >
              Place Bid {bidAmount && `- ${formatCurrency(parseFloat(bidAmount))}`}
            </Button>
          </div>
        </div>
      )}

      {/* Auction Details */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Auction Details</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Starting bid:</span>
            <span className="font-medium">{formatCurrency(auction.startingBid)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bid increment:</span>
            <span className="font-medium">{formatCurrency(auction.bidIncrement)}</span>
          </div>
          {auction.reservePrice && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserve price:</span>
              <span className="font-medium">{formatCurrency(auction.reservePrice)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Started:</span>
            <span className="font-medium">{formatDateTime(auction.startTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ends:</span>
            <span className="font-medium">{formatDateTime(auction.endTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Condition:</span>
            <span className="font-medium">{auction.condition}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Seller:</span>
            <span className="font-medium">{auction.seller}</span>
          </div>
        </div>
      </div>
    </div>
  );
}