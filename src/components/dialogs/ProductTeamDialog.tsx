import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { productsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Trash2, Users, UserPlus, Loader2 } from 'lucide-react';
import type { ProductTeamMember } from '@/types/product';
import { format } from 'date-fns';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'tech_lead', label: 'Tech Lead' },
  { value: 'senior_developer', label: 'Senior Developer' },
  { value: 'developer', label: 'Developer' },
  { value: 'junior_developer', label: 'Junior Developer' },
  { value: 'devops', label: 'DevOps' },
  { value: 'qa', label: 'QA' },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  tech_lead: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  senior_developer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  developer: 'bg-green-500/20 text-green-400 border-green-500/30',
  junior_developer: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  devops: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  qa: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

interface ProductTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
  productName: string;
}

export function ProductTeamDialog({ 
  open, 
  onOpenChange, 
  productId, 
  productName 
}: ProductTeamDialogProps) {
  const [members, setMembers] = useState<ProductTeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState('developer');
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (open && productId) {
      fetchTeam();
      setShowAddForm(false);
      setNewUserId('');
      setNewRole('developer');
    }
  }, [open, productId]);

  const fetchTeam = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const response = await productsApi.getTeam(productId);
      setMembers(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!productId || !newUserId.trim()) return;
    try {
      setAdding(true);
      await productsApi.addTeamMember(productId, newUserId.trim(), newRole);
      toast.success('Team member added');
      setNewUserId('');
      setShowAddForm(false);
      fetchTeam();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add team member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!productId) return;
    try {
      setRemovingId(userId);
      await productsApi.removeTeamMember(productId, userId);
      toast.success('Team member removed');
      fetchTeam();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove team member');
    } finally {
      setRemovingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team - {productName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Member Button/Form */}
          {!showAddForm ? (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowAddForm(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          ) : (
            <Card className="p-4 space-y-3">
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input
                  placeholder="Enter user ID"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleAddMember}
                  disabled={adding || !newUserId.trim()}
                >
                  {adding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Team Members List */}
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No team members yet</p>
                <p className="text-sm">Add members to start collaborating</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <Card 
                    key={member.id} 
                    className="p-3 flex items-center gap-3 group"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.userAvatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(member.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{member.userName}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${ROLE_COLORS[member.role] || 'bg-secondary'}`}
                        >
                          {member.role.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.userEmail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={removingId === member.userId}
                    >
                      {removingId === member.userId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
