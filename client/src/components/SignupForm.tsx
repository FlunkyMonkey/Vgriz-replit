import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { validatedEmailSubscriptionSchema } from '@shared/schema';
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from "@/components/ui/card";

type FormValues = {
  email: string;
};

export default function SignupForm() {
  const { toast } = useToast();
  const [success, setSuccess] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(validatedEmailSubscriptionSchema),
    defaultValues: {
      email: '',
    },
  });

  const subscription = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/subscribe', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setSuccess(true);
        reset();
        toast({
          title: "Success!",
          description: "Thank you for subscribing. We'll keep you updated!",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    setSuccess(false);
    subscription.mutate(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-1">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            disabled={subscription.isPending}
          >
            {subscription.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <span>Notify Me</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </form>
        
        {/* Success Message */}
        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
            <CheckCircle className="h-5 w-5 inline-block mr-1" />
            <span>Thanks! We'll be in touch soon.</span>
          </div>
        )}
        
        {/* Error Message - Only shown on specific error states */}
        {subscription.isError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            <AlertCircle className="h-5 w-5 inline-block mr-1" />
            <span>Something went wrong. Please try again.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
