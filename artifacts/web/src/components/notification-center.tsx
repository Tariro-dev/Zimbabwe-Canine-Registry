import * as React from 'react';
import { useListNotifications, useMarkNotificationRead, Notification } from '@workspace/api-client-react';
import { Bell, Check, Info, ArrowRightLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuHeader,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationCenter() {
  const { data: notifications } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter(n => !n.isRead).length
    : 0;

  const handleRead = (id: string) => {
    markRead.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['listNotifications'] });
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground border-2 border-background">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 font-semibold border-b border-border">Notifications</div>
        <div className="max-h-[400px] overflow-y-auto">
          {!Array.isArray(notifications) || notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">All caught up!</div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={`p-4 cursor-pointer flex gap-3 items-start border-b border-border last:border-0 ${n.isRead ? 'opacity-60' : 'bg-primary/5'}`}
                onClick={() => handleRead(n.id)}
              >
                <NotificationIcon type={n.type} />
                <div className="flex-1 space-y-1">
                  <div className="text-sm font-medium leading-none">{n.title}</div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  <div className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1" />}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case 'transfer_request': return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
    default: return <Info className="w-4 h-4 text-muted-foreground" />;
  }
}
