export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  currentBid: number;
  minimumBid: number;
  bidIncrement: number;
  startingBid: number;
  reservePrice?: number;
  endTime: Date;
  startTime: Date;
  images: string[];
  location: string;
  condition: string;
  seller: string;
  bids: Bid[];
  watchers: number;
  status: 'upcoming' | 'active' | 'ended' | 'sold';
}

export interface Bid {
  id: string;
  auctionId: string;
  bidder: string;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  watchedAuctions: string[];
  activeBids: string[];
  wonAuctions: string[];
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
  count: number;
}