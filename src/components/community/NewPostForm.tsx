
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).max(100),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }).max(2000),
  tagInput: z.string().optional()
});

type FormSchema = z.infer<typeof formSchema>;

const mockUser = {
  name: 'Sarah Johnson',
  avatar: '',
  role: 'learner' as const
};

const NewPostForm = () => {
  const { t } = useTranslation();
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      tagInput: ''
    }
  });
  
  const addTag = (tagName: string) => {
    const tag = tagName.trim().toLowerCase();
    
    if (!tag) return;
    if (tags.includes(tag)) return;
    if (tags.length >= 5) {
      toast.warning(t('community.maxTagsReached', 'Maximum 5 tags allowed'));
      return;
    }
    
    setTags(prev => [...prev, tag]);
    form.setValue('tagInput', '');
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = form.getValues('tagInput');
      addTag(value);
    }
  };
  
  const onSubmit = (data: FormSchema) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log({
        ...data,
        tags
      });
      
      toast.success(t('community.postCreated', 'Your post has been created'));
      
      // Reset form
      form.reset();
      setTags([]);
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg flex items-center gap-3">
          <Avatar className="h-7 w-7">
            <AvatarImage src={mockUser.avatar} alt={`${mockUser.name}'s profile`} />
            <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {t('community.createNewPost', 'Create a new post')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('community.postTitle', 'Post Title')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('community.postTitlePlaceholder', 'Enter a title for your post...')} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('community.postContent', 'Content')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('community.postContentPlaceholder', 'What would you like to share or ask?')} 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tagInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('community.tags', 'Tags')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('community.tagsPlaceholder', 'Add tags (press Enter or comma)')} 
                      {...field} 
                      onKeyDown={handleTagKeyDown}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tagItem, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {tagItem}
                    <button
                      type="button"
                      onClick={() => removeTag(tagItem)}
                      className="h-3 w-3 rounded-full flex items-center justify-center hover:bg-muted-foreground/20"
                      aria-label={t('community.removeTag', { tag: tagItem })}
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="border-t pt-3 flex justify-end">
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('common.submitting', 'Submitting...') : t('community.postNow', 'Post Now')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewPostForm;
