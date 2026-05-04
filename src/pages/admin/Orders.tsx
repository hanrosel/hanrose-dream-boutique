import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, PackageCheck, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type OrderItem = {
  id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  selected_size: string | null;
};

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  whatsapp: string;
  address: string;
  city: string;
  notes: string | null;
  admin_notes: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

const statuses = [
  "pending_payment",
  "paid",
  "packed",
  "shipped",
  "cancelled",
];

const labels: Record<string, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

const formatPrice = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

const waLink = (order: Order) => {
  const items = order.order_items
    .map((item) => {
      const size = item.selected_size ? ` (${item.selected_size})` : "";
      return `- ${item.product_name}${size} x${item.quantity}`;
    })
    .join("\n");
  const message = [
    `Halo ${order.customer_name}, ini admin Hanrose Atelier.`,
    `Order ${order.order_code}:`,
    items,
    "",
    `Total sementara: ${formatPrice(order.total)}`,
    "Kami bantu konfirmasi stok, ongkir, dan rekening transfer ya.",
  ].join("\n");
  const num = order.whatsapp.replace(/\D/g, "").replace(/^0/, "62");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
};

export default function AdminOrders() {
  const qc = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*,order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  const updateOrder = async (id: string, patch: { status?: string; admin_notes?: string | null }) => {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order updated");
    qc.invalidateQueries({ queryKey: ["admin_orders"] });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Guest checkout masuk ke sini untuk follow up via WhatsApp.</p>
        </div>
        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["admin_orders"] })}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : orders.length ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="rounded-2xl p-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-pink-soft px-3 py-1 text-xs font-medium text-pink">
                      {order.order_code}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(order.created_at))}
                    </span>
                  </div>
                  <h2 className="mt-3 font-serif text-2xl">{order.customer_name}</h2>
                  <p className="text-sm text-muted-foreground">{order.whatsapp}</p>
                  <p className="mt-3 text-sm leading-relaxed">
                    {order.address}, {order.city}
                  </p>
                  {order.notes && <p className="mt-2 text-sm text-muted-foreground">Catatan: {order.notes}</p>}

                  <div className="mt-5 space-y-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                        {item.product_image && (
                          <img src={item.product_image} alt={item.product_name} className="h-14 w-14 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-xs text-muted-foreground">
                            x{item.quantity}{item.selected_size ? ` - Size ${item.selected_size}` : ""}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="rounded-2xl border p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Total sementara</div>
                    <div className="mt-1 font-serif text-3xl">{formatPrice(order.total)}</div>
                    <div className="mt-4">
                      <Select value={order.status} onValueChange={(status) => updateOrder(order.id, { status })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {labels[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button asChild variant="whatsapp" className="mt-3 w-full">
                      <a href={waLink(order)} target="_blank" rel="noreferrer">
                        <MessageCircle className="h-4 w-4" /> Follow up
                      </a>
                    </Button>
                  </div>
                  <div className="mt-3">
                    <Textarea
                      value={notes[order.id] ?? order.admin_notes ?? ""}
                      onChange={(e) => setNotes((current) => ({ ...current, [order.id]: e.target.value }))}
                      placeholder="Catatan admin"
                    />
                    <Button
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => updateOrder(order.id, { admin_notes: notes[order.id] ?? order.admin_notes ?? null })}
                    >
                      <PackageCheck className="h-4 w-4" /> Save note
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-muted p-10 text-center text-sm text-muted-foreground">
          Belum ada order.
        </div>
      )}
    </div>
  );
}
