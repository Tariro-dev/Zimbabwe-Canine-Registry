import * as React from 'react';
import { useListDogMedia, MediaItem } from '@workspace/api-client-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MediaGallery({ dogId }: { dogId: string }) {
  const { data: media, isLoading } = useListDogMedia(dogId);

  if (isLoading) return <div className="animate-pulse h-24 bg-muted rounded-xl"></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents & Media</CardTitle>
        <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1"/> Upload</Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.isArray(media) && media.map((item: MediaItem) => (
            <div key={item.id} className="group relative aspect-square rounded-lg border border-border overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all cursor-pointer">
              {item.type === 'image' ? (
                <img src={item.url} alt={item.description || ''} className="object-cover w-full h-full" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 p-2">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                  <span className="text-[10px] text-center font-medium line-clamp-2">{item.description || 'Document'}</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-white capitalize">{item.type.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
          {(!media || media.length === 0) && (
            <div className="col-span-full py-8 text-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
              No documents uploaded yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
