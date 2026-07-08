import * as React from 'react';
import { useGetDog, useTransferDogOwnership, getGetDogQueryKey, useGetMyProfile, getListDogsQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { ArrowRightLeft, User, AlertTriangle, ShieldAlert } from 'lucide-react';

const formSchema = z.object({
  newOwnerName: z.string().min(1, "New owner name is required"),
  newOwnerId: z.string().min(1, "New owner ID is required"),
});

export default function TransferOwnership({ id }: { id: string }) {
  const { data: dog, isLoading: isDogLoading } = useGetDog(id);
  const { data: profile } = useGetMyProfile();
  const transferOwnership = useTransferDogOwnership();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newOwnerName: '',
      newOwnerId: '',
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!window.confirm(`Transfer ${dog?.name} from "${dog?.ownerName}" to "${data.newOwnerName}"?\n\nThis action is permanent and recorded on the ZCR blockchain.`)) {
      return;
    }

    transferOwnership.mutate(
      { id, data },
      {
        onSuccess: (updatedDog) => {
          toast.success("Ownership transferred successfully.");
          queryClient.invalidateQueries({ queryKey: getListDogsQueryKey() });
          queryClient.setQueryData(getGetDogQueryKey(id), updatedDog);
          setLocation(`/dogs/${id}`);
        },
        onError: () => {
          toast.error("Failed to transfer ownership.");
        }
      }
    );
  };

  if (isDogLoading) return <div className="p-8 text-center">Loading dog profile...</div>;
  if (!dog) return <div className="p-8 text-center text-destructive">Dog not found.</div>;

  const canTransfer = dog.ownerId === profile?.id || profile?.role === 'regulator';

  if (!canTransfer) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 border rounded-xl bg-card text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You must be the registered owner or a regulator to transfer this dog.</p>
        <Button variant="outline" onClick={() => setLocation(`/dogs/${id}`)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-primary" /> Transfer Ownership
        </h1>
        <p className="text-muted-foreground mt-1">
          Permanently transfer <span className="font-semibold text-foreground">{dog.name}</span> on the ZCR ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase text-primary tracking-wider">Current Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-lg">{dog.ownerName}</div>
                <div className="text-sm text-muted-foreground font-mono">{dog.ownerId}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Owner Details</CardTitle>
            <CardDescription>Ensure the new owner ID is correct to avoid loss of identity control.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="newOwnerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Owner Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter full legal name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newOwnerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Owner ZCR ID / User ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. user-002" className="font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Ownership transfer is permanent and immutably recorded on the ZCR blockchain.
                    Once confirmed, you will no longer have management rights for this dog.
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setLocation(`/dogs/${id}`)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={transferOwnership.isPending} variant="destructive">
                    {transferOwnership.isPending ? "Updating Ledger..." : "Transfer on ZCR Ledger"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
