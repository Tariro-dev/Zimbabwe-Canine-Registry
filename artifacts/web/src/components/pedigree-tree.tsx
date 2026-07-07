import * as React from 'react';
import { useGetDogPedigree, PedigreeNode as PedigreeNodeType } from '@workspace/api-client-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Dog } from 'lucide-react';
import { Link } from 'wouter';

export function PedigreeTree({ dogId }: { dogId: string }) {
  const { data: tree, isLoading } = useGetDogPedigree(dogId);

  if (isLoading) return <div className="h-48 flex items-center justify-center">Loading ancestry...</div>;
  if (!tree) return null;

  return (
    <Card className="overflow-x-auto">
      <CardHeader>
        <CardTitle className="text-lg">Pedigree Chart</CardTitle>
      </CardHeader>
      <CardContent className="min-w-[800px] py-8">
        <div className="flex justify-around items-stretch">
          <TreeNode node={tree} depth={0} />
        </div>
      </CardContent>
    </Card>
  );
}

function TreeNode({ node, depth }: { node: PedigreeNodeType, depth: number }) {
  if (!node) return null;

  return (
    <div className="flex flex-col items-center flex-1">
      <div className="p-3 border-2 border-primary rounded-lg bg-card shadow-sm z-10 w-48 text-center">
        <div className="text-xs font-bold uppercase text-muted-foreground mb-1">{node.gender === 'male' ? 'Sire' : 'Dame'}</div>
        <Link href={`/dogs/${node.id}`} className="font-semibold text-primary hover:underline block truncate">
          {node.name}
        </Link>
        <div className="text-[10px] font-mono text-muted-foreground">{node.microchipId}</div>
      </div>

      {(node.sire || node.dame) && (
        <div className="flex mt-8 w-full relative">
          {/* Horizontal connecting line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-border -translate-y-4"></div>
          {/* Vertical lines to children */}
          <div className="absolute top-0 left-1/4 w-px h-4 bg-border -translate-y-4"></div>
          <div className="absolute top-0 right-1/4 w-px h-4 bg-border -translate-y-4"></div>

          <div className="flex-1 flex justify-center">
            {node.sire ? <TreeNode node={node.sire} depth={depth + 1} /> : <EmptyNode gender="male" />}
          </div>
          <div className="flex-1 flex justify-center">
            {node.dame ? <TreeNode node={node.dame} depth={depth + 1} /> : <EmptyNode gender="female" />}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyNode({ gender }: { gender: 'male' | 'female' }) {
  return (
    <div className="p-3 border-2 border-dashed border-muted rounded-lg w-48 text-center text-muted-foreground">
      <div className="text-xs font-bold uppercase mb-1">{gender === 'male' ? 'Sire' : 'Dame'}</div>
      <div className="text-xs">Unknown</div>
    </div>
  );
}
