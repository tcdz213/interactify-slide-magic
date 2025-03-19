
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ban, Search, UserCheck, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

// Mock data for users
const mockUsers = [
  { id: 1, name: "John Smith", email: "john@example.com", status: "active", role: "student", lastActive: "2023-10-15" },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", status: "active", role: "instructor", lastActive: "2023-10-14" },
  { id: 3, name: "Michael Brown", email: "michael@example.com", status: "banned", role: "student", lastActive: "2023-09-30" },
  { id: 4, name: "Emily Davis", email: "emily@example.com", status: "active", role: "center_admin", lastActive: "2023-10-12" },
  { id: 5, name: "David Wilson", email: "david@example.com", status: "inactive", role: "student", lastActive: "2023-08-25" },
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const { toast } = useToast();

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBanUser = () => {
    // In a real app, you would make an API call here
    const updatedUsers = users.map(user => 
      user.id === currentUser.id 
        ? { ...user, status: user.status === "banned" ? "active" : "banned" } 
        : user
    );
    
    setUsers(updatedUsers);
    setIsBanDialogOpen(false);
    
    const user = users.find(u => u.id === currentUser.id);
    const newStatus = user?.status === "banned" ? "unbanned" : "banned";
    
    toast({
      title: `User ${newStatus}`,
      description: `${currentUser.name} has been ${newStatus}.`,
    });
  };

  const openBanDialog = (user: any) => {
    setCurrentUser(user);
    setIsBanDialogOpen(true);
  };

  const openUserDetails = (user: any) => {
    setCurrentUser(user);
    setIsUserDetailsOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name, email or role..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="rounded-md border">
        <div className="grid grid-cols-6 font-semibold p-4 border-b">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Last Active</div>
          <div className="text-right">Actions</div>
        </div>
        
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-6 p-4 border-b last:border-0 items-center">
              <div>{user.name}</div>
              <div>{user.email}</div>
              <div className="capitalize">{user.role.replace('_', ' ')}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  user.status === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {user.status}
                </span>
              </div>
              <div>{user.lastActive}</div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => openUserDetails(user)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => openBanDialog(user)}
                  className={user.status === "banned" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                >
                  {user.status === "banned" ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No users found. Try adjusting your search.
          </div>
        )}
      </div>
      
      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentUser?.status === "banned" ? "Unban User" : "Ban User"}
            </DialogTitle>
          </DialogHeader>
          <p className="py-4">
            {currentUser?.status === "banned" 
              ? `Are you sure you want to unban ${currentUser?.name}?` 
              : `Are you sure you want to ban ${currentUser?.name}? This will prevent them from accessing the platform.`
            }
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>Cancel</Button>
            <Button 
              variant={currentUser?.status === "banned" ? "default" : "destructive"} 
              onClick={handleBanUser}
            >
              {currentUser?.status === "banned" ? "Unban User" : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {currentUser && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-muted-foreground">Name:</div>
                <div>{currentUser.name}</div>
                
                <div className="text-muted-foreground">Email:</div>
                <div>{currentUser.email}</div>
                
                <div className="text-muted-foreground">Role:</div>
                <div className="capitalize">{currentUser.role.replace('_', ' ')}</div>
                
                <div className="text-muted-foreground">Status:</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    currentUser.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    currentUser.status === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {currentUser.status}
                  </span>
                </div>
                
                <div className="text-muted-foreground">Last Active:</div>
                <div>{currentUser.lastActive}</div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Recent Activity</h3>
                <ul className="space-y-2 text-sm">
                  <li>Enrolled in "Advanced Web Development" on 2023-10-10</li>
                  <li>Completed "Introduction to JavaScript" on 2023-10-05</li>
                  <li>Posted review for "Data Science Fundamentals" on 2023-09-28</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsUserDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
