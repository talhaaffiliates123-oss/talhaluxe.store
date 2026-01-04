import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { products } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

// Mock data for orders
const orders = [
  { id: 'ORD-001', date: '2023-10-26', status: 'Delivered', total: '$450.00', items: [products[0]] },
  { id: 'ORD-002', date: '2023-10-28', status: 'Shipped', total: '$180.00', items: [products[6]] },
  { id: 'ORD-003', date: '2023-10-29', status: 'Processing', total: '$1200.00', items: [products[4]] },
];


export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">My Account</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your account details and view your order history.</p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View the status and details of your past orders.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Shipped' ? 'secondary' : 'outline' }>{order.status}</Badge>
                      </TableCell>
                      <TableCell>{order.total}</TableCell>
                      <TableCell><Button variant="outline" size="sm">View Details</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Talha" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="user@example.com" />
              </div>
               <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="addresses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Addresses</CardTitle>
              <CardDescription>Manage your saved addresses for faster checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border p-4 rounded-md">
                <h4 className="font-semibold">Primary Address</h4>
                <p className="text-muted-foreground text-sm mt-1">123 Luxury Lane, Fashion City, 12345, USA</p>
                <div className="mt-2 space-x-2">
                    <Button variant="link" className="p-0 h-auto">Edit</Button>
                    <Button variant="link" className="p-0 h-auto text-destructive hover:text-destructive/80">Delete</Button>
                </div>
              </div>
               <Button variant="outline">Add New Address</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
