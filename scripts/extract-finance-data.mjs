import fs from "node:fs";
import XLSX from "xlsx";

const workbookPath = "src/shared/data/finance/Bang-Finace-new.xlsx";
const outputPath = "src/shared/data/finance/financeWorkbookData.ts";

const wb = XLSX.readFile(workbookPath, { cellDates: false, raw: false });

const toRows = (sheetName) =>
  XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
    header: 1,
    defval: "",
    raw: false,
  });

const parseMoney = (value) => {
  if (value === "" || value === null || value === undefined || value === "-" || value === "–") {
    return 0;
  }
  if (typeof value === "number") return value;
  const normalized = String(value)
    .replace(/₫/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .trim();
  if (!normalized) return 0;
  if (normalized.startsWith("(") && normalized.endsWith(")")) {
    return -Number(normalized.slice(1, -1));
  }
  return Number(normalized) || 0;
};

const normalizeLabel = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const parsePercent = (value) => {
  if (value === "" || value === null || value === undefined || value === "-" || value === "–") {
    return 0;
  }
  if (typeof value === "number") return value;
  const normalized = String(value).replace(/%/g, "").trim();
  if (!normalized) return 0;
  if (normalized.startsWith("(") && normalized.endsWith(")")) {
    return -Number(normalized.slice(1, -1));
  }
  return Number(normalized) || 0;
};

const assumptionsRows = toRows("Assumptions");
const kpiRows = toRows("KPIs");
const pnlRows = toRows("PnL");
const cogsRows = toRows("COGS");
const opexRows = toRows("OpEx");
const valuationRows = toRows("VALUATION");
const fundRows = toRows("FUND");

const findRow = (rows, rowName) => {
  const target = normalizeLabel(rowName);
  return rows.find((r) => normalizeLabel(r[0]) === target) || [];
};

const findHeaderRow = (rows, headerName) =>
  rows.findIndex((r) => normalizeLabel(r[0]) === normalizeLabel(headerName));

const getMonthHeadersFromLineItem = (rows) => {
  const lineItemIdx = findHeaderRow(rows, "Line item");
  if (lineItemIdx < 0) return [];
  return rows[lineItemIdx]
    .slice(2)
    .filter((v) => String(v).includes("-"));
};

const monthHeader = findRow(kpiRows, "Metric").slice(2).filter(Boolean);

const readSeries = (rows, rowName, parser) => {
  const row = findRow(rows, rowName);
  const values = row.slice(2, 2 + monthHeader.length).map(parser);
  return monthHeader.map((month, i) => ({ month, value: values[i] ?? 0 }));
};

const revenueSeries = readSeries(kpiRows, "Revenue", parseMoney);
const mrrSeries = readSeries(kpiRows, "MRR (SaaS only)", parseMoney);
const arrSeries = readSeries(kpiRows, "ARR run-rate (SaaS)", parseMoney);
const grossMarginSeries = readSeries(kpiRows, "Gross margin %", parsePercent);
const ebitdaSeries = readSeries(kpiRows, "EBITDA", parseMoney);
const netIncomeSeries = readSeries(kpiRows, "Net income", parseMoney);
const activeCustomerSeries = readSeries(kpiRows, "Active customers (SaaS)", parseMoney);
const burnSeries = readSeries(kpiRows, "Burn (EBITDA negative)", parseMoney);
const cogsSeries = readSeries(pnlRows, "COGS", parseMoney);
const opexSeries = readSeries(pnlRows, "Total OpEx", parseMoney);

const latestIndex = monthHeader.length - 1;
const latestMonth = monthHeader[latestIndex];

const pricingRows = assumptionsRows.filter((r) =>
  ["FREE ( VND )", "PRO ( VND )", "VIP ( VND )"].includes(String(r[0]).trim()),
);

const generalAssumptions = {
  startDateMonth: String(findRow(assumptionsRows, "Start date (month)")[1] || ""),
  forecastMonths: parseMoney(findRow(assumptionsRows, "Forecast months")[1]),
  currency: String(findRow(assumptionsRows, "Currency")[1] || "VND"),
  revenueModel: String(findRow(assumptionsRows, "Revenue model")[1] || "SaaS"),
  scenario: String(findRow(assumptionsRows, "Scenario")[1] || "Base"),
  taxRate: String(findRow(assumptionsRows, "Corporate income tax rate")[1] || ""),
  benefitsRate: String(findRow(assumptionsRows, "Benefits (%)")[1] || ""),
  employerTaxesRate: String(findRow(assumptionsRows, "Employer taxes (%)")[1] || ""),
  annualRaiseRate: String(findRow(assumptionsRows, "Annual raise (%)")[1] || ""),
};

const pricing = pricingRows.map((r) => ({
  plan: String(r[0]).replace(/\s+\( VND \)\s*/g, "").trim(),
  monthly: parseMoney(r[1]),
  quarterly: parseMoney(r[2]),
  yearly: parseMoney(r[3]),
}));

const fundTable = fundRows
  .slice(1)
  .filter((r) => String(r[0]).trim())
  .map((r) => ({ item: String(r[0]).trim(), value: String(r[1] ?? "").trim() }));

const valuationHeaders = valuationRows[1]?.slice(1, 4) || ["2026", "2027", "2028"];
const valuationMetrics = valuationRows
  .slice(2)
  .filter((r) => String(r[0]).trim())
  .map((r) => ({
    metric: String(r[0]).trim(),
    values: valuationHeaders.map((_, i) => parseMoney(r[i + 1])),
  }));

const monthToIndex = Object.fromEntries(monthHeader.map((m, i) => [m, i]));
const pickByMonth = (series, month) => series[monthToIndex[month] ?? latestIndex]?.value ?? 0;

const cogsBreakdownRows = [
  "Object storage",
  "AI voice /AI chat ( per User )",
  "Messaging (Email / SMS ) per user",
  "Payment processing",
  "Bandwidth & processing  ( per user )",
  "VPS hosting/Cloud Hosting",
  "Security & monitoring",
  "Maintenance",
  "Customer Support",
  "Educational content development ( one-time)",
];

const cogsMonthHeaders = getMonthHeadersFromLineItem(cogsRows);
const cogsBreakdownByMonth = cogsMonthHeaders.map((month, idx) => ({
  month,
  items: cogsBreakdownRows.map((name) => ({
    item: name.trim(),
    value: parseMoney(findRow(cogsRows, name)[idx + 2]),
  })),
}));

const opexBreakdownRows = [
  "Payroll - R&D",
  "Payroll - Sales & Marketing",
  "Payroll - G&A",
  "Total Marketing Expenses",
  "Domain",
  "Hosting & infrastructure",
  "Software subscriptions",
  "Hosting & infrastructure",
  "Office / Co-working rent",
  "Utilities & internet",
  "Legal & accounting",
  "Other G&A",
];

const opexMonthHeaders = getMonthHeadersFromLineItem(opexRows);
const opexBreakdownByMonth = opexMonthHeaders.map((month, idx) => ({
  month,
  items: opexBreakdownRows
    .map((name) => ({
      item: name.trim(),
      value: parseMoney(findRow(opexRows, name)[idx + 2]),
    }))
    .filter((x) => x.value > 0),
}));

const extractMetricRows = (rows, headerName, labelKey = "metric") => {
  const headerIdx = findHeaderRow(rows, headerName);
  if (headerIdx < 0) return [];
  const headers = rows[headerIdx]
    .slice(2)
    .filter((v) => String(v).includes("-"));

  const result = [];
  for (let i = headerIdx + 1; i < rows.length; i += 1) {
    const label = String(rows[i][0] ?? "").trim();
    if (!label) continue;
    const values = rows[i].slice(2, 2 + headers.length);
    const hasAnyData = values.some((v) => String(v ?? "").trim() !== "");
    if (!hasAnyData) continue;
    result.push({
      [labelKey]: label,
      values: values.map((v) => {
        if (String(v).includes("%")) return parsePercent(v);
        return parseMoney(v);
      }),
    });
  }

  return {
    headers,
    rows: result,
  };
};

const pnlMetricTable = extractMetricRows(pnlRows, "Line item", "lineItem");
const kpiMetricTable = extractMetricRows(kpiRows, "Metric", "metric");

const data = {
  sourceFile: "Bang-Finace-new.xlsx",
  sheets: wb.SheetNames,
  sheetCount: wb.SheetNames.length,
  generatedAt: new Date().toISOString(),
  generalAssumptions,
  pricing,
  latestMonth,
  kpiSnapshot: {
    month: latestMonth,
    revenue: pickByMonth(revenueSeries, latestMonth),
    mrr: pickByMonth(mrrSeries, latestMonth),
    arrRunRate: pickByMonth(arrSeries, latestMonth),
    grossMarginPct: pickByMonth(grossMarginSeries, latestMonth),
    ebitda: pickByMonth(ebitdaSeries, latestMonth),
    netIncome: pickByMonth(netIncomeSeries, latestMonth),
    activeCustomers: pickByMonth(activeCustomerSeries, latestMonth),
    burnProxy: pickByMonth(burnSeries, latestMonth),
    cogs: pickByMonth(cogsSeries, latestMonth),
    opex: pickByMonth(opexSeries, latestMonth),
  },
  monthlySeries: monthHeader.map((month, i) => ({
    month,
    revenue: revenueSeries[i]?.value ?? 0,
    mrr: mrrSeries[i]?.value ?? 0,
    arrRunRate: arrSeries[i]?.value ?? 0,
    grossMarginPct: grossMarginSeries[i]?.value ?? 0,
    ebitda: ebitdaSeries[i]?.value ?? 0,
    netIncome: netIncomeSeries[i]?.value ?? 0,
    activeCustomers: activeCustomerSeries[i]?.value ?? 0,
    burnProxy: burnSeries[i]?.value ?? 0,
    cogs: cogsSeries[i]?.value ?? 0,
    opex: opexSeries[i]?.value ?? 0,
  })),
  cogsBreakdownByMonth,
  opexBreakdownByMonth,
  pnlMetricTable,
  kpiMetricTable,
  valuation: {
    years: valuationHeaders,
    metrics: valuationMetrics,
  },
  fundraising: fundTable,
};

const content = `export const financeWorkbookData = ${JSON.stringify(data, null, 2)} as const;\n`;
fs.writeFileSync(outputPath, content, "utf8");
console.log(`Generated ${outputPath}`);
