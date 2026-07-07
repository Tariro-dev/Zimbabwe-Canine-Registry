import * as React from 'react';
import { useGetMyProfile, useUpdateMyProfile, getGetMyProfileQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { UserCircle, BadgeCheck } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  kennelName: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export default function Profile() {
  const { data: profile, isLoading } = useGetMyProfile();
  const updateProfile = useUpdateMyProfile();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      kennelName: '',
      licenseNumber: ''
    }
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        kennelName: profile.kennelName || '',
        licenseNumber: profile.licenseNumber || ''
      });
    }
  }, [profile, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateProfile.mutate({ data }, {
      onSuccess: (updated) => {
        toast.success("Profile updated successfully");
        queryClient.setQueryData(getGetMyProfileQueryKey(), updated);
      }
    });
  };

  if (isLoading) return <div className="p-8">Loading profile...</div>;
  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-6 pb-8 border-b border-border">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          <UserCircle className="w-12 h-12" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{profile.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <BadgeCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-lg text-muted-foreground capitalize font-medium">{profile.role}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Member since {format(new Date(profile.registeredAt), 'MMMM yyyy')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your identity on the registry.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name / Organization</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {(profile.role === 'breeder' || profile.role === 'vet') && (
                <>
                  <FormField
                    control={form.control}
                    name="kennelName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kennel / Clinic Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl><Input {...field} className="font-mono" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
