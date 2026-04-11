import { useState } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Download, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight, 
    Calendar, 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

// ────────────────────────────────────────────────
//  Type
// ────────────────────────────────────────────────
type Quarter = {
    label: string; // "01/2026 - 03/2026"
    value: string; // "2026-01"
    startMonth: number; // 1 | 4 | 7 | 10
}

// ────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────

function getQuarters(year: number): Quarter[] {
    return [1, 4, 7, 10].map((startMonth) => {
        const endMonth = startMonth + 2;
        return {
            label: `${startMonth.toString().padStart(2, '0')}/${year} - ${endMonth.toString().padStart(2, '0')}/${year}`,
            value: `${year}-${startMonth.toString().padStart(2, '0')}`,
            startMonth,
        };
    });
}

function quarterLabel(startMonth: number): string {
    const map: Record<number, string> = {
        1: 'T1',
        4: 'T2',
        7: 'T3',
        10: 'T4',
    };
    return map[startMonth] ?? '';
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export function ExportVisitorsDropdown() {
    // ────────────────────────────────────────────────
    //  States & variables
    // ────────────────────────────────────────────────
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());

    const quarters = getQuarters(year);
    const currentYear = new Date().getFullYear();

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleExport = (quarter: Quarter) => {
        setOpen(false);

        // Ouvrir dans une nouvelle page
        window.open(ReservationController.exportReportedVisitors({
            query: { period: quarter.value },
        }).url, '_blank');
    };

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 gap-2 px-4 shadow-sm hover:bg-accent transition-colors">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[13.5px] font-medium">{isMobile ? "Export" : "Exporter les visiteurs déclarés"}</span>
                    <ChevronDown className={cn(
                        "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", 
                        open && "rotate-180"
                    )} />
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden shadow-lg border-muted/40">
                {/* Year Navigator */}
                <div className="flex items-center justify-between p-2 bg-muted/30 border-b border-muted/40">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 hover:bg-background"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setYear(y => y - 1);
                        }}
                    >
                        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-tight">{year}</span>
                        {year === currentYear && (
                            <Badge className={cn("bg-primary/10 text-primary")}>
                                Actuelle
                            </Badge>
                        )}
                    </div>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 hover:bg-background"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setYear(y => y + 1);
                        }}
                    >
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>

                <div className="p-1">
                    <DropdownMenuLabel className="px-2 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Période de 3 mois
                    </DropdownMenuLabel>
                    
                    <div className="space-y-0.5">
                        {quarters.map((q) => {
                            return (
                                <DropdownMenuItem 
                                    key={q.value}
                                    onClick={() => handleExport(q)}
                                    className="flex items-center gap-3 p-2 cursor-pointer focus:bg-accent rounded-md group"
                                >
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-secondary/80 group-hover:bg-primary/10 transition-colors text-[11px] font-bold text-secondary-foreground group-hover:text-primary">
                                        {quarterLabel(q.startMonth)}
                                    </div>
                                    <div className="flex-1 text-sm font-medium">
                                        {q.label}
                                    </div>
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                </DropdownMenuItem>
                            );
                        })}
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ExportVisitorsDropdown;
