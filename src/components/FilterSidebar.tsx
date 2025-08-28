import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKV } from '@github/spark/hooks';
import { Auction } from '@/types/auction';
import { AuctionCard } from '@/components/AuctionCard';
import { SlidersHorizontal, TrendingUp, Clock, MapPin } from '@phosphor-icons/react';

interface FilterSidebarProps {
  auctions: Auction[];
  onFiltersChange: (filteredAuctions: Auction[]) => void;
}

export function FilterSidebar({ auctions, onFiltersChange }: FilterSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [condition, setCondition] = useState('');
  const [sortBy, setSortBy] = useState('ending-soon');

  const categories = [...new Set(auctions.map(a => a.category))];
  const locations = [...new Set(auctions.map(a => a.location))];
  const conditions = [...new Set(auctions.map(a => a.condition))];

  const applyFilters = () => {
    let filtered = [...auctions];

    if (selectedCategory) {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    if (selectedLocation) {
      filtered = filtered.filter(a => a.location === selectedLocation);
    }

    if (condition) {
      filtered = filtered.filter(a => a.condition === condition);
    }

    if (priceRange.min) {
      filtered = filtered.filter(a => a.currentBid >= parseFloat(priceRange.min));
    }

    if (priceRange.max) {
      filtered = filtered.filter(a => a.currentBid <= parseFloat(priceRange.max));
    }

    // Sort
    switch (sortBy) {
      case 'ending-soon':
        filtered.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.currentBid - b.currentBid);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.currentBid - a.currentBid);
        break;
      case 'most-bids':
        filtered.sort((a, b) => b.bids.length - a.bids.length);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        break;
    }

    onFiltersChange(filtered);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedLocation('');
    setPriceRange({ min: '', max: '' });
    setCondition('');
    setSortBy('ending-soon');
    onFiltersChange(auctions);
  };

  React.useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedLocation, priceRange, condition, sortBy]);

  const activeFilterCount = [
    selectedCategory,
    selectedLocation,
    condition,
    priceRange.min,
    priceRange.max
  ].filter(Boolean).length;

  return (
    <div className="w-72 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} />
              Filters
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{activeFilterCount}</Badge>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ending-soon">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    Ending Soon
                  </div>
                </SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="most-bids">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} />
                    Most Bids
                  </div>
                </SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      {location}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Condition</label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Any condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Condition</SelectItem>
                {conditions.map(cond => (
                  <SelectItem key={cond} value={cond}>
                    {cond}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Price Range</label>
            <div className="flex gap-2">
              <Input
                placeholder="Min"
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              />
              <Input
                placeholder="Max"
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Live Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Active Auctions</span>
            <span className="font-medium">
              {auctions.filter(a => a.status === 'active').length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ending Today</span>
            <span className="font-medium text-accent">
              {auctions.filter(a => {
                const today = new Date();
                const endDate = new Date(a.endTime);
                return endDate.toDateString() === today.toDateString();
              }).length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Bids</span>
            <span className="font-medium">
              {auctions.reduce((sum, a) => sum + a.bids.length, 0)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}