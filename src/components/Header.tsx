import { Search, Menu, User, Gavel, SignOut, Settings, Shield } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
  onDashboard?: () => void;
}

export function Header({ onSearch, onCategorySelect, onDashboard }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userBids] = useKV('user-bids', []);
  const [watchedAuctions] = useKV('watched-auctions', []);
  const { user, logout, isAuthenticated } = useAuth();
  
  const activeBidsCount = userBids.filter((bid: any) => bid.isWinning).length;
  const watchedCount = watchedAuctions.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const categories = [
    'Electronics',
    'Vehicles',
    'Jewelry & Watches',
    'Art & Collectibles',
    'Home & Garden',
    'Sports & Recreation',
    'Tools & Equipment',
    'Clothing & Accessories'
  ];

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-2">
              <Gavel size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AuctionHub</h1>
              <p className="text-xs text-muted-foreground">Online Auctions</p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative gap-2 h-10">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">
                      {user?.firstName} {user?.lastName}
                    </span>
                    {(activeBidsCount > 0 || watchedCount > 0) && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {activeBidsCount + watchedCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    {user?.role === 'admin' && (
                      <Badge variant="destructive" className="mt-1 text-xs">Admin</Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDashboard} className="gap-2">
                    <User size={16} />
                    My Dashboard
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem onClick={onDashboard} className="gap-2">
                      <Shield size={16} />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <div className="flex justify-between w-full">
                      <span>Active Bids</span>
                      <Badge variant="outline">{activeBidsCount}</Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <div className="flex justify-between w-full">
                      <span>Watched Items</span>
                      <Badge variant="outline">{watchedCount}</Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <Settings size={16} />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="gap-2 text-red-600">
                    <SignOut size={16} />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" className="gap-2">
                <User size={16} />
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="py-3 border-t">
          <div className="flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Menu size={16} />
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={() => onCategorySelect?.('')}>
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map((category) => (
                  <DropdownMenuItem 
                    key={category}
                    onClick={() => onCategorySelect?.(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex gap-4 text-sm">
              <Button variant="ghost" size="sm">Live Auctions</Button>
              <Button variant="ghost" size="sm">Ending Soon</Button>
              <Button variant="ghost" size="sm">New Listings</Button>
              <Button variant="ghost" size="sm">Featured</Button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}