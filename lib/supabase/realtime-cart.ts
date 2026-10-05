import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export function subscribeToCart(
  supabase: SupabaseClient,
  userId: string,
  onChange: () => void
): RealtimeChannel {
  const channel = supabase
    .channel(`cart-sync-${userId}-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cart_items',
        filter: `user_id=eq.${userId}`,
      },
      () => onChange()
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn('[realtime-cart] channel error — polling fallback active');
      }
    });

  return channel;
}