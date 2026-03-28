type FinanceMonthSnapshot = {
  month: string;
  revenue: number;
  mrr: number;
  arrRunRate: number;
  grossMarginPct: number;
  cogs: number;
  opex: number;
  ebitda: number;
  netIncome: number;
  activeCustomers: number;
  burnProxy: number;
};

type BreakdownItem = {
  readonly item: string;
  readonly value: number;
};

type ExportFinanceMonthPdfInput = {
  selected: FinanceMonthSnapshot;
  cogsBreakdown: ReadonlyArray<BreakdownItem>;
  opexBreakdown: ReadonlyArray<BreakdownItem>;
};

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const INTEGER = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

type AutoTableDoc = {
  lastAutoTable?: {
    finalY?: number;
  };
};

export async function exportFinanceMonthPdf({
  selected,
  cogsBreakdown,
  opexBreakdown,
}: ExportFinanceMonthPdfInput): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const createdAt = new Date().toLocaleString("vi-VN");

  doc.setFontSize(18);
  doc.text("Finance Report - Owner Mode", 40, 44);
  doc.setFontSize(11);
  doc.text(`Month: ${selected.month}`, 40, 66);
  doc.text(`Generated: ${createdAt}`, 40, 82);

  autoTable(doc, {
    startY: 96,
    head: [["KPI", "Value"]],
    body: [
      ["Revenue", VND.format(selected.revenue)],
      ["MRR", VND.format(selected.mrr)],
      ["ARR Run-rate", VND.format(selected.arrRunRate)],
      ["Gross Margin", `${selected.grossMarginPct.toFixed(1)}%`],
      ["COGS", VND.format(selected.cogs)],
      ["OpEx", VND.format(selected.opex)],
      ["EBITDA", VND.format(selected.ebitda)],
      ["Net Income", VND.format(selected.netIncome)],
      ["Active Customers", INTEGER.format(selected.activeCustomers)],
      ["Burn Proxy", VND.format(selected.burnProxy)],
    ],
    headStyles: { fillColor: [3, 105, 161] },
    styles: { fontSize: 9 },
  });

  const cogsRows = cogsBreakdown.map((row) => [row.item, VND.format(row.value)]);
  autoTable(doc, {
    startY: (doc as unknown as AutoTableDoc).lastAutoTable?.finalY
      ? ((doc as unknown as AutoTableDoc).lastAutoTable?.finalY || 0) + 18
      : 320,
    head: [[`COGS Breakdown (${selected.month})`, "Value"]],
    body: cogsRows.length ? cogsRows : [["No data", "-"]],
    headStyles: { fillColor: [14, 116, 144] },
    styles: { fontSize: 8.5 },
  });

  const opexRows = opexBreakdown.map((row) => [row.item, VND.format(row.value)]);
  autoTable(doc, {
    startY: (doc as unknown as AutoTableDoc).lastAutoTable?.finalY
      ? ((doc as unknown as AutoTableDoc).lastAutoTable?.finalY || 0) + 18
      : 500,
    head: [[`OpEx Breakdown (${selected.month})`, "Value"]],
    body: opexRows.length ? opexRows : [["No data", "-"]],
    headStyles: { fillColor: [5, 150, 105] },
    styles: { fontSize: 8.5 },
  });

  doc.save(`finance-report-${selected.month}.pdf`);
}
