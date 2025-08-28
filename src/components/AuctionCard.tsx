import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CountdownTimer } from '@/components/CountdownTimer';
import { Auction } from '@/types/auction';
import { Eye, Gavel, Heart, Trophy } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface AuctionCardProps {
  auction: Auction;
  onWatchToggle?: (auctionId: string) => void;
  isWatched?: boolean;
  onClick?: () => void;
  showBidStatus?: boolean;
  userFullName?: string;
  showWonBadge?: boolean;
}

export function AuctionCard({ 
  auction, 
  onWatchToggle, 
  isWatched, 
  onClick,
  showBidStatus,
  userFullName,
  showWonBadge
}: AuctionCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const isActive = auction.status === 'active';
  const isEnded = auction.status === 'ended' || auction.status === 'sold';
  
  // Check if user is winning this auction
  const isUserWinning = showBidStatus && userFullName && auction.bids.length > 0 && 
    auction.bids[auction.bids.length - 1].bidder === userFullName;
  
  // Check if user has bid on this auction
  const userHasBid = showBidStatus && userFullName && 
    auction.bids.some(bid => bid.bidder === userFullName);

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer" onClick={onClick}>
      <div className="relative">
        <div className="aspect-[4/3] bg-muted rounded-t-lg overflow-hidden">
          {auction.images.length > 0 ? (
            <img
              src={auction.images[0]}
              alt={auction.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gavel size={48} className="text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge variant={isActive ? "default" : isEnded ? "secondary" : "outline"}>
            {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
          </Badge>
          {showWonBadge && (
            <Badge variant="default" className="bg-green-600 text-white">
              <Trophy size={12} className="mr-1" />
              Won
            </Badge>
          )}
          {showBidStatus && userHasBid && (
            <Badge variant={isUserWinning ? "default" : "destructive"} className="bg-background/80 backdrop-blur-sm">
              {isUserWinning ? 'Winning' : 'Outbid'}
            </Badge>
          )}
          {auction.views && auction.views > 0 && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              <Eye size={12} className="mr-1" />
              {auction.views}
            </Badge>
          )}
        </div>

        {onWatchToggle && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm hover:bg-background",
              isWatched && "text-red-500 hover:text-red-600"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onWatchToggle(auction.id);
            }}
          >
            <Heart size={16} className={isWatched ? "fill-current" : ""} />
          </Button>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {auction.title}
        </h3>
        </h3>
        
        <div className="text-sm text-muted-foreground mb-3">
          {auction.category} • {auction.location}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Bid</span>
            <span className="font-bold text-lg">{formatCurrency(auction.currentBid)}</span>
          </div>
          
          {auction.bids.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {auction.bids.length} bid{auction.bids.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isActive && (
          <div className="w-full">
            <CountdownTimer 
              endTime={auction.endTime} 
              size="sm" 
              className="mb-3 justify-center"
            />
            <Button className="w-full" onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}>
              <Gavel size={16} className="mr-2" />
              Place Bid
            </Button>
          </div>
        )}
        
        {isEnded && (
          <div className="w-full text-center">
            <div className="text-sm text-muted-foreground mb-2">
              {auction.status === 'sold' ? 'Sold for' : 'Final bid'}
            </div>
            <div className="font-bold text-lg mb-3">
              {formatCurrency(auction.currentBid)}
            </div>
            <Button variant="outline" className="w-full" onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}>
              View Details
            </Button>
          </div>
        )}

        {auction.status === 'upcoming' && (
          <div className="w-full text-center">
            <div className="text-sm text-muted-foreground mb-2">Starts in</div>
            <CountdownTimer 
              endTime={auction.startTime} 
              size="sm" 
              className="mb-3 justify-center"
            />
            <Button variant="outline" className="w-full" onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}>
              View Details
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}