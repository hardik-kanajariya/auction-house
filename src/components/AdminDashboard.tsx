import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingState, AuctionCardSkeleton } from '@/components/LoadingStates';
import { Auction } from '@/types/auction';
import { User } from '@/types/auth';
import { 
  Plus, 
  Edit, 
  Trash, 
  Users, 
  Gavel, 
  DollarSign, 
  TrendingUp,
  Eye,
  Settings,
  Shield,
  Archive,
  BarChart
} from '@phosphor-icons/react';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useKV<Auction[]>('auctions', []);
  const [users, setUsers] = useKV<User[]>('users', []);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [showCreateAuction, setShowCreateAuction] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);

  const [newAuction, setNewAuction] = useState({
    title: '',
    description: '',
    category: '',
    startingBid: 0,
    buyNowPrice: 0,
    endTime: '',
    images: [''],
    condition: 'new' as const,
    location: '',
    seller: 'Admin',
    shippingCost: 0
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setDataLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize with sample data if empty
  useEffect(() => {
    if (auctions.length === 0) {
      const sampleAuctions: Auction[] = [
        {
          id: 'auction_1',
          title: 'Vintage Rolex Submariner',
          description: 'Classic 1980s Rolex Submariner in excellent condition. Recently serviced with original box and papers.',
          category: 'Watches',
          currentBid: 8500,
          startingBid: 5000,
          buyNowPrice: 12000,
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          images: [],
          condition: 'excellent',
          location: 'New York, NY',
          seller: 'Admin',
          status: 'active',
          bids: [
            {
              id: 'bid_1',
              auctionId: 'auction_1',
              bidder: 'John Doe',
              amount: 8500,
              timestamp: new Date(),
              isWinning: true
            }
          ],
          shippingCost: 25,
          views: 156
        },
        {
          id: 'auction_2',
          title: 'Gaming Laptop - RTX 4070',
          description: 'High-performance gaming laptop with NVIDIA RTX 4070, 32GB RAM, and 1TB SSD. Perfect for gaming and work.',
          category: 'Electronics',
          currentBid: 1200,
          startingBid: 800,
          buyNowPrice: 1800,
          endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          startTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
          images: [],
          condition: 'like-new',
          location: 'Los Angeles, CA',
          seller: 'Admin',
          status: 'active',
          bids: [
            {
              id: 'bid_2',
              auctionId: 'auction_2',
              bidder: 'Jane Smith',
              amount: 1200,
              timestamp: new Date(),
              isWinning: true
            }
          ],
          shippingCost: 30,
          views: 89
        },
        {
          id: 'auction_3',
          title: 'Antique Persian Rug',
          description: 'Beautiful hand-woven Persian rug from the 1920s. Excellent craftsmanship with intricate patterns.',
          category: 'Home & Decor',
          currentBid: 2800,
          startingBid: 1500,
          buyNowPrice: 4500,
          endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          startTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          images: [],
          condition: 'good',
          location: 'Boston, MA',
          seller: 'Admin',
          status: 'sold',
          bids: [
            {
              id: 'bid_3',
              auctionId: 'auction_3',
              bidder: 'Mike Johnson',
              amount: 2800,
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              isWinning: true
            }
          ],
          shippingCost: 75,
          views: 203
        }
      ];
      setAuctions(sampleAuctions);
    }
  }, [auctions.length, setAuctions]);

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const auction: Auction = {
        id: `auction_${Date.now()}`,
        ...newAuction,
        currentBid: newAuction.startingBid,
        startTime: new Date(),
        endTime: new Date(newAuction.endTime),
        status: 'active',
        bids: [],
        views: 0
      };

      setAuctions(current => [...current, auction]);
      setNewAuction({
        title: '',
        description: '',
        category: '',
        startingBid: 0,
        buyNowPrice: 0,
        endTime: '',
        images: [''],
        condition: 'new',
        location: '',
        seller: 'Admin',
        shippingCost: 0
      });
      setShowCreateAuction(false);
      toast.success('Auction created successfully!');
    } catch (error) {
      toast.error('Failed to create auction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;

    setAuctions(current => current.filter(a => a.id !== auctionId));
    toast.success('Auction deleted successfully!');
  };

  const handleUpdateAuctionStatus = async (auctionId: string, status: Auction['status']) => {
    setAuctions(current => 
      current.map(a => a.id === auctionId ? { ...a, status } : a)
    );
    toast.success(`Auction ${status} successfully!`);
  };

  const totalRevenue = auctions
    .filter(a => a.status === 'sold')
    .reduce((sum, a) => sum + a.currentBid, 0);

  const totalViews = auctions.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalBids = auctions.reduce((sum, a) => sum + a.bids.length, 0);

  if (dataLoading) {
    return (
      <div className=\"container mx-auto px-4 py-8\">
        <LoadingState message=\"Loading admin dashboard...\" />
      </div>
    );
  }

  return (
    <div className=\"container mx-auto px-4 py-8\">
      <div className=\"mb-8\">
        <h1 className=\"text-3xl font-bold mb-2\">Admin Dashboard</h1>
        <p className=\"text-muted-foreground\">Manage auctions, users, and system settings</p>
      </div>

      <Tabs defaultValue=\"overview\" className=\"space-y-6\">
        <TabsList>
          <TabsTrigger value=\"overview\" className=\"gap-2\">
            <BarChart size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value=\"auctions\" className=\"gap-2\">
            <Gavel size={16} />
            Auctions ({auctions.length})
          </TabsTrigger>
          <TabsTrigger value=\"users\" className=\"gap-2\">
            <Users size={16} />
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value=\"settings\" className=\"gap-2\">
            <Settings size={16} />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value=\"overview\" className=\"space-y-6\">
          {/* Key Metrics */}
          <div className=\"grid grid-cols-1 md:grid-cols-4 gap-6\">
            <Card>
              <CardContent className=\"p-6\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-medium text-muted-foreground\">Total Auctions</p>
                    <p className=\"text-2xl font-bold\">{auctions.length}</p>
                    <p className=\"text-xs text-green-600\">
                      {auctions.filter(a => a.status === 'active').length} active
                    </p>
                  </div>
                  <Gavel className=\"h-8 w-8 text-primary\" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className=\"p-6\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-medium text-muted-foreground\">Total Revenue</p>
                    <p className=\"text-2xl font-bold\">${totalRevenue.toLocaleString()}</p>
                    <p className=\"text-xs text-green-600\">
                      {auctions.filter(a => a.status === 'sold').length} sold
                    </p>
                  </div>
                  <DollarSign className=\"h-8 w-8 text-green-600\" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className=\"p-6\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-medium text-muted-foreground\">Total Views</p>
                    <p className=\"text-2xl font-bold\">{totalViews.toLocaleString()}</p>
                    <p className=\"text-xs text-blue-600\">
                      Avg: {Math.round(totalViews / auctions.length || 0)}
                    </p>
                  </div>
                  <Eye className=\"h-8 w-8 text-blue-600\" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className=\"p-6\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-medium text-muted-foreground\">Total Users</p>
                    <p className=\"text-2xl font-bold\">{users.length}</p>
                    <p className=\"text-xs text-purple-600\">
                      {users.filter(u => u.role === 'admin').length} admin(s)
                    </p>
                  </div>
                  <Users className=\"h-8 w-8 text-purple-600\" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
            <Card>
              <CardHeader>
                <CardTitle>Recent Auctions</CardTitle>
                <CardDescription>Latest auction activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-4\">
                  {auctions.slice(0, 5).map(auction => (
                    <div key={auction.id} className=\"flex items-center justify-between p-3 border rounded\">
                      <div>
                        <h4 className=\"font-medium\">{auction.title}</h4>
                        <p className=\"text-sm text-muted-foreground\">
                          Current bid: ${auction.currentBid.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={
                        auction.status === 'active' ? 'default' :
                        auction.status === 'sold' ? 'destructive' : 'secondary'
                      }>
                        {auction.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Registration</CardTitle>
                <CardDescription>Recent user signups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-4\">
                  {users.slice(0, 5).map(user => (
                    <div key={user.id} className=\"flex items-center justify-between p-3 border rounded\">
                      <div>
                        <h4 className=\"font-medium\">{user.firstName} {user.lastName}</h4>
                        <p className=\"text-sm text-muted-foreground\">{user.email}</p>
                      </div>
                      <div className=\"text-right\">
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                          {user.role}
                        </Badge>
                        <p className=\"text-xs text-muted-foreground mt-1\">
                          {user.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=\"auctions\" className=\"space-y-6\">
          <div className=\"flex justify-between items-center\">
            <h2 className=\"text-2xl font-bold\">Auction Management</h2>
            <Dialog open={showCreateAuction} onOpenChange={setShowCreateAuction}>
              <DialogTrigger asChild>
                <Button className=\"gap-2\">
                  <Plus size={16} />
                  Create Auction
                </Button>
              </DialogTrigger>
              <DialogContent className=\"max-w-2xl max-h-[90vh] overflow-y-auto\">
                <DialogHeader>
                  <DialogTitle>Create New Auction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAuction} className=\"space-y-4\">
                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                    <div className=\"space-y-2\">
                      <Label htmlFor=\"title\">Title</Label>
                      <Input
                        id=\"title\"
                        required
                        value={newAuction.title}
                        onChange={(e) => setNewAuction(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div className=\"space-y-2\">
                      <Label htmlFor=\"category\">Category</Label>
                      <Select
                        value={newAuction.category}
                        onValueChange={(value) => setNewAuction(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder=\"Select category\" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=\"Electronics\">Electronics</SelectItem>
                          <SelectItem value=\"Watches\">Watches</SelectItem>
                          <SelectItem value=\"Home & Decor\">Home & Decor</SelectItem>
                          <SelectItem value=\"Fashion\">Fashion</SelectItem>
                          <SelectItem value=\"Sports\">Sports</SelectItem>
                          <SelectItem value=\"Collectibles\">Collectibles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className=\"space-y-2\">
                    <Label htmlFor=\"description\">Description</Label>
                    <Textarea
                      id=\"description\"
                      required
                      rows={3}
                      value={newAuction.description}
                      onChange={(e) => setNewAuction(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
                    <div className=\"space-y-2\">
                      <Label htmlFor=\"startingBid\">Starting Bid ($)</Label>
                      <Input
                        id=\"startingBid\"
                        type=\"number\"
                        required
                        min=\"1\"
                        value={newAuction.startingBid}
                        onChange={(e) => setNewAuction(prev => ({ ...prev, startingBid: Number(e.target.value) }))}
                      />
                    </div>
                    
                    <div className=\"space-y-2\">
                      <Label htmlFor=\"buyNowPrice\">Buy Now Price ($)</Label>
                      <Input
                        id=\"buyNowPrice\"
                        type=\"number\"
                        min=\"1\"
                        value={newAuction.buyNowPrice}
                        onChange={(e) => setNewAuction(prev => ({ ...prev, buyNowPrice: Number(e.target.value) }))}
                      />
                    </div>
                    
                    <div className=\"space-y-2\">
                      <Label htmlFor=\"shippingCost\">Shipping Cost ($)</Label>
                      <Input
                        id=\"shippingCost\"
                        type=\"number\"
                        min=\"0\"
                        value={newAuction.shippingCost}
                        onChange={(e) => setNewAuction(prev => ({ ...prev, shippingCost: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                    <div className=\"space-y-2\">
                      <Label htmlFor=\"condition\">Condition</Label>
                      <Select
                        value={newAuction.condition}
                        onValueChange={(value: any) => setNewAuction(prev => ({ ...prev, condition: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=\"new\">New</SelectItem>
                          <SelectItem value=\"like-new\">Like New</SelectItem>
                          <SelectItem value=\"excellent\">Excellent</SelectItem>
                          <SelectItem value=\"good\">Good</SelectItem>
                          <SelectItem value=\"fair\">Fair</SelectItem>
                          <SelectItem value=\"poor\">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className=\"space-y-2\">
                      <Label htmlFor=\"location\">Location</Label>
                      <Input
                        id=\"location\"
                        required
                        value={newAuction.location}
                        onChange={(e) => setNewAuction(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className=\"space-y-2\">
                    <Label htmlFor=\"endTime\">End Date & Time</Label>
                    <Input
                      id=\"endTime\"
                      type=\"datetime-local\"
                      required
                      value={newAuction.endTime}
                      onChange={(e) => setNewAuction(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>

                  <div className=\"flex justify-end gap-2\">
                    <Button type=\"button\" variant=\"outline\" onClick={() => setShowCreateAuction(false)}>
                      Cancel
                    </Button>
                    <Button type=\"submit\" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Auction'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className=\"p-0\">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Bid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auctions.map(auction => (
                    <TableRow key={auction.id}>
                      <TableCell className=\"font-medium\">{auction.title}</TableCell>
                      <TableCell>{auction.category}</TableCell>
                      <TableCell>${auction.currentBid.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          auction.status === 'active' ? 'default' :
                          auction.status === 'sold' ? 'destructive' : 'secondary'
                        }>
                          {auction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{auction.endTime.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className=\"flex gap-2\">
                          {auction.status === 'active' && (
                            <Button
                              size=\"sm\"
                              variant=\"outline\"
                              onClick={() => handleUpdateAuctionStatus(auction.id, 'archived')}
                            >
                              <Archive size={14} />
                            </Button>
                          )}
                          <Button
                            size=\"sm\"
                            variant=\"destructive\"
                            onClick={() => handleDeleteAuction(auction.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=\"users\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage registered users and their permissions</CardDescription>
            </CardHeader>
            <CardContent className=\"p-0\">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className=\"font-medium\">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isEmailVerified ? 'default' : 'secondary'}>
                          {user.isEmailVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className=\"flex gap-2\">
                          <Button size=\"sm\" variant=\"outline\">
                            <Shield size={14} />
                          </Button>
                          {user.id !== 'admin_001' && (
                            <Button size=\"sm\" variant=\"destructive\">
                              <Trash size={14} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=\"settings\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure application settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className=\"space-y-6\">
                <div className=\"space-y-4\">
                  <h3 className=\"text-lg font-semibold\">Auction Settings</h3>
                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                    <div className=\"space-y-2\">
                      <Label>Default Auction Duration (days)</Label>
                      <Input type=\"number\" defaultValue={7} />
                    </div>
                    <div className=\"space-y-2\">
                      <Label>Minimum Bid Increment ($)</Label>
                      <Input type=\"number\" defaultValue={5} />
                    </div>
                  </div>
                </div>

                <div className=\"space-y-4\">
                  <h3 className=\"text-lg font-semibold\">Email Settings</h3>
                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                    <div className=\"space-y-2\">
                      <Label>SMTP Server</Label>
                      <Input defaultValue=\"smtp.gmail.com\" />
                    </div>
                    <div className=\"space-y-2\">
                      <Label>From Email</Label>
                      <Input defaultValue=\"noreply@auctionhub.com\" />
                    </div>
                  </div>
                </div>

                <div className=\"space-y-4\">
                  <h3 className=\"text-lg font-semibold\">Security Settings</h3>
                  <div className=\"space-y-4\">
                    <div className=\"flex items-center justify-between\">
                      <div>
                        <Label>Require Email Verification</Label>
                        <p className=\"text-sm text-muted-foreground\">New users must verify their email</p>
                      </div>
                      <input type=\"checkbox\" defaultChecked className=\"h-4 w-4\" />
                    </div>
                    <div className=\"flex items-center justify-between\">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className=\"text-sm text-muted-foreground\">Enable 2FA for admin accounts</p>
                      </div>
                      <input type=\"checkbox\" className=\"h-4 w-4\" />
                    </div>
                  </div>
                </div>

                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};