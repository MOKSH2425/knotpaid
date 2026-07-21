import { db } from "./db";

// Bumped only if the shape of the backup JSON itself changes in a way
// that would break an older restore function reading a newer file.
const SCHEMA_VERSION = 1;

type BackupScope = "all" | "group";

type GroupRow = {
  id: string;
  name: string;
  type: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

type MemberRow = {
  id: string;
  groupId: string;
  name: string;
  avatar: string | null;
  createdAt: string;
};

type ExpenseRow = {
  id: string;
  groupId: string;
  title: string;
  description: string | null;
  amount: number;
  paidBy: string;
  splitType: string;
  createdAt: string;
  expenseDate: string;
};

type ExpenseShareRow = {
  id: string;
  expenseId: string;
  memberId: string;
  shareAmount: number;
};

type SettlementRow = {
  id: string;
  groupId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  settledAt: string;
};

export type BackupPayload = {
  app: "KnotPaid";
  schemaVersion: number;
  scope: BackupScope;
  exportedAt: string;
  groups: GroupRow[];
  members: MemberRow[];
  expenses: ExpenseRow[];
  expenseShares: ExpenseShareRow[];
  settlements: SettlementRow[];
};

function freshId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

// ---------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------

// Every group, member, expense, share, and settlement on the device —
// the "phone died, get it all back" backup.
export function buildFullBackup(): BackupPayload {
  return {
    app: "KnotPaid",
    schemaVersion: SCHEMA_VERSION,
    scope: "all",
    exportedAt: new Date().toISOString(),
    groups: db.getAllSync<GroupRow>(`SELECT * FROM groups`),
    members: db.getAllSync<MemberRow>(`SELECT * FROM members`),
    expenses: db.getAllSync<ExpenseRow>(`SELECT * FROM expenses`),
    expenseShares: db.getAllSync<ExpenseShareRow>(
      `SELECT * FROM expense_shares`,
    ),
    settlements: db.getAllSync<SettlementRow>(`SELECT * FROM settlements`),
  };
}

// Just one group and everything under it — meant for sharing/transferring
// a single group rather than a full-device backup.
export function buildGroupBackup(groupId: string): BackupPayload {
  const expenses = db.getAllSync<ExpenseRow>(
    `SELECT * FROM expenses WHERE groupId=?`,
    [groupId],
  );

  const expenseIds = expenses.map((e) => e.id);
  const placeholders = expenseIds.map(() => "?").join(",");

  const expenseShares = expenseIds.length
    ? db.getAllSync<ExpenseShareRow>(
        `SELECT * FROM expense_shares WHERE expenseId IN (${placeholders})`,
        expenseIds,
      )
    : [];

  return {
    app: "KnotPaid",
    schemaVersion: SCHEMA_VERSION,
    scope: "group",
    exportedAt: new Date().toISOString(),
    groups: db.getAllSync<GroupRow>(`SELECT * FROM groups WHERE id=?`, [
      groupId,
    ]),
    members: db.getAllSync<MemberRow>(
      `SELECT * FROM members WHERE groupId=?`,
      [groupId],
    ),
    expenses,
    expenseShares,
    settlements: db.getAllSync<SettlementRow>(
      `SELECT * FROM settlements WHERE groupId=?`,
      [groupId],
    ),
  };
}

// ---------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------

export function validateBackupPayload(payload: unknown): BackupPayload {
  const data = payload as Partial<BackupPayload> | null;

  if (
    !data ||
    data.app !== "KnotPaid" ||
    !Array.isArray(data.groups) ||
    !Array.isArray(data.members) ||
    !Array.isArray(data.expenses) ||
    !Array.isArray(data.expenseShares) ||
    !Array.isArray(data.settlements)
  ) {
    throw new Error("This doesn't look like a valid KnotPaid backup file.");
  }

  if (
    typeof data.schemaVersion !== "number" ||
    data.schemaVersion > SCHEMA_VERSION
  ) {
    throw new Error(
      "This backup was made with a newer version of KnotPaid and can't be restored here.",
    );
  }

  return data as BackupPayload;
}

// ---------------------------------------------------------------------
// Restore: whole app (destructive — replaces everything on the device)
// ---------------------------------------------------------------------

export function restoreFullBackup(payload: unknown) {
  const data = validateBackupPayload(payload);

  db.withTransactionSync(() => {
    db.runSync(`DELETE FROM expense_shares`);
    db.runSync(`DELETE FROM settlements`);
    db.runSync(`DELETE FROM expenses`);
    db.runSync(`DELETE FROM members`);
    db.runSync(`DELETE FROM groups`);

    data.groups.forEach((g) => {
      db.runSync(
        `INSERT INTO groups (id, name, type, currency, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
        [g.id, g.name, g.type, g.currency, g.createdAt, g.updatedAt],
      );
    });

    data.members.forEach((m) => {
      db.runSync(
        `INSERT INTO members (id, groupId, name, avatar, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [m.id, m.groupId, m.name, m.avatar ?? "", m.createdAt],
      );
    });

    data.expenses.forEach((e) => {
      db.runSync(
        `INSERT INTO expenses (id, groupId, title, description, amount, paidBy, splitType, createdAt, expenseDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          e.id,
          e.groupId,
          e.title,
          e.description ?? "",
          e.amount,
          e.paidBy,
          e.splitType,
          e.createdAt,
          e.expenseDate,
        ],
      );
    });

    data.expenseShares.forEach((s) => {
      db.runSync(
        `INSERT INTO expense_shares (id, expenseId, memberId, shareAmount) VALUES (?, ?, ?, ?)`,
        [s.id, s.expenseId, s.memberId, s.shareAmount],
      );
    });

    data.settlements.forEach((s) => {
      db.runSync(
        `INSERT INTO settlements (id, groupId, fromMemberId, toMemberId, amount, settledAt) VALUES (?, ?, ?, ?, ?, ?)`,
        [s.id, s.groupId, s.fromMemberId, s.toMemberId, s.amount, s.settledAt],
      );
    });
  });
}

// ---------------------------------------------------------------------
// Restore: single group (non-destructive — imported as a new group)
// ---------------------------------------------------------------------

// Every row gets a fresh id so this can never collide with data already
// on the device, with old-id -> new-id maps to rebuild the relationships
// (member -> group, expense -> member, share -> expense) correctly.
// Returns the new group's id so the caller can navigate straight to it.
export function restoreGroupBackup(payload: unknown): string {
  const data = validateBackupPayload(payload);

  if (data.groups.length === 0) {
    throw new Error("This backup doesn't contain a group to import.");
  }

  const groupIdMap = new Map<string, string>();
  const memberIdMap = new Map<string, string>();
  const expenseIdMap = new Map<string, string>();

  db.withTransactionSync(() => {
    data.groups.forEach((g) => {
      const newId = freshId();
      groupIdMap.set(g.id, newId);

      db.runSync(
        `INSERT INTO groups (id, name, type, currency, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          newId,
          `${g.name} (Imported)`,
          g.type,
          g.currency,
          new Date().toISOString(),
          new Date().toISOString(),
        ],
      );
    });

    data.members.forEach((m) => {
      const newGroupId = groupIdMap.get(m.groupId);
      if (!newGroupId) return;

      const newId = freshId();
      memberIdMap.set(m.id, newId);

      db.runSync(
        `INSERT INTO members (id, groupId, name, avatar, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [newId, newGroupId, m.name, m.avatar ?? "", m.createdAt],
      );
    });

    data.expenses.forEach((e) => {
      const newGroupId = groupIdMap.get(e.groupId);
      const newPaidBy = memberIdMap.get(e.paidBy);
      if (!newGroupId || !newPaidBy) return;

      const newId = freshId();
      expenseIdMap.set(e.id, newId);

      db.runSync(
        `INSERT INTO expenses (id, groupId, title, description, amount, paidBy, splitType, createdAt, expenseDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          newGroupId,
          e.title,
          e.description ?? "",
          e.amount,
          newPaidBy,
          e.splitType,
          e.createdAt,
          e.expenseDate,
        ],
      );
    });

    data.expenseShares.forEach((s) => {
      const newExpenseId = expenseIdMap.get(s.expenseId);
      const newMemberId = memberIdMap.get(s.memberId);
      if (!newExpenseId || !newMemberId) return;

      db.runSync(
        `INSERT INTO expense_shares (id, expenseId, memberId, shareAmount) VALUES (?, ?, ?, ?)`,
        [freshId(), newExpenseId, newMemberId, s.shareAmount],
      );
    });

    data.settlements.forEach((s) => {
      const newGroupId = groupIdMap.get(s.groupId);
      const newFrom = memberIdMap.get(s.fromMemberId);
      const newTo = memberIdMap.get(s.toMemberId);
      if (!newGroupId || !newFrom || !newTo) return;

      db.runSync(
        `INSERT INTO settlements (id, groupId, fromMemberId, toMemberId, amount, settledAt) VALUES (?, ?, ?, ?, ?, ?)`,
        [freshId(), newGroupId, newFrom, newTo, s.amount, s.settledAt],
      );
    });
  });

  return groupIdMap.get(data.groups[0].id)!;
}
