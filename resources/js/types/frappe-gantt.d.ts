declare module 'frappe-gantt' {
    export type GanttTask = {
        id: string;
        name: string;
        start: string | Date;
        end: string | Date;
        progress?: number;
        dependencies?: string | string[];
        custom_class?: string;
        color?: string;
        color_progress?: string;
        description?: string;
        [key: string]: unknown;
    };

    export type GanttViewMode = {
        name: string;
        padding: string | [string, string];
        step: string;
        date_format?: string;
        column_width?: number;
        snap_at?: string;
        lower_text?: string | ((currentDate: Date, previousDate: Date | null, language: string) => string);
        upper_text?: string | ((currentDate: Date, previousDate: Date | null, language: string) => string);
        upper_text_frequency?: number;
        thick_line?: (currentDate: Date) => boolean;
    };

    export type GanttOptions = {
        arrow_curve?: number;
        bar_corner_radius?: number;
        bar_height?: number;
        column_width?: number;
        container_height?: 'auto' | number;
        date_format?: string;
        holidays?: Record<string, 'weekend' | Array<string | Date | { date: string; name?: string } | ((date: Date) => boolean)>>;
        hover_on_date?: boolean;
        infinite_padding?: boolean;
        language?: string;
        lines?: 'none' | 'vertical' | 'horizontal' | 'both';
        lower_header_height?: number;
        move_dependencies?: boolean;
        padding?: number;
        popup?: false | ((context: {
            task: GanttTask & { _start: Date; _end: Date; actual_duration?: number; ignored_duration?: number };
            chart: Gantt;
            get_title: () => HTMLElement;
            get_subtitle: () => HTMLElement;
            get_details: () => HTMLElement;
            set_title: (html: string) => void;
            set_subtitle: (html: string) => void;
            set_details: (html: string) => void;
            add_action: (html: string, callback: () => void) => void;
        }) => false | string | void);
        popup_on?: 'click' | 'hover';
        readonly?: boolean;
        readonly_dates?: boolean;
        readonly_progress?: boolean;
        scroll_to?: 'today' | 'start' | 'end' | string | null;
        show_expected_progress?: boolean;
        today_button?: boolean;
        upper_header_height?: number;
        view_mode?: string | GanttViewMode;
        view_mode_select?: boolean;
        view_modes?: Array<string | GanttViewMode>;
    };

    export default class Gantt {
        constructor(element: string | HTMLElement | SVGElement, tasks: GanttTask[], options?: GanttOptions);

        tasks: GanttTask[];
        options: GanttOptions & { view_mode?: string };
        dates: Date[];
        gantt_start: Date;
        $container: HTMLDivElement;
        config: {
            column_width: number;
            header_height: number;
            step: number;
            unit: string;
            view_mode: GanttViewMode;
        };

        change_view_mode(viewMode: string | GanttViewMode, maintainPos?: boolean): void;
        refresh(tasks: GanttTask[]): void;
        scroll_current(): void;
        update_options(options: GanttOptions): void;
        update_task(id: string, newDetails: Partial<GanttTask>): void;
    }
}
