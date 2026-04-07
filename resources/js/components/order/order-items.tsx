import { OrderItem } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatNumber } from "@/lib/format-number";
import { useIsMobile } from "@/hooks/use-mobile";

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    items: OrderItem[];
    onEdit: (item: OrderItem) => void;
    onDelete: (id: number) => void;
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function OrderItemsTable({
    items,
    onEdit,
    onDelete
}: Props) {
    const isMobile = useIsMobile();

    return (
        <div className="space-y-4">
            {/* Desktop Table */}
            {!isMobile && (
                <Table>
                    <TableHeader className="bg-muted">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-bold text-foreground">Produit</TableHead>
                            <TableHead className="font-semibold text-center">Qté</TableHead>
                            <TableHead className="font-semibold text-right">Prix Unit.</TableHead>
                            <TableHead className="font-semibold text-right">Total</TableHead>
                            <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Aucun article trouvé.
                                </TableCell>
                            </TableRow>
                        )}
                        {items.map((item) => (
                            <TableRow 
                                key={item.id} 
                                className="group transition-colors hover:bg-muted/30 border-gray-50 dark:border-white/5"
                            >
                                <TableCell className="font-medium text-foreground py-4">{item.product_name}</TableCell>
                                <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                                <TableCell className="text-right text-sm">
                                    {formatNumber(item.price as number, {endWith: 'DH'})}
                                </TableCell>
                                <TableCell className="text-right font-bold text-sm text-brand-600">
                                    {formatNumber(item.total as number, {endWith: 'DH'})}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ActionButtons
                                            onEdit={() => onEdit(item)}
                                            onDelete={() => onDelete(item.id)}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Mobile View */}
            {isMobile && (
                <div className="divide-y divide-border">
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <p className="text-sm font-medium text-muted-foreground">
                                Aucun article trouvé.
                            </p>
                        </div>
                    )}
                    {items.map((item) => (
                        <div key={item.id} className="py-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-foreground">{item.product_name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Quantité: <span className="font-medium text-foreground">{item.quantity}</span>
                                    </p>
                                </div>
                                <ActionButtons
                                    onEdit={() => onEdit(item)}
                                    onDelete={() => onDelete(item.id)}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="rounded-md bg-muted/50 p-2 shadow-sm">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Prix Unit.</p>
                                    <p className="font-medium font-mono">
                                        {formatNumber(item.price as number, { endWith: 'DH' })}
                                    </p>
                                </div>
                                <div className="rounded-md bg-brand-50 dark:bg-brand-500/10 p-2 shadow-sm">
                                    <p className="text-[10px] text-brand-600 uppercase font-bold">Total</p>
                                    <p className="font-bold font-mono text-brand-700 dark:text-brand-400">
                                        {formatNumber(item.total as number, { endWith: 'DH' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ────────────────────────────────────────────────
//  Sub-components
// ────────────────────────────────────────────────
function ActionButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    return (
        <div className="flex justify-end gap-2">
            <Button
                variant="info"
                size="icon"
                className="h-8 w-8"
                onClick={onEdit}
                title="Modifier"
            >
                <Pencil className="h-4 w-4" />
            </Button>
            <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={onDelete}
                title="Supprimer"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}