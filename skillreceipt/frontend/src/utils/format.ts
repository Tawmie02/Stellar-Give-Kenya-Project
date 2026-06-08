export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatTimestamp(date = new Date()): string {
  return date.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}
