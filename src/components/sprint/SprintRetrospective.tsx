import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ThumbsUp,
  AlertTriangle,
  ListTodo,
  Plus,
  X,
  Save,
  Edit2,
  CheckCircle2,
  User,
  Clock,
} from 'lucide-react';
import { sprintsApi } from '@/services/sprintApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { SprintRetrospective as RetrospectiveType } from '@/types/sprint';

interface SprintRetrospectiveProps {
  sprintId: string;
  sprintStatus: string;
}

export function SprintRetrospective({ sprintId, sprintStatus }: SprintRetrospectiveProps) {
  const [retrospective, setRetrospective] = useState<RetrospectiveType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [wentWell, setWentWell] = useState<string[]>([]);
  const [needsImprovement, setNeedsImprovement] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<string[]>([]);
  
  // Input state for new items
  const [newWentWell, setNewWentWell] = useState('');
  const [newNeedsImprovement, setNewNeedsImprovement] = useState('');
  const [newActionItem, setNewActionItem] = useState('');

  useEffect(() => {
    fetchRetrospective();
  }, [sprintId]);

  const fetchRetrospective = async () => {
    try {
      setLoading(true);
      const response = await sprintsApi.getRetrospective(sprintId);
      if (response.data) {
        setRetrospective(response.data);
        setWentWell(response.data.wentWell || []);
        setNeedsImprovement(response.data.needsImprovement || []);
        setActionItems(response.data.actionItems || []);
      }
    } catch (error) {
      // No retrospective yet is OK
      console.log('No retrospective found');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await sprintsApi.saveRetrospective(sprintId, {
        wentWell,
        needsImprovement,
        actionItems,
      });
      setRetrospective(response.data);
      setIsEditing(false);
      toast.success('Retrospective saved successfully');
    } catch (error) {
      toast.error('Failed to save retrospective');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: 'wentWell' | 'needsImprovement' | 'actionItems') => {
    if (type === 'wentWell' && newWentWell.trim()) {
      setWentWell([...wentWell, newWentWell.trim()]);
      setNewWentWell('');
    } else if (type === 'needsImprovement' && newNeedsImprovement.trim()) {
      setNeedsImprovement([...needsImprovement, newNeedsImprovement.trim()]);
      setNewNeedsImprovement('');
    } else if (type === 'actionItems' && newActionItem.trim()) {
      setActionItems([...actionItems, newActionItem.trim()]);
      setNewActionItem('');
    }
  };

  const removeItem = (type: 'wentWell' | 'needsImprovement' | 'actionItems', index: number) => {
    if (type === 'wentWell') {
      setWentWell(wentWell.filter((_, i) => i !== index));
    } else if (type === 'needsImprovement') {
      setNeedsImprovement(needsImprovement.filter((_, i) => i !== index));
    } else if (type === 'actionItems') {
      setActionItems(actionItems.filter((_, i) => i !== index));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'wentWell' | 'needsImprovement' | 'actionItems') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(type);
    }
  };

  const canEdit = sprintStatus === 'completed' || sprintStatus === 'active';

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-secondary rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-secondary rounded" />
        </CardContent>
      </Card>
    );
  }

  // View mode - show saved retrospective
  if (retrospective && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sprint Retrospective</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Saved by {retrospective.savedByName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(retrospective.savedAt), 'MMM d, yyyy h:mm a')}
                </span>
              </CardDescription>
            </div>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* What Went Well */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-500">
                <ThumbsUp className="h-5 w-5" />
                <h4 className="font-semibold">What Went Well</h4>
                <Badge variant="secondary" className="ml-auto">{wentWell.length}</Badge>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {wentWell.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm"
                    >
                      {item}
                    </div>
                  ))}
                  {wentWell.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No items added</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Needs Improvement */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-yellow-500">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="font-semibold">Needs Improvement</h4>
                <Badge variant="secondary" className="ml-auto">{needsImprovement.length}</Badge>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {needsImprovement.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm"
                    >
                      {item}
                    </div>
                  ))}
                  {needsImprovement.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No items added</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Action Items */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-500">
                <ListTodo className="h-5 w-5" />
                <h4 className="font-semibold">Action Items</h4>
                <Badge variant="secondary" className="ml-auto">{actionItems.length}</Badge>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {actionItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm flex items-start gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                  {actionItems.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No items added</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Edit mode
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sprint Retrospective</CardTitle>
            <CardDescription>
              Reflect on the sprint: what went well, what needs improvement, and action items for next time.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {retrospective && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Retrospective'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* What Went Well */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-500">
              <ThumbsUp className="h-5 w-5" />
              <h4 className="font-semibold">What Went Well</h4>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add something positive..."
                value={newWentWell}
                onChange={(e) => setNewWentWell(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'wentWell')}
                className="flex-1"
              />
              <Button size="icon" variant="outline" onClick={() => addItem('wentWell')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[180px]">
              <div className="space-y-2">
                {wentWell.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm flex items-start justify-between gap-2 group"
                  >
                    <span>{item}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeItem('wentWell', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Needs Improvement */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-semibold">Needs Improvement</h4>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add an improvement area..."
                value={newNeedsImprovement}
                onChange={(e) => setNewNeedsImprovement(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'needsImprovement')}
                className="flex-1"
              />
              <Button size="icon" variant="outline" onClick={() => addItem('needsImprovement')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[180px]">
              <div className="space-y-2">
                {needsImprovement.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm flex items-start justify-between gap-2 group"
                  >
                    <span>{item}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeItem('needsImprovement', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Action Items */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-500">
              <ListTodo className="h-5 w-5" />
              <h4 className="font-semibold">Action Items</h4>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add an action item..."
                value={newActionItem}
                onChange={(e) => setNewActionItem(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'actionItems')}
                className="flex-1"
              />
              <Button size="icon" variant="outline" onClick={() => addItem('actionItems')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[180px]">
              <div className="space-y-2">
                {actionItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm flex items-start justify-between gap-2 group"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeItem('actionItems', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
