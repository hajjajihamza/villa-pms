import '../../../css/frappe-gantt.css';

import {
    differenceInCalendarDays,
    eachDayOfInterval,
    format,
    isAfter,
    isBefore,
    isSameDay,
    isSameMonth,
    parseISO,
    startOfDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import Gantt from 'frappe-gantt';
import type { GanttTask, GanttViewMode } from 'frappe-gantt';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { PlanningUnit } from './plannin';
import { Channel } from '@/types';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    displayStart: Date;
    displayEnd: Date;
    view: 'week' | 'month';
    units: PlanningUnit[];
    onReservationSelect: (reservationId: number) => void;
    onDateSelect: (date: Date) => void;
};

type ChartMetrics = {
    headerHeight: number;
    rowHeight: number;
    columnWidth: number;
    gridWidth: number;
    contentHeight: number;
};

type ReservationTask = {
    id: string;
    reservationId: number;
    guestName: string;
    unitIndex: number;
    color: string;
    start: Date;
    end: Date;
    left: number;
    width: number;
    nights: number;
    accommodationName: string;
    is_external: boolean;
    channel?: Channel;
};

// ────────────────────────────────────────────────
//  Constants
// ────────────────────────────────────────────────
const BAR_HEIGHT = 34;
const ROW_PADDING = 26;
const ROW_HEIGHT = BAR_HEIGHT + ROW_PADDING;
const HEADER_TOP = 42;
const HEADER_BOTTOM = 34;
const START_DAY_OFFSET = 0.5;
const END_DAY_OFFSET = 0.4;

const planningViewMode: GanttViewMode = {
    name: 'Planning',
    padding: ['0d', '0d'],
    step: '1d',
    date_format: 'YYYY-MM-DD',
    lower_text: (currentDate) => format(currentDate, 'dd', { locale: fr }),
    upper_text: (currentDate, previousDate) =>
        !previousDate || !isSameMonth(currentDate, previousDate) ? formatHeaderMonth(currentDate) : '',
    upper_text_frequency: 28,
    thick_line: (currentDate) => currentDate.getDay() === 1 || currentDate.getDate() === 1,
};

// ────────────────────────────────────────────────
//  Helper functions
// ────────────────────────────────────────────────
function capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function withAlpha(color: string, opacity: number) {
    const normalized = color.trim();

    if (/^#([0-9a-f]{3}){1,2}$/i.test(normalized)) {
        let hex = normalized.slice(1);
        if (hex.length === 3) {
            hex = hex
                .split('')
                .map((char) => char + char)
                .join('');
        }

        const value = Number.parseInt(hex, 16);
        const r = (value >> 16) & 255;
        const g = (value >> 8) & 255;
        const b = value & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    if (normalized.startsWith('rgb(')) {
        return normalized.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
    }

    return normalized;
}

function formatHeaderMonth(date: Date) {
    return capitalize(format(date, 'MMMM yyyy', { locale: fr }));
}

function createLaneTasks(units: PlanningUnit[], displayStart: Date, displayEnd: Date): GanttTask[] {
    return units.map((unit) => {
        const end = new Date(startOfDay(displayEnd));
        end.setSeconds(1);

        return {
            id: `lane-${unit.id}`,
            name: unit.name,
            start: startOfDay(displayStart),
            end,
            progress: 100,
            custom_class: 'planning-gantt__lane-placeholder',
        };
    });
}

function createReservationTasks(
    units: PlanningUnit[],
    displayStart: Date,
    displayEnd: Date,
    columnWidth: number,
    visibleColumns: number
): ReservationTask[] {
    const start = startOfDay(displayStart);
    const end = startOfDay(displayEnd);

    return units.flatMap((unit, unitIndex) =>
        unit.reservations.flatMap((reservation) => {
            const reservationStart = startOfDay(parseISO(reservation.check_in));
            const reservationEnd = startOfDay(parseISO(reservation.check_out));

            const overlaps = reservationStart <= end && reservationEnd >= start;
            if (!overlaps) {
                return [];
            }

            const startsBeforeRange = isBefore(reservationStart, start);
            const endsAfterRange = isAfter(reservationEnd, end);

            const startIndex = startsBeforeRange ? 0 : differenceInCalendarDays(reservationStart, start);
            const endIndex = endsAfterRange ? visibleColumns : differenceInCalendarDays(reservationEnd, start);

            const left = (startIndex + (startsBeforeRange ? 0 : START_DAY_OFFSET)) * columnWidth;
            let right = endsAfterRange ? visibleColumns * columnWidth : (endIndex + END_DAY_OFFSET) * columnWidth;

            if (right <= left) {
                right = Math.min(visibleColumns * columnWidth, left + Math.max(columnWidth * 0.35, 28));
            }

            return [
                {
                    id: `reservation-${reservation.id}`,
                    reservationId: reservation.id,
                    guestName: reservation.main_visitor?.full_name || 'Visiteur inconnu',
                    unitIndex,
                    color: unit.color || '#0f766e',
                    start: reservationStart,
                    end: reservationEnd,
                    left,
                    width: right - left,
                    nights: Math.max(differenceInCalendarDays(reservationEnd, reservationStart), 1),
                    accommodationName: reservation.accommodation?.name || unit.name,
                    is_external: reservation?.is_external ?? false,
                    channel: reservation.channel
                },
            ];
        }),
    );
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function PlanningGantt({
    displayStart,
    displayEnd,
    view,
    units,
    onReservationSelect,
    onDateSelect,
}: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const isMobile = useIsMobile();
    const mountRef = useRef<HTMLDivElement | null>(null);
    const [portalTarget, setPortalTarget] = useState<HTMLDivElement | null>(null);
    const rangeStartKey = displayStart.getTime();
    const rangeEndKey = displayEnd.getTime();
    const [metrics, setMetrics] = useState<ChartMetrics>({
        headerHeight: HEADER_TOP + HEADER_BOTTOM + 10,
        rowHeight: ROW_HEIGHT,
        columnWidth: view === 'month' ? 72 : 112,
        gridWidth: 0,
        contentHeight: 0,
    });

    const days = eachDayOfInterval({
        start: startOfDay(displayStart),
        end: startOfDay(displayEnd),
    });

    const today = startOfDay(new Date());
    const reservationTasks = createReservationTasks(units, displayStart, displayEnd, metrics.columnWidth, days.length);

    // ────────────────────────────────────────────────
    //  Effects
    // ────────────────────────────────────────────────
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount || units.length === 0) {
            return;
        }

        const rangeStart = new Date(rangeStartKey);
        const rangeEnd = new Date(rangeEndKey);

        mount.replaceChildren();

        const gantt = new Gantt(mount, createLaneTasks(units, rangeStart, rangeEnd), {
            language: 'fr',
            readonly: true,
            readonly_dates: true,
            readonly_progress: true,
            move_dependencies: false,
            popup: false,
            popup_on: 'hover',
            infinite_padding: false,
            lines: 'both',
            scroll_to: 'start',
            today_button: false,
            view_mode_select: false,
            upper_header_height: HEADER_TOP,
            lower_header_height: HEADER_BOTTOM,
            bar_height: BAR_HEIGHT,
            padding: ROW_PADDING,
            column_width: view === 'month' ? 72 : isMobile ? 90 : mount.clientWidth / 8,
            view_modes: [planningViewMode],
            view_mode: planningViewMode,
        });

        const container = mount.querySelector('.gantt-container') as HTMLDivElement | null;
        if (!container) {
            return;
        }

        container.classList.add('planning-gantt__viewport');

        const columnWidth = gantt.config.column_width;
        const headerHeight = gantt.config.header_height;

        setMetrics({
            headerHeight,
            rowHeight: ROW_HEIGHT,
            columnWidth,
            gridWidth: days.length * columnWidth,
            contentHeight: headerHeight + units.length * ROW_HEIGHT,
        });
        setPortalTarget(container);

        return () => {
            setPortalTarget(null);
            mount.replaceChildren();
        };
    }, [days.length, rangeEndKey, rangeStartKey, units, view]);

    // ────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────
    return (
        <ScrollArea className="planning-gantt rounded-xl border bg-card/80 shadow-sm">
            <div className="flex min-w-fit">
                {/* sidebar */}
                <div
                    className="sticky left-0 z-20 shrink-0 border-r bg-card/95 backdrop-blur"
                    style={{ width: isMobile ? 120 : 180 }}
                >
                    <div
                        className="flex items-center border-b bg-muted/40 px-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground"
                        style={{ height: metrics.headerHeight }}
                    >
                        Unites
                    </div>

                    {units.map((unit) => (
                        <div
                            key={unit.id}
                            className="flex items-center border-b px-4 text-sm font-semibold text-foreground"
                            style={{ height: metrics.rowHeight }}
                        >
                            <div className="min-w-0">
                                <p className="truncate border-b" style={{ color: unit.color ?? '#d4d4d8', borderColor: unit.color ?? '#d4d4d8' }}>{unit.name}</p>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {unit.reservations.length} reservation{unit.reservations.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* gantt */}
                <div className="min-w-0 flex-1">
                    <div ref={mountRef} className="planning-gantt__mount" />
                </div>
            </div>

            {portalTarget &&
                createPortal(
                    <div
                        className="planning-gantt__overlay"
                        style={{ width: metrics.gridWidth, height: metrics.contentHeight }}
                    >
                        {units.flatMap((unit, unitIndex) =>
                            days.map((day, dayIndex) => {
                                const isPast = isBefore(startOfDay(day), today);
                                const isToday = isSameDay(day, today);

                                return (
                                    <button
                                        key={`${unit.id}-${day.toISOString()}`}
                                        type="button"
                                        className={cn(
                                            'planning-gantt__cell',
                                            isPast && 'planning-gantt__cell--locked',
                                            isToday && 'planning-gantt__cell--today',
                                        )}
                                        style={{
                                            left: dayIndex * metrics.columnWidth,
                                            top: metrics.headerHeight + unitIndex * metrics.rowHeight,
                                            width: metrics.columnWidth,
                                            height: metrics.rowHeight,
                                        }}
                                        disabled={isPast}
                                        onClick={() => {
                                            if (!isPast) {
                                                onDateSelect(day);
                                            }
                                        }}
                                        aria-label={`Creer une reservation le ${format(day, 'dd MMMM yyyy', { locale: fr })}`}
                                    />
                                );
                            }),
                        )}

                        {reservationTasks.map((task) => (
                            <Tooltip key={task.id}>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="planning-gantt__task truncate"
                                        style={{
                                            left: task.left,
                                            top: metrics.headerHeight + task.unitIndex * metrics.rowHeight + 1.2,
                                            width: task.width,
                                            height: metrics.rowHeight - 1.2,
                                            background: `linear-gradient(135deg, ${withAlpha(task.color, 0.2)}, ${withAlpha(task.color, 0.36)})`,
                                            borderColor: withAlpha(task.color, 0.5),
                                            borderLeftColor: task.color,
                                            boxShadow: `0 12px 24px ${withAlpha(task.color, 0.18)}`,
                                        }}
                                        onClick={(event) => {
                                            if (!task.is_external) {
                                                event.stopPropagation();
                                                onReservationSelect(task.reservationId);
                                            }
                                        }}
                                        aria-label={`${task.guestName}, du ${format(task.start, 'dd MMM yyyy', {
                                            locale: fr,
                                        })} au ${format(task.end, 'dd MMM yyyy', { locale: fr })}`}
                                    >
                                        <span className="text-[11px] font-semibold text-foreground">
                                            {capitalize(task.guestName)}
                                        </span>
                                        <div className="gap-1.5 font-mono text-[9px] font-bold text-white rounded-full px-2" style={{ backgroundColor: task.channel?.color ?? "#000" }}>
                                            {task.channel?.name}
                                        </div>
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent
                                    side="top"
                                    className="max-w-xs rounded-xl border border-border bg-popover px-3 py-2 shadow-xl"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-popover-foreground">{capitalize(task.guestName)}</p>
                                        <p className="text-xs text-muted-foreground">{task.accommodationName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Arrivee: {format(task.start, 'dd/MM/yyyy', { locale: fr })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Depart: {format(task.end, 'dd/MM/yyyy', { locale: fr })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {task.nights} nuit{task.nights > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>,
                    portalTarget,
                )}
            <ScrollBar orientation='horizontal' />
        </ScrollArea>
    );
}
