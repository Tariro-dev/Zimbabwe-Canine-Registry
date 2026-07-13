import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateDog, DogInputGender, DogInputSterilizationStatus } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  breed: z.string().min(1, "Breed is required"),
  gender: z.enum(["male", "female"]),
  color: z.string().optional(),
  birthDate: z.string().min(1, "Birth date is required"),
  microchipId: z.string().min(1, "Microchip ID is required"),
  dameMicrochip: z.string().optional(),
  sireMicrochip: z.string().optional(),
  dnaHash: z.string().optional(),
  weight: z.string().optional(),
  vaccineHistory: z.string().optional(),
  sterilizationStatus: z.enum(["Sterilized", "Not Sterilized"]).optional(),
});

export default function RegisterDog() {
  const [, setLocation] = useLocation();
  const createDog = useCreateDog();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      breed: "",
      gender: "male",
      color: "",
      birthDate: new Date().toISOString().split('T')[0],
      microchipId: "",
      dameMicrochip: "",
      sireMicrochip: "",
      dnaHash: "",
      weight: "",
      vaccineHistory: "Up to date",
      sterilizationStatus: "Not Sterilized"
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createDog.mutate(
      { data: data as any },
      {
        onSuccess: (res) => {
          toast.success("Dog registered successfully on the blockchain.");
          setLocation(`/dogs/${res.id}`);
        },
        onError: (err) => {
          toast.error("Failed to register dog.");
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Register New Dog</h1>
        <p className="text-muted-foreground mt-1">Add a new canine identity to the immutable blockchain ledger.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Identity & Basic Info</CardTitle>
              <CardDescription>Core identity details.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dog Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="microchipId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Microchip ID (15-digit)</FormLabel>
                    <FormControl><Input {...field} className="font-mono" placeholder="900XXXXXXXXXXXX" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breed</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color / Markings</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dnaHash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNA Hash (optional)</FormLabel>
                    <FormControl><Input {...field} className="font-mono" placeholder="SHA256:..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. 32" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lineage (Optional)</CardTitle>
              <CardDescription>Link to existing registered parents.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sireMicrochip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sire Microchip ID</FormLabel>
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
                    <FormLabel>Dame Microchip ID</FormLabel>
                    <FormControl><Input {...field} className="font-mono" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sterilizationStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sterilization</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                name="vaccineHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaccine Status</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={createDog.isPending} className="w-full md:w-auto px-8">
              {createDog.isPending ? "Committing to Ledger..." : "Register Dog"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
