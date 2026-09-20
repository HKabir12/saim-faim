export type Kind = "cash" | "gift";

export type Gift = {
  id: number;
  serial: number;
  name: string;
  village: string;
  kind: Kind;
  amount: number | null;
  giftItem: string | null;
};

export type Stats = {
  total: number;
  cashCount: number;
  giftCount: number;
  totalAmount: number;
};

export type ListResponse = {
  rows: Gift[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: Stats;
};
