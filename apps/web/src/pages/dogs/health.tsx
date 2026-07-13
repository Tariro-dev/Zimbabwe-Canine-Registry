import * as React from 'react';
import { useGetDog, useUpdateDogHealth, getGetDogQueryKey, HealthUpdateSterilizationStatus, useGetMyProfile } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { ShieldAlert, Activity } from 'lucide-react';

const formSchema = z.object({
  vaccineHistory: z.string().min(1, "Vaccine history is required"),
  sterilizationStatus: z.enum(["Sterilized", "Not Sterilized"]),
  lastCheckup: z.string().min(1, "Checkup date is required"),
});

export default function UpdateHealth({ id }: { id: string }) {
  const { data: dog, isLoading: isDogLoading } = useGetDog(id);
  const { data: profile } = useGetMyProfile();
  const updateHealth = useUpdateDogHealth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vaccineHistory: '',
      sterilizationStatus: 'Not Sterilized',
      lastCheckup: new Date().toISOString().split('T')[0],
    }
  });

  React.useEffect(() => {
    if (dog) {
      form.reset({
        vaccineHistory: dog.vaccineHistory,
        sterilizationStatus: dog.sterilizationStatus as any,
        lastCheckup: dog.lastCheckup || new Date().toISOString().split('T')[0],
      });
    }
  }, [dog, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateHealth.mutate(
      { id, data: data as any },
      {
        onSuccess: (updatedDog) => {
          toast.success("Health record updated and synced to blockchain.");
          queryClient.setQueryData(getGetDogQueryKey(id), updatedDog);
          setLocation(`/dogs/${id}`);
        },
        onError: () => {
          toast.error("Failed to update health record.");
        }
      }
    );
  };

  if (isDogLoading) return <div className="p-8 text-center">Loading dog profile...</div>;
  if (!dog) return <div className="p-8 text-center text-destructive">Dog not found.</div>;

  const isVet = profile?.role === 'vet' || profile?.role === 'regulator';

  if (!isVet) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 border rounded-xl bg-card text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">Only registered Veterinarians or Regulators can update health records.</p>
        <Button variant="outline" onClick={() => setLocation(`/dogs/${id}`)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" /> Update Health Record
        </h1>
        <p className="text-muted-foreground mt-1">
          Updating health status for <span className="font-semibold text-foreground">{dog.name}</span> ({dog.microchipId})
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Details</CardTitle>
          <CardDescription>All updates are immutably recorded on the ZCR blockchain.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="vaccineHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaccination History</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter vaccines and dates..." className="min-h-[120px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sterilizationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sterilization Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Sterilized">Sterilized</SelectItem>
                          <SelectItem value="Not Sterilized">Not Sterilized</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastCheckup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Checkup Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setLocation(`/dogs/${id}`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateHealth.isPending}>
                  {updateHealth.isPending ? "Committing to Ledger..." : "Save Health Record"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
