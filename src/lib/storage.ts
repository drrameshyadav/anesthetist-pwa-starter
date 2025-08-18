export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) as T : fallback
    } catch (e) {
      return fallback
    }
  },
  set<T>(key: string, value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  },
  remove(key: string) {
    try { localStorage.removeItem(key) } catch {}
  }
}
