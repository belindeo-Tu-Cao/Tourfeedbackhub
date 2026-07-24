"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, Save } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/star-rating";
import { countries, languages } from "@/lib/data";
import type { Tour } from "@/lib/types";
import { submitFeedback } from "@/lib/actions";

const STORAGE_KEY = "tourfeedbackhub-feedback-draft";
const QUICK_INTENT_KEY = "tourfeedbackhub-feedback-intent";

const feedbackFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  country: z.string().min(1, "Please select your country."),
  language: z.string().min(1, "Please select your language."),
  rating: z.number().min(1, "Please provide a rating.").max(5),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters.")
    .max(1000, "Message must be 1000 characters or less."),
  tourId: z.string().optional(),
  photo: z
    .any()
    .optional()
    .refine((value) => {
      if (!value || value.length === 0) return true;
      const file: File = value[0];
      return file.size <= 10 * 1024 * 1024;
    }, "Photo must be smaller than 10MB."),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface FeedbackFormProps {
  tours: Pick<Tour, "id" | "name">[];
}

const steps = [
  {
    title: "Select your journey",
    description: "Let us know which tour you joined and preferred language.",
  },
  {
    title: "Rate the experience",
    description: "Give your overall star rating.",
  },
  {
    title: "Share your story",
    description: "Tell us about the highlights, the guide, and memorable moments.",
  },
  {
    title: "Review & send",
    description: "Confirm your details before submitting.",
  },
];

const stepFields: Record<number, (keyof FeedbackFormValues)[]> = {
  0: ["tourId", "language"],
  1: ["rating"],
  2: ["name", "country", "message"],
  3: [],
};

function loadDraft(): Partial<FeedbackFormValues> | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Partial<FeedbackFormValues>;
  } catch (error) {
    console.warn("Failed to parse feedback draft", error);
    return null;
  }
}

function loadQuickIntent(): Partial<FeedbackFormValues> | null {
  if (typeof window === "undefined") return null;
  const stored = window.sessionStorage.getItem(QUICK_INTENT_KEY);
  if (!stored) return null;
  try {
    const intent = JSON.parse(stored) as { name?: string; message?: string };
    window.sessionStorage.removeItem(QUICK_INTENT_KEY);
    return {
      name: intent.name ?? "",
      message: intent.message ?? "",
    };
  } catch (error) {
    console.warn("Failed to parse quick feedback intent", error);
    return null;
  }
}

export default function FeedbackForm({ tours }: FeedbackFormProps) {
  const t = useTranslations('feedback');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const tourOptions = useMemo(() => tours.map((tour) => ({ id: tour.id, name: tour.name })), [tours]);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: "",
      country: "",
      language: "en",
      rating: 0,
      message: "",
      tourId: "",
    },
  });

  useEffect(() => {
    const defaults = { ...form.getValues() };
    const draft = loadDraft();
    const quickIntent = loadQuickIntent();
    const nextValues = { ...defaults, ...draft, ...quickIntent };
    form.reset(nextValues);
  }, [form]);

  const onSubmit = async (data: FeedbackFormValues) => {
    let submissionToast: ReturnType<typeof toast> | undefined;
    try {
      setIsSubmitting(true);
      submissionToast = toast({
        title: t('submitFeedback'),
        description: t('description'),
        duration: 60000,
      });

      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("country", data.country);
      formData.append("language", data.language);
      formData.append("rating", String(data.rating));
      formData.append("message", data.message.trim());
      if (data.tourId) formData.append("tourId", data.tourId);

      const result = await submitFeedback(formData);
      if (result?.errors) {
        throw new Error(result.message ?? "Validation failed.");
      }

      window.localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
      if (submissionToast) {
        submissionToast.update({
          id: submissionToast.id,
          title: t('thankYou'),
          description: t('description'),
          duration: 5000,
        });
      }
      form.reset({
        name: "",
        country: "",
        language: data.language,
        rating: 0,
        message: "",
        tourId: data.tourId ?? "",
        photo: undefined,
      });
      setCurrentStep(0);
    } catch (error) {
      console.error("Feedback submission error:", error);
      const description = error instanceof Error ? error.message : t('description');
      if (submissionToast) {
        submissionToast.update({
          id: submissionToast.id,
          title: t('submitFeedback'),
          description,
          variant: "destructive",
          duration: 6000,
        });
      } else {
        toast({
          title: t('submitFeedback'),
          description,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const fields = stepFields[currentStep] ?? [];
    const valid = await form.trigger(fields, { shouldFocus: true });
    if (!valid) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleSaveDraft = () => {
    if (typeof window === "undefined") return;
    const values = form.getValues();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    toast({
      title: t('thankYou'),
      description: t('description'),
    });
  };

  const watchedValues = form.watch();

  if (submitted) {
    return (
      <div className="rounded-3xl border border-border/60 bg-background/80 p-8 text-center shadow-lg">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-4 text-2xl font-headline">{t('thankYou')}</h2>
        <p className="mt-2 text-muted-foreground">
          {t('description')}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          <Button asChild variant="outline">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL || 'https://tourfeedbackhub.com')}`}
              target="_blank"
              rel="noreferrer"
            >
              Share on Facebook
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('I just shared my travel story with Tour Feedback Hub!')}`}
              target="_blank"
              rel="noreferrer"
            >
              Share on X
            </a>
          </Button>
          <Button onClick={() => setSubmitted(false)}>{t('submitFeedback')}</Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
            <h2 className="mt-2 text-2xl font-headline">{steps[currentStep].title}</h2>
            <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" /> {t('thankYou')}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 rounded-3xl border border-border/60 bg-background/80 p-8 shadow-sm">
          {currentStep === 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="tourId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('selectTour')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectTour')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">{t('selectTour')}</SelectItem>
                        {tourOptions.map((tour) => (
                          <SelectItem key={tour.id} value={tour.id}>
                            {tour.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('name')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 1 && (
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rating')}</FormLabel>
                  <FormControl>
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-6 text-center">
                      <StarRating rating={field.value} setRating={(value) => field.onChange(value)} />
                      <p className="mt-3 text-sm text-muted-foreground">
                        {t('rating')}
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 2 && (
            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('name')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('name')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('name')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.name}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('message')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('message')}
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4">
                <h3 className="font-medium">{t('review')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('selectTour')}
          </Button>
          <Button type="button" onClick={handleNext} disabled={currentStep === steps.length - 1}>
            {currentStep === steps.length - 1 ? t('submitFeedback') : t('selectTour')}
            {currentStep < steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
