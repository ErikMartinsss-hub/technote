import type { Order, TradeInProtocol } from "@/lib/types";

const ORDERS_KEY = "technote:orders";
const TRADEINS_KEY = "technote:tradeins";

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Armazenamento indisponível: a aplicação continua funcionando em memória.
  }
}

export function getOrders() {
  return readList<Order>(ORDERS_KEY);
}

export function saveOrder(order: Order) {
  const orders = getOrders();
  writeList(ORDERS_KEY, [order, ...orders.filter((item) => item.id !== order.id)]);
}

export function updateOrderStatus(id: string, status: Order["status"]) {
  const orders = getOrders().map((order) =>
    order.id === id ? { ...order, status } : order,
  );
  writeList(ORDERS_KEY, orders);
}

export function getTradeIns() {
  return readList<TradeInProtocol>(TRADEINS_KEY);
}

export function saveTradeIn(protocol: TradeInProtocol) {
  const tradeIns = getTradeIns();
  writeList(
    TRADEINS_KEY,
    [protocol, ...tradeIns.filter((item) => item.protocol !== protocol.protocol)],
  );
}

export function updateTradeInStatus(
  protocol: string,
  status: TradeInProtocol["status"],
) {
  const tradeIns = getTradeIns().map((item) =>
    item.protocol === protocol ? { ...item, status } : item,
  );
  writeList(TRADEINS_KEY, tradeIns);
}
