
import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Badge } from '@/components/UI/badge';
import { Card, CardContent } from '@/components/UI/card';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { Check, Mail, Plus, Trash, UserCog, Users } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Pending';
};

export const UserRoles = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer', status: 'Pending' }
  ]);
  
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Editor');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleInviteUser = () => {
    if (!newUserEmail) {
      toast.error('Please enter an email address');
      return;
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      name: newUserEmail.split('@')[0],
      email: newUserEmail,
      role: newUserRole,
      status: 'Pending'
    };
    
    setUsers([...users, newUser]);
    toast.success(`Invitation sent to ${newUserEmail}`);
    setNewUserEmail('');
    setIsDialogOpen(false);
  };
  
  const handleRemoveUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    toast.success('User removed successfully');
  };
  
  const handleChangeRole = (id: string, newRole: 'Admin' | 'Editor' | 'Viewer') => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, role: newRole } : user
    ));
    toast.success('User role updated');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">User & Role Management</h2>
          <p className="text-muted-foreground">Manage user access and permissions</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="email@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleInviteUser}>
                <Mail size={16} className="mr-2" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select defaultValue={user.role} onValueChange={(value) => handleChangeRole(user.id, value as any)}>
                    <SelectTrigger className="h-8 w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Active' ? 'default' : 'outline'}>
                    {user.status === 'Active' ? (
                      <Check size={12} className="mr-1" />
                    ) : null}
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveUser(user.id)}>
                    <Trash size={16} className="text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </CardContent>
      </Card>
      
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          <UserCog size={20} />
          <h3 className="font-medium">Role Permissions</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">What each role can do:</p>
        
        <ul className="space-y-2 text-sm">
          <li className="py-1"><strong>Admin:</strong> Full access to all features including user management and configuration</li>
          <li className="py-1"><strong>Editor:</strong> Can create and edit jobs, update schedules, but cannot access user management</li>
          <li className="py-1"><strong>Viewer:</strong> Read-only access to view schedules and reports</li>
        </ul>
        </CardContent>
      </Card>
    </div>
  );
};
