import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// Static brand colors for the exported document — deliberately NOT tied
// to the app's live light/dark theme. A PDF is meant to be printed or
// read outside the app, so it always renders on the light "earthy"
// palette regardless of what theme you're using on-device.
const BrandGreen = "#465D4F";
const BrandBrown = "#3C2A1C";

type ExportMember = { id: string; name: string };
type ExportExpense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  expenseDate: string;
};
type ExportSettlement = { from: string; to: string; amount: number };
type ExportPayment = {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  settledAt: string;
};

type ExportGroupData = {
  groupName: string;
  groupType: string;
  members: ExportMember[];
  expenses: ExportExpense[];
  balances: Record<string, number>;
  settlements: ExportSettlement[];
  // Optional: recorded (actually-happened) payments, distinct from the
  // `settlements` list above which is just the live suggested payoff.
  paymentHistory?: ExportPayment[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} · ${timePart}`;
}

function buildHtml(data: ExportGroupData) {
  const memberName = (id: string) =>
    data.members.find((m) => m.id === id)?.name ?? "Unknown";

  const totalAmount = data.expenses.reduce((sum, e) => sum + e.amount, 0);

  const expenseRows = data.expenses
    .map(
      (expense, index) => `
        <tr style="background:${index % 2 === 0 ? "#FFFFFF" : "#F7F2E8"};">
          <td>${escapeHtml(formatDateTime(expense.expenseDate))}</td>
          <td>${escapeHtml(expense.title)}</td>
          <td>${escapeHtml(memberName(expense.paidBy))}</td>
          <td style="text-align:right; font-weight:700;">₹${expense.amount.toFixed(2)}</td>
        </tr>
      `,
    )
    .join("");

  const balanceRows = data.members
    .map((member) => {
      const balance = data.balances[member.id] ?? 0;
      const isPositive = balance >= 0;
      const color = isPositive ? "#3B8C63" : "#C94E4E";
      const label = isPositive
        ? `Gets ₹${balance.toFixed(2)}`
        : `Owes ₹${Math.abs(balance).toFixed(2)}`;

      return `
        <tr>
          <td>${escapeHtml(member.name)}</td>
          <td style="text-align:right; font-weight:700; color:${color};">${label}</td>
        </tr>
      `;
    })
    .join("");

  const settlementsHtml = data.settlements.length
    ? data.settlements
        .map(
          (item) => `
            <div class="settlement-row">
              💸 <strong>${escapeHtml(memberName(item.from))}</strong> pays
              <strong>${escapeHtml(memberName(item.to))}</strong>
              <span style="float:right; color:#3B8C63; font-weight:700;">₹${item.amount.toFixed(2)}</span>
            </div>
          `,
        )
        .join("")
    : `<p style="color:#7A746C;">🎉 Everyone is settled.</p>`;

  const paymentHistoryHtml = data.paymentHistory?.length
    ? `
      <h2>Payment History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>From</th>
            <th>To</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.paymentHistory
            .map(
              (payment, index) => `
                <tr style="background:${index % 2 === 0 ? "#FFFFFF" : "#F7F2E8"};">
                  <td>${escapeHtml(formatDateTime(payment.settledAt))}</td>
                  <td>${escapeHtml(memberName(payment.fromMemberId))}</td>
                  <td>${escapeHtml(memberName(payment.toMemberId))}</td>
                  <td style="text-align:right; font-weight:700; color:#3B8C63;">₹${payment.amount.toFixed(2)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    `
    : "";

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, Helvetica, Arial, sans-serif;
            color: #2D2118;
            padding: 32px;
            background: #FDF9EC;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid ${BrandGreen};
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand {
            font-size: 20px;
            font-weight: 800;
            color: ${BrandBrown};
          }
          .group-name {
            font-size: 28px;
            font-weight: 800;
            margin-top: 4px;
          }
          .meta {
            text-align: right;
            color: #7A746C;
            font-size: 12px;
            line-height: 1.6;
          }
          .summary {
            background: #FFFFFF;
            border: 1px solid #E6DDCF;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
          }
          .summary-label {
            color: #7A746C;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .summary-amount {
            font-size: 26px;
            font-weight: 800;
            color: ${BrandGreen};
            margin-top: 4px;
          }
          h2 {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: ${BrandBrown};
            border-bottom: 1px solid #E6DDCF;
            padding-bottom: 6px;
            margin-top: 28px;
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th {
            background: ${BrandGreen};
            color: #FFFFFF;
            text-align: left;
            padding: 8px 10px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #EFE9DC;
          }
          .member-chip {
            display: inline-block;
            background: #F7F2E8;
            border: 1px solid #E6DDCF;
            border-radius: 999px;
            padding: 4px 12px;
            margin: 0 6px 6px 0;
            font-size: 13px;
          }
          .settlement-row {
            padding: 10px 0;
            border-bottom: 1px solid #EFE9DC;
            font-size: 14px;
          }
          .footer {
            margin-top: 36px;
            text-align: center;
            color: #A7A196;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">KnotPaid</div>
            <div class="group-name">${escapeHtml(data.groupName)}</div>
          </div>
          <div class="meta">
            Exported ${escapeHtml(
              new Date().toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            )}<br/>
            ${data.members.length} members • ${data.expenses.length} expenses
          </div>
        </div>

        <div class="summary">
          <div class="summary-label">Total Expenses</div>
          <div class="summary-amount">₹${totalAmount.toFixed(2)}</div>
        </div>

        <h2>Members</h2>
        <div>
          ${data.members
            .map((m) => `<span class="member-chip">${escapeHtml(m.name)}</span>`)
            .join("")}
        </div>

        <h2>Expenses</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Paid By</th>
              <th style="text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${
              expenseRows ||
              `<tr><td colspan="4" style="text-align:center; color:#A7A196; padding:20px;">No expenses yet.</td></tr>`
            }
          </tbody>
        </table>

        <h2>Balances</h2>
        <table>
          <tbody>
            ${balanceRows}
          </tbody>
        </table>

        <h2>Settlements</h2>
        ${settlementsHtml}

        ${paymentHistoryHtml}

        <div class="footer">Generated by KnotPaid</div>
      </body>
    </html>
  `;
}

// Renders the HTML above to a PDF file and opens the native share sheet
// so it can be saved, sent over WhatsApp, emailed, etc. Returns the file
// URI on disk in case the caller wants it for anything else.
export async function exportGroupToPdf(data: ExportGroupData) {
  const html = buildHtml(data);

  // Ask for base64 content directly instead of a file URI — this comes
  // back as plain data over the JS bridge, so nothing ever needs to
  // *read* a file that a different native module (Print) created in its
  // own cache directory. That cross-module read is what failed twice.
  const { base64 } = await Print.printToFileAsync({ html, base64: true });

  if (!base64) {
    throw new Error("PDF generation did not return any file data.");
  }

  const safeGroupName = data.groupName.replace(/[^a-z0-9]/gi, "-");
  const fileName = `KnotPaid-${safeGroupName}-${Date.now()}.pdf`;
  const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

  // expo-file-system writes this file itself, directly into its own
  // document directory — so it's guaranteed readable by expo-sharing
  // afterward, unlike a file created by expo-print.
  await FileSystem.writeAsStringAsync(destinationUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(destinationUri, {
      mimeType: "application/pdf",
      dialogTitle: `${data.groupName} — KnotPaid Export`,
      UTI: "com.adobe.pdf",
    });
  }

  return destinationUri;
}
