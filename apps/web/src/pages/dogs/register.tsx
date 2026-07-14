import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateDog, useGetMyProfile, useIdentifyBreed } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Sparkles, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const { data: profile } = useGetMyProfile();
  const identifyBreed = useIdentifyBreed();
  const [aiSuggestions, setAiSuggestions] = React.useState<{ breed: string; confidence: number }[] | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setAiSuggestions(null);

      const promise = identifyBreed.mutateAsync({
        data: { image: base64 }
      });

      toast.promise(promise, {
        loading: 'AI analyzing breed from photo...',
        success: (res) => {
          setAiSuggestions(res.predictions);
          return 'Analysis complete. See suggestions below.';
        },
        error: 'AI analysis failed.'
      });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!profile) {
      toast.error("You must be logged in to register a dog.");
      return;
    }

    createDog.mutate(
      { data: data as any },
      {
        onSuccess: (res) => {
          toast.success(`${data.name} has been registered and anchored on the blockchain.`);
          setLocation(`/dogs/${res.id}`);
        },
        onError: (err) => {
          toast.error("Failed to register dog on the blockchain.");
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
                    <FormLabel className="flex justify-between">
                      Microchip ID (15-digit)
                      <button
                        type="button"
                        onClick={() => field.onChange("900" + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'))}
                        className="text-[10px] text-primary hover:underline uppercase font-bold"
                      >
                        [Simulate Scan]
                      </button>
                    </FormLabel>
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
                    <FormLabel className="flex justify-between items-center">
                      Breed
                      <div className="flex gap-2">
                        <input
                          type="file"
                          className="hidden"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] text-primary font-bold gap-1 uppercase hover:bg-primary/10"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={identifyBreed.isPending}
                        >
                          <Sparkles className="w-3 h-3" /> AI Identify
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    {aiSuggestions && (
                      <div className="flex flex-wrap gap-2 mt-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                        <span className="text-[10px] font-bold text-muted-foreground w-full mb-1 uppercase tracking-wider">AI Results:</span>
                        {aiSuggestions.map((s, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/20 border-primary/30 text-primary"
                            onClick={() => { field.onChange(s.breed); setAiSuggestions(null); }}
                          >
                            {s.breed} {Math.round(s.confidence * 100)}%
                          </Badge>
                        ))}
                      </div>
                    )}
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
