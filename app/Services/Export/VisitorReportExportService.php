<?php

namespace App\Services\Export;

use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VisitorReportExportService
{
    // ────────────────────────────────────────────────
    //  Constants
    // ────────────────────────────────────────────────
    private const COLOR_HEADER_BG = 'FF1E3A5F'; // deep navy

    private const COLOR_HEADER_FONT = 'FFFFFFFF'; // white

    private const COLOR_TITLE_FONT = 'FF1E3A5F';

    private const COLOR_BORDER = 'FFBDC3C7';

    private const COLOR_ROW_ALT = 'FFF4F6F8'; // light grey stripe

    // ────────────────────────────────────────────────
    //  Public API
    // ────────────────────────────────────────────────

    /**
     * Stream an Excel file for declared visitors within the given period.
     *
     * @param  Carbon  $start  First day of the period (inclusive)
     * @param  Carbon  $end  Last day of the period (inclusive)
     */
    public function export(Carbon $start, Carbon $end): StreamedResponse
    {
        $reservations = Reservation::reported()
            ->whereBetween('real_check_in', [$start->startOfDay(), $end->endOfDay()])
            ->with('mainVisitor')
            ->orderBy('real_check_in')
            ->get()
            ->append('duration');

        $spreadsheet = $this->buildSpreadsheet($reservations, $start, $end);

        $filename = sprintf(
            'visiteurs_declares_%s_%s.xlsx',
            $start->format('m-Y'),
            $end->format('m-Y')
        );

        return $this->stream($spreadsheet, $filename);
    }

    // ────────────────────────────────────────────────
    //  Build
    // ────────────────────────────────────────────────

    /**
     * Build the Excel spreadsheet.
     * @param Collection<Reservation> $reservations list of reservations
     * @param Carbon $start start date of the period
     * @param Carbon $end end date of the period
     * @return Spreadsheet
     */
    private function buildSpreadsheet(Collection $reservations, Carbon $start, Carbon $end): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Visiteurs déclarés');

        $this->configurePage($sheet);
        $this->writeTitle($sheet, $start, $end);
        $this->writeTableHeader($sheet);
        $this->writeRows($sheet, $reservations);
        $this->autoSizeColumns($sheet);

        return $spreadsheet;
    }

    // ────────────────────────────────────────────────
    //  Page setup
    // ────────────────────────────────────────────────

    /**
     * Configure the page setup.
     * @param Worksheet $sheet
     * @return void
     */
    private function configurePage(Worksheet $sheet): void
    {
        $setup = $sheet->getPageSetup();
        $setup->setPaperSize(PageSetup::PAPERSIZE_A4);
        $setup->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
        $setup->setFitToWidth(1);
        $setup->setFitToHeight(0);
        $setup->setHorizontalCentered(true);

        $margins = $sheet->getPageMargins();
        $margins->setTop(0.75);
        $margins->setBottom(0.75);
        $margins->setLeft(0.7);
        $margins->setRight(0.7);
        $margins->setHeader(0.3);
        $margins->setFooter(0.3);

        // Print footer with page number
        $sheet->getHeaderFooter()
            ->setOddFooter('&CPage &P sur &N');
    }

    // ────────────────────────────────────────────────
    //  Title block
    // ────────────────────────────────────────────────

    /**
     * Write the title block.
     * @param Worksheet $sheet
     * @param Carbon $start
     * @param Carbon $end
     * @return void
     */
    private function writeTitle(Worksheet $sheet, Carbon $start, Carbon $end): void
    {
        // Row 1 - Main title (merged A1:E1)
        $sheet->mergeCells('A1:E1');
        $sheet->setCellValue('A1', 'Liste des visiteurs déclarés');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 16,
                'color' => ['argb' => self::COLOR_TITLE_FONT],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(32);

        // Row 2 - Sub-title / period (merged A2:E2)
        $sheet->mergeCells('A2:E2');
        $sheet->setCellValue('A2', sprintf(
            'Période : %s - %s',
            $start->format('m/Y'),
            $end->format('m/Y')
        ));
        $sheet->getStyle('A2')->applyFromArray([
            'font' => [
                'italic' => true,
                'size' => 11,
                'color' => ['argb' => 'FF555555'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(22);

        // Row 3 - Spacer
        $sheet->getRowDimension(3)->setRowHeight(8);
    }

    // ────────────────────────────────────────────────
    //  Table header (row 4)
    // ────────────────────────────────────────────────

    private const TABLE_START_ROW = 4;

    /**
     * Write the table header.
     * @param Worksheet $sheet
     * @return void
     */
    private function writeTableHeader(Worksheet $sheet): void {
        $row = self::TABLE_START_ROW;

        $headers = [
            'A' => 'Nom et Prénom',
            'B' => 'Date d\'arrivée',
            'C' => 'Date de départ',
            'D' => 'Visiteurs',
            'E' => 'Durée de séjour',
        ];

        foreach ($headers as $col => $label) {
            $sheet->setCellValue("{$col}{$row}", $label);
        }

        $sheet->getStyle("A{$row}:E{$row}")->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['argb' => self::COLOR_HEADER_FONT],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => self::COLOR_HEADER_BG],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => self::COLOR_BORDER],
                ],
            ],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(24);
    }

    // ────────────────────────────────────────────────
    //  Data rows
    // ────────────────────────────────────────────────

    /**
     * Write the data rows.
     * @param Worksheet $sheet
     * @param Collection<Reservation> $reservations list of reservations
     * @return void
     */
    private function writeRows(Worksheet $sheet, Collection $reservations): void {
        $row = self::TABLE_START_ROW + 1;

        foreach ($reservations as $index => $reservation) {
            $isAlt = ($index % 2 === 1);

            $sheet->setCellValue("A{$row}", ucfirst($reservation->mainVisitor->full_name));
            $sheet->setCellValue("B{$row}", Carbon::parse($reservation->real_check_in)->format('d/m/Y'));
            $sheet->setCellValue("C{$row}", Carbon::parse($reservation->real_check_out)->format('d/m/Y'));
            $sheet->setCellValue("D{$row}", sprintf('%d Adultes / %d Enfants', $reservation->adults, $reservation->children));
            $sheet->setCellValue("E{$row}", $reservation->duration);

            $style = [
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => self::COLOR_BORDER],
                    ],
                ],
            ];

            if ($isAlt) {
                $style['fill'] = [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => self::COLOR_ROW_ALT],
                ];
            }

            $sheet->getStyle("A{$row}:E{$row}")->applyFromArray($style);

            // Name left-aligned, dates centred
            $sheet->getStyle("A{$row}")->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_LEFT);
            $sheet->getStyle("B{$row}:E{$row}")->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->getRowDimension($row)->setRowHeight(20);
            $row++;
        }

        // Empty-state row
        if ($reservations->isEmpty()) {
            $sheet->mergeCells("A{$row}:E{$row}");
            $sheet->setCellValue("A{$row}", 'Aucun visiteur déclaré pour cette période.');
            $sheet->getStyle("A{$row}")->applyFromArray([
                'font' => ['italic' => true, 'color' => ['argb' => 'FF888888']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => self::COLOR_BORDER],
                    ],
                ],
            ]);
        }
    }

    // ────────────────────────────────────────────────
    //  Column widths
    // ────────────────────────────────────────────────

    /**
     * Auto-size columns.
     * @param Worksheet $sheet
     * @return void
     */
    private function autoSizeColumns(Worksheet $sheet): void {
        foreach (['A', 'B', 'C', 'D', 'E'] as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        // Enforce minimum widths for readability
        $sheet->getColumnDimension('A')->setWidth(max(30, 30));
        $sheet->getColumnDimension('B')->setWidth(max(18, 18));
        $sheet->getColumnDimension('C')->setWidth(max(18, 18));
        $sheet->getColumnDimension('D')->setWidth(max(18, 18));
        $sheet->getColumnDimension('E')->setWidth(max(18, 18));
    }

    // ────────────────────────────────────────────────
    //  Streaming
    // ────────────────────────────────────────────────

    /**
     * Stream the spreadsheet.
     * @param Spreadsheet $spreadsheet
     * @param string $filename
     * @return StreamedResponse
     */
    private function stream(Spreadsheet $spreadsheet, string $filename): StreamedResponse
    {
        return new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0',
            'Pragma' => 'public',
        ]);
    }
}
