'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const QUICK_INTENT_KEY = 'tourfeedbackhub-feedback-intent';

type QuickFeedbackState = {
  name: string;
  email: string;
  message: string;
};

const initialState: QuickFeedbackState = {
  name: '',
  email: '',
  message: '',
};

export default function HomeFeedbackForm() {
  const router = useRouter();
  const t = useTranslations('feedback');
  const { toast } = useToast();
  const [formState, setFormState] = useState<QuickFeedbackState>(initialState);

  const handleChange = (field: keyof QuickFeedbackState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((previous) => ({ ...previous, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(QUICK_INTENT_KEY, JSON.stringify(formState));
    }
    toast({
      title: t('title'),
      description: t('description'),
    });
    router.push('/feedback?from=homepage');
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline text-2xl">{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            required
            value={formState.name}
            onChange={handleChange('name')}
            placeholder={t('name')}
            aria-label={t('name')}
          />
          <Input
            required
            type="email"
            value={formState.email}
            onChange={handleChange('email')}
            placeholder={t('email')}
            aria-label={t('email')}
          />
          <Textarea
            required
            value={formState.message}
            onChange={handleChange('message')}
            placeholder={t('message')}
            aria-label={t('message')}
            className="min-h-[120px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{t('description')}</span>
            <Button type="submit" size="sm">
              {t('submitFeedback')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
