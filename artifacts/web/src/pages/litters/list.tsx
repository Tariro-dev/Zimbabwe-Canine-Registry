import * as React from 'react';
import { useListLitters, useCreateLitter, Litter, useRegisterPuppies } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { getListLittersQueryKey, getListDogsQueryKey } from '@workspace/api-client-react';
import { toast } from 'sonner';
import { Plus, Trash2, Dog } from 'lucide-react';

const formSchema = z.object({
  sireMicrochip: z.string().min(1, "Required"),
  dameMicrochip: z.string().min(1, "Required"),
  expectedBirthDate: z.string().min(1, "Required"),
});

const puppiesSchema = z.object({
  puppies: z.array(z.object({
    name: z.string().min(1, "Name required"),
    gender: z.enum(['male', 'female']),
    color: z.string().min(1, "Color required"),
    microchipId: z.string().min(15, "15 digits required").max(15)
  })).min(1, "At least one puppy required")
});

export default function LittersList() {
  const { data: litters, isLoading } = useListLitters();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Litter Management</h1>
          <p className="text-muted-foreground mt-1">Pre-register litters and convert them into individual blockchain identities.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Register Expected Litter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register Expected Litter</DialogTitle>
            </DialogHeader>
            <LitterForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3].map(i => <Card key={i} className="animate-pulse h-40"></Card>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(litters) && litters.map(litter => (
            <LitterCard key={litter.id} litter={litter} />
          ))}
          {(!Array.isArray(litters) || litters.length === 0) && (
            <div className="col-span-full py-12 text-center border border-dashed rounded-lg bg-card/50">
              <p className="text-muted-foreground">No active litters found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LitterCard({ litter }: { litter: Litter }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Due: {format(new Date(litter.expectedBirthDate), 'MMM d, yyyy')}</CardTitle>
        <CardDescription>Breeder: {litter.breederName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground">Sire</span>
            <span className="font-mono text-primary">{litter.sireMicrochip}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-muted-foreground">Dame</span>
            <span className="font-mono text-primary">{litter.dameMicrochip}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t border-border/50">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2"/> Register Puppies
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register Puppies for this Litter</DialogTitle>
              <CardDescription>This will mint individual identities on the registry for each puppy.</CardDescription>
            </DialogHeader>
            <RegisterPuppiesForm litterId={litter.id} onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

function RegisterPuppiesForm({ litterId, onSuccess }: { litterId: string, onSuccess: () => void }) {
  const registerPuppies = useRegisterPuppies();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof puppiesSchema>>({
    resolver: zodResolver(puppiesSchema),
    defaultValues: {
      puppies: [{ name: '', gender: 'male', color: '', microchipId: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "puppies"
  });

  const onSubmit = (data: z.infer<typeof puppiesSchema>) => {
    registerPuppies.mutate({ id: litterId, data }, {
      onSuccess: () => {
        toast.success("Puppies registered successfully on the blockchain.");
        queryClient.invalidateQueries({ queryKey: getListDogsQueryKey() });
        onSuccess();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-muted/20">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm">Puppy #{index + 1}</h4>
              {fields.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`puppies.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registered Name</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. ZCR Simba" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`puppies.${index}.microchipId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Microchip ID</FormLabel>
                    <FormControl><Input {...field} className="font-mono" maxLength={15} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`puppies.${index}.gender`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`puppies.${index}.color`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color/Markings</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}

        <div className="flex gap-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => append({ name: '', gender: 'male', color: '', microchipId: '' })}>
            <Plus className="w-4 h-4 mr-2" /> Add Puppy
          </Button>
          <Button type="submit" className="flex-1" disabled={registerPuppies.isPending}>
            {registerPuppies.isPending ? "Processing..." : "Complete Registration"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function LitterForm({ onSuccess }: { onSuccess: () => void }) {
  const createLitter = useCreateLitter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sireMicrochip: '',
      dameMicrochip: '',
      expectedBirthDate: ''
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createLitter.mutate({ data }, {
      onSuccess: () => {
        toast.success("Litter pre-registered successfully.");
        queryClient.invalidateQueries({ queryKey: getListLittersQueryKey() });
        onSuccess();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="sireMicrochip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sire Microchip</FormLabel>
              <FormControl><Input {...field} className="font-mono" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dameMicrochip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dame Microchip</FormLabel>
              <FormControl><Input {...field} className="font-mono" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expectedBirthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Birth Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-4" disabled={createLitter.isPending}>
          Register Litter
        </Button>
      </form>
    </Form>
  );
}
