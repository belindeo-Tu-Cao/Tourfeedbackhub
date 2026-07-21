'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const commentSchema = z.object({
  authorName: z.string().min(1, 'Please tell us your name'),
  authorEmail: z.string().email('Please enter a valid email'),
  content: z.string().min(1, 'Please write a comment'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface PostCommentFormProps {
  postId: string;
}

export function PostCommentForm({ postId }: PostCommentFormProps) {
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { authorName: '', authorEmail: '', content: '' },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (values: CommentFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unable to submit comment.' }));
        throw new Error(data.error ?? 'Unable to submit comment.');
      }

      toast({
        title: 'Thank you!',
        description: 'Your comment was submitted for review and will appear once approved.',
      });
      form.reset({ authorName: '', authorEmail: '', content: '' });
      router.refresh();
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Could not submit comment.';
      toast({ title: 'Submission failed', description, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="authorEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Share your thoughts..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Comments are reviewed before they appear.</p>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Post comment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
