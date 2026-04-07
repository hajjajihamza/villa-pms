import { Card } from "../ui/card";
import { Order, OrderItem } from "@/types";
import { format } from "date-fns";
import { User, Home, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useState } from "react";
import { formatNumber } from "@/lib/format-number";
import OrderItemsTable from "./order-items";
import { useIsMobile } from "@/hooks/use-mobile";

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    order: Order;
    onEditItem: (item: OrderItem) => void;
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function OrderCard({
    order,
    onEditItem,
}: Props) {
    // ────────────────────────────────────────────────
    //  States & variables
    // ────────────────────────────────────────────────
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile();

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <Card className="overflow-hidden border-gray-100 shadow-sm transition-all hover:shadow-md dark:border-white/5 py-3">
                <CollapsibleTrigger asChild>
                    <div className="cursor-pointer px-2 group">
                        <div className="flex items-center justify-between gap-2">
                            {/* Left: date + meta */}
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <Badge
                                    variant="outline"
                                    className="w-fit text-sm font-mono border-brand-200 text-brand-600 px-1.5 py-0"
                                >
                                    {format(order.date, 'dd/MM/yyyy HH:mm')}
                                </Badge>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1 min-w-0">
                                        <User size={14} className="text-gray-400 shrink-0" />
                                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">
                                            {order.reservation?.main_visitor?.full_name || 'Client Direct'}
                                        </span>
                                    </div>
                                    {!isMobile && order.reservation?.accommodation?.name && (
                                        <div className="flex items-center gap-1">
                                            <Home size={14} className="text-gray-400 shrink-0" />
                                            <span className="truncate max-w-[100px]">
                                                {order.reservation?.accommodation?.name || 'N/A'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: total + chevron */}
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="flex flex-col items-center">
                                    <span className="text-sm text-gray-600 uppercase font-black leading-none">Total</span>
                                    <span className="text-sm font-bold text-brand-600 leading-tight">
                                        {formatNumber(order.total_amount as number, { endWith: 'DH' })}
                                    </span>
                                </div>
                                <div className="rounded-full bg-gray-50 p-2 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors dark:bg-white/5">
                                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                            </div>
                        </div>

                        {/* Mobile-only: accommodation row */}
                        {isMobile && order.reservation?.accommodation?.name && (
                            <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400">
                                <Home size={12} className="shrink-0" />
                                <span className="truncate">{order.reservation.accommodation.name}</span>
                            </div>
                        )}
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="px-3 pb-3 bg-gray-50/50 dark:bg-black/20">
                        <div className="h-px w-full bg-gray-100 mb-3 dark:bg-white/5" />
                        <OrderItemsTable
                            items={order.order_items || []}
                            onEdit={onEditItem}
                        />
                    </div>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}