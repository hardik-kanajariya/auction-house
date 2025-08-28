import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AuctionCard } from '@/components/AuctionCard';
import { ProfileSkeleton, AuctionCardSkeleton } from '@/components/LoadingStates';
import { Auction } from '@/types/auction';
import { User, Eye, Heart, Settings, Gavel, Trophy, Clock, DollarSign } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const UserDashboard = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [auctions, setAuctions] = useKV<Auction[]>('auctions', []);
  const [watchedAuctions, setWatchedAuctions] = useKV<string[]>('watched-auctions', []);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || ''
    }
  });

  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setDataLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const myBids = auctions.filter(auction => 
    auction.bids.some(bid => bid.bidder === `${user?.firstName} ${user?.lastName}`)
  );

  const watchedAuctionsList = auctions.filter(auction => 
    watchedAuctions.includes(auction.id)
  );

  const wonAuctions = auctions.filter(auction => 
    auction.status === 'sold' && 
    auction.bids.length > 0 && 
    auction.bids[auction.bids.length - 1].bidder === `${user?.firstName} ${user?.lastName}`
  );

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profileData);
  };

  const handleWatchToggle = (auctionId: string) => {
    setWatchedAuctions(current => 
      current.includes(auctionId)
        ? current.filter(id => id !== auctionId)
        : [...current, auctionId]
    );
  };

  const totalBidAmount = myBids.reduce((sum, auction) => {
    const myBidsInAuction = auction.bids.filter(bid => 
      bid.bidder === `${user?.firstName} ${user?.lastName}`
    );
    return sum + myBidsInAuction.reduce((bidSum, bid) => bidSum + bid.amount, 0);
  }, 0);

  const activeWinningBids = myBids.filter(auction => 
    auction.status === 'active' && 
    auction.bids.length > 0 && 
    auction.bids[auction.bids.length - 1].bidder === `${user?.firstName} ${user?.lastName}`
  ).length;

  if (dataLoading) {
    return (
      <div className=\"container mx-auto px-4 py-8\">
        <div className=\"mb-8\">
          <h1 className=\"text-3xl font-bold mb-2\">My Dashboard</h1>
          <p className=\"text-muted-foreground\">Manage your auctions and profile</p>
        </div>
        
        <Tabs defaultValue=\"overview\" className=\"space-y-6\">
          <TabsList>
            <TabsTrigger value=\"overview\">Overview</TabsTrigger>
            <TabsTrigger value=\"bids\">My Bids</TabsTrigger>
            <TabsTrigger value=\"watching\">Watching</TabsTrigger>
            <TabsTrigger value=\"won\">Won</TabsTrigger>
            <TabsTrigger value=\"profile\">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value=\"overview\">
            <div className=\"grid grid-cols-1 md:grid-cols-4 gap-6 mb-8\">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardContent className=\"p-6\">
                    <ProfileSkeleton />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className=\"container mx-auto px-4 py-8\">
      <div className=\"mb-8\">
        <h1 className=\"text-3xl font-bold mb-2\">My Dashboard</h1>
        <p className=\"text-muted-foreground\">Welcome back, {user?.firstName}!</p>
      </div>
      
      <Tabs defaultValue=\"overview\" className=\"space-y-6\">
        <TabsList>
          <TabsTrigger value=\"overview\" className=\"gap-2\">
            <Eye size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value=\"bids\" className=\"gap-2\">
            <Gavel size={16} />
            My Bids ({myBids.length})
          </TabsTrigger>
          <TabsTrigger value=\"watching\" className=\"gap-2\">
            <Heart size={16} />
            Watching ({watchedAuctionsList.length})
          </TabsTrigger>
          <TabsTrigger value=\"won\" className=\"gap-2\">
            <Trophy size={16} />
            Won ({wonAuctions.length})
          </TabsTrigger>
          <TabsTrigger value=\"profile\" className=\"gap-2\">
            <Settings size={16} />
            Profile
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value=\"overview\" className=\"space-y-6\">
          {/* Stats Cards */}
          <div className=\"grid grid-cols-1 md:grid-cols-4 gap-6\">
            <Card>
              <CardContent className=\"p-6\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-medium text-muted-foreground\">Active Bids</p>
                    <p className=\"text-2xl font-bold\">{myBids.filter(a => a.status === 'active').length}</p>
                  </div>
                  <Gavel className=\"h-8 w-8 text-primary\" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className=\"p-6\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-medium text-muted-foreground\">Winning</p>
                    <p className=\"text-2xl font-bold text-green-600\">{activeWinningBids}</p>
                  </div>
                  <Trophy className=\"h-8 w-8 text-green-600\" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className=\"p-6\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-medium text-muted-foreground\">Total Bid Amount</p>
                    <p className=\"text-2xl font-bold\">${totalBidAmount.toLocaleString()}</p>
                  </div>
                  <DollarSign className=\"h-8 w-8 text-accent\" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className=\"p-6\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-medium text-muted-foreground\">Items Won</p>
                    <p className=\"text-2xl font-bold text-purple-600\">{wonAuctions.length}</p>
                  </div>
                  <Trophy className=\"h-8 w-8 text-purple-600\" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest bidding activity</CardDescription>
            </CardHeader>
            <CardContent>
              {myBids.length === 0 ? (
                <div className=\"text-center py-8\">
                  <Gavel size={48} className=\"text-muted-foreground mx-auto mb-4\" />
                  <p className=\"text-muted-foreground\">No bidding activity yet</p>
                  <p className=\"text-sm text-muted-foreground\">Start bidding to see your activity here</p>
                </div>
              ) : (
                <div className=\"space-y-4\">
                  {myBids.slice(0, 3).map(auction => {
                    const myBidsInAuction = auction.bids.filter(bid => 
                      bid.bidder === `${user?.firstName} ${user?.lastName}`
                    );
                    const myHighestBid = Math.max(...myBidsInAuction.map(b => b.amount));
                    const isWinning = auction.bids.length > 0 && 
                      auction.bids[auction.bids.length - 1].bidder === `${user?.firstName} ${user?.lastName}`;
                    
                    return (
                      <div key={auction.id} className=\"flex items-center justify-between p-4 border rounded-lg\">
                        <div className=\"flex items-center gap-4\">
                          <div className=\"w-16 h-16 bg-muted rounded-lg flex items-center justify-center\">
                            <Gavel size={24} className=\"text-muted-foreground\" />
                          </div>
                          <div>
                            <h4 className=\"font-medium\">{auction.title}</h4>
                            <p className=\"text-sm text-muted-foreground\">
                              Your highest bid: ${myHighestBid.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className=\"text-right\">
                          <Badge variant={isWinning ? 'default' : 'secondary'}>
                            {isWinning ? 'Winning' : 'Outbid'}
                          </Badge>
                          <p className=\"text-sm text-muted-foreground mt-1\">
                            Current: ${auction.currentBid.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value=\"bids\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>My Bids</CardTitle>
              <CardDescription>All auctions you've bid on</CardDescription>
            </CardHeader>
            <CardContent>
              {myBids.length === 0 ? (
                <div className=\"text-center py-12\">
                  <Gavel size={48} className=\"text-muted-foreground mx-auto mb-4\" />
                  <h3 className=\"text-lg font-semibold mb-2\">No bids yet</h3>
                  <p className=\"text-muted-foreground\">Start bidding on auctions to see them here</p>
                </div>
              ) : (
                <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
                  {myBids.map(auction => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      onWatchToggle={handleWatchToggle}
                      isWatched={watchedAuctions.includes(auction.id)}
                      onClick={() => {}}
                      showBidStatus={true}
                      userFullName={`${user?.firstName} ${user?.lastName}`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value=\"watching\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>Watched Auctions</CardTitle>
              <CardDescription>Auctions you're keeping an eye on</CardDescription>
            </CardHeader>
            <CardContent>
              {watchedAuctionsList.length === 0 ? (
                <div className=\"text-center py-12\">
                  <Heart size={48} className=\"text-muted-foreground mx-auto mb-4\" />
                  <h3 className=\"text-lg font-semibold mb-2\">No watched auctions</h3>
                  <p className=\"text-muted-foreground\">Add auctions to your watchlist to see them here</p>
                </div>
              ) : (
                <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
                  {watchedAuctionsList.map(auction => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      onWatchToggle={handleWatchToggle}
                      isWatched={true}
                      onClick={() => {}}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value=\"won\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>Won Auctions</CardTitle>
              <CardDescription>Congratulations on your winning bids!</CardDescription>
            </CardHeader>
            <CardContent>
              {wonAuctions.length === 0 ? (
                <div className=\"text-center py-12\">
                  <Trophy size={48} className=\"text-muted-foreground mx-auto mb-4\" />
                  <h3 className=\"text-lg font-semibold mb-2\">No wins yet</h3>
                  <p className=\"text-muted-foreground\">Keep bidding to win your first auction!</p>
                </div>
              ) : (
                <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
                  {wonAuctions.map(auction => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      onWatchToggle={handleWatchToggle}
                      isWatched={watchedAuctions.includes(auction.id)}
                      onClick={() => {}}
                      showWonBadge={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value=\"profile\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className=\"space-y-6\">
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"firstName\">First Name</Label>
                    <Input
                      id=\"firstName\"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"lastName\">Last Name</Label>
                    <Input
                      id=\"lastName\"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className=\"space-y-2\">
                  <Label htmlFor=\"email\">Email</Label>
                  <Input
                    id=\"email\"
                    type=\"email\"
                    value={user?.email || ''}
                    disabled
                    className=\"bg-muted\"
                  />
                  <p className=\"text-xs text-muted-foreground\">Email cannot be changed</p>
                </div>
                
                <div className=\"space-y-2\">
                  <Label htmlFor=\"phone\">Phone</Label>
                  <Input
                    id=\"phone\"
                    type=\"tel\"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div className=\"space-y-4\">
                  <h3 className=\"text-lg font-semibold\">Address</h3>
                  
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"street\">Street Address</Label>
                    <Input
                      id=\"street\"
                      value={profileData.address.street}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
                    <div className=\"space-y-2\">
                      <Label htmlFor=\"city\">City</Label>
                      <Input
                        id=\"city\"
                        value={profileData.address.city}
                        onChange={(e) => setProfileData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, city: e.target.value }
                        }))}
                      />
                    </div>
                    
                    <div className=\"space-y-2\">
                      <Label htmlFor=\"state\">State</Label>
                      <Input
                        id=\"state\"
                        value={profileData.address.state}
                        onChange={(e) => setProfileData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, state: e.target.value }
                        }))}
                      />
                    </div>
                    
                    <div className=\"space-y-2\">
                      <Label htmlFor=\"zipCode\">ZIP Code</Label>
                      <Input
                        id=\"zipCode\"
                        value={profileData.address.zipCode}
                        onChange={(e) => setProfileData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, zipCode: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"country\">Country</Label>
                    <Input
                      id=\"country\"
                      value={profileData.address.country}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, country: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                
                <Button type=\"submit\" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};