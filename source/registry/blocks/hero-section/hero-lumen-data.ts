/** Sample data for Lumen, an invented revenue analytics product. Replace it with your own product's numbers. */

export type LumenRange = "7d" | "30d" | "90d";

export const lumenRanges: { value: LumenRange; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

export interface LumenKpi {
  id: "revenue" | "conversion" | "sessions";
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Change against the period before, as shown in the badge. */
  change: string;
  /** Whether the change is good news. */
  up: boolean;
}

export interface LumenPeriod {
  /** What the change is compared with. */
  against: string;
  /** Line under the chart title. */
  caption: string;
  kpis: LumenKpi[];
  /** Revenue through the period, as a share of the top grid line (0 to 100). Every period has the same number of points, so the line morphs between them. */
  line: number[];
  /** The period before, on the same scale. */
  previous: number[];
  /** Value axis labels from the top grid line down. */
  yTicks: string[];
  /** Date axis labels, spread evenly from the first point to the last. */
  xTicks: string[];
}

export const lumenPeriods: Record<LumenRange, LumenPeriod> = {
  "7d": {
    against: "vs last week",
    caption: "Daily, last 7 days",
    kpis: [
      { id: "revenue", label: "Revenue", value: 11_840, prefix: "$", change: "4.2%", up: true },
      { id: "conversion", label: "Conversion", value: 4.1, suffix: "%", decimals: 1, change: "0.3 pts", up: true },
      { id: "sessions", label: "Sessions", value: 2_960, change: "2.3%", up: false },
    ],
    line: [38, 44, 41, 36, 47, 55, 52, 49, 58, 66, 61, 57, 68, 74, 70, 79],
    previous: [34, 37, 40, 35, 39, 46, 48, 44, 47, 54, 52, 50, 55, 60, 58, 63],
    yTicks: ["$2.4k", "$1.8k", "$1.2k", "$600"],
    xTicks: ["Sep 18", "Sep 20", "Sep 22", "Sep 24"],
  },
  "30d": {
    against: "vs last month",
    caption: "Daily, last 30 days",
    kpis: [
      { id: "revenue", label: "Revenue", value: 48_290, prefix: "$", change: "12.4%", up: true },
      { id: "conversion", label: "Conversion", value: 3.8, suffix: "%", decimals: 1, change: "0.6 pts", up: true },
      { id: "sessions", label: "Sessions", value: 12_480, change: "8.1%", up: true },
    ],
    line: [22, 26, 24, 31, 36, 33, 41, 46, 43, 52, 58, 55, 64, 71, 76, 84],
    previous: [18, 20, 23, 22, 27, 30, 29, 34, 37, 36, 41, 45, 44, 49, 52, 56],
    yTicks: ["$2k", "$1.5k", "$1k", "$500"],
    xTicks: ["Aug 26", "Sep 5", "Sep 15", "Sep 24"],
  },
  "90d": {
    against: "vs last quarter",
    caption: "Weekly, last 90 days",
    kpis: [
      { id: "revenue", label: "Revenue", value: 139_650, prefix: "$", change: "21.7%", up: true },
      { id: "conversion", label: "Conversion", value: 3.5, suffix: "%", decimals: 1, change: "0.4 pts", up: true },
      { id: "sessions", label: "Sessions", value: 37_120, change: "15.2%", up: true },
    ],
    line: [14, 17, 21, 20, 26, 31, 37, 35, 43, 50, 54, 61, 66, 73, 81, 90],
    previous: [12, 14, 15, 19, 21, 24, 27, 31, 33, 38, 41, 45, 50, 53, 58, 62],
    yTicks: ["$16k", "$12k", "$8k", "$4k"],
    xTicks: ["Jun 27", "Jul 27", "Aug 26", "Sep 24"],
  },
};

export interface LumenTransaction {
  customer: string;
  plan: string;
  amount: string;
  status: "Paid" | "Pending" | "Refunded";
  /** Token behind the customer's initial, such as `--tone-teal`. */
  tone: string;
}

/** Invented customers. */
export const lumenTransactions: LumenTransaction[] = [
  { customer: "Brightlane", plan: "Scale, yearly", amount: "$1,240.00", status: "Paid", tone: "--tone-teal" },
  { customer: "Kestrel Labs", plan: "Team, monthly", amount: "$320.00", status: "Paid", tone: "--tone-violet" },
  { customer: "Nordvik", plan: "Enterprise", amount: "$4,800.00", status: "Pending", tone: "--tone-amber" },
  { customer: "Tessera", plan: "Team, monthly", amount: "$96.00", status: "Refunded", tone: "--tone-sky" },
];

/** Payments the floating toast announces, one after another. */
export const lumenPayments = [
  { amount: "$1,240.00", from: "Brightlane" },
  { amount: "$320.00", from: "Kestrel Labs" },
  { amount: "$2,150.00", from: "Oakhurst" },
];

/** Progress toward the month's revenue goal. */
export const lumenGoal = { share: .82, reached: "$41k", target: "$50k" };

/** People behind the social proof row. Initials only, each on its own tone. */
export const lumenFaces = [
  { name: "Emma Collins", tone: "--tone-teal" },
  { name: "Marcus Johnson", tone: "--tone-violet" },
  { name: "Sofia Ramirez", tone: "--tone-amber" },
  { name: "Daniel Kim", tone: "--tone-sky" },
  { name: "Ava Mitchell", tone: "--tone-rose" },
];

/** Invented customer names for the wordmark row, each with a plain geometric mark. */
export const lumenCustomers: { name: string; shape: "circle" | "square" | "triangle" | "diamond" | "rings" | "bars" }[] = [
  { name: "Brightlane", shape: "bars" },
  { name: "Kestrel", shape: "triangle" },
  { name: "Nordvik", shape: "circle" },
  { name: "Tessera", shape: "square" },
  { name: "Oakhurst", shape: "rings" },
  { name: "Quillon", shape: "diamond" },
];
