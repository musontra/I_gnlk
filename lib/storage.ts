import AsyncStorage from "@react-native-async-storage/async-storage";

export interface JournalEntry {
  id: string;
  date: string;
  moodIndex: number;
  energyLevel: number;
  smallWin: string;
  notes: string;
  createdAt: number;
}

const ENTRIES_KEY = "iyilik_entries";
const USER_KEY = "iyilik_user";

export async function saveEntry(entry: JournalEntry): Promise<void> {
  const existing = await getEntries();
  existing.unshift(entry);
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(existing));
}

export async function getEntries(): Promise<JournalEntry[]> {
  const data = await AsyncStorage.getItem(ENTRIES_KEY);
  if (!data) return [];
  return JSON.parse(data) as JournalEntry[];
}

export async function getEntryById(id: string): Promise<JournalEntry | null> {
  const entries = await getEntries();
  return entries.find((e) => e.id === id) || null;
}

export async function deleteEntry(id: string): Promise<void> {
  const entries = await getEntries();
  const filtered = entries.filter((e) => e.id !== id);
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(filtered));
}

export async function getTodaysEntry(): Promise<JournalEntry | null> {
  const entries = await getEntries();
  const today = new Date().toISOString().split("T")[0];
  return entries.find((e) => e.date === today) || null;
}

export async function saveUser(username: string): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, username);
}

export async function getUser(): Promise<string | null> {
  return AsyncStorage.getItem(USER_KEY);
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
