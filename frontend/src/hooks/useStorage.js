export function useLocalStorage() {
  const get = (key) => {
    try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
  }
  const set = (key, value) => localStorage.setItem(key, JSON.stringify(value))
  const remove = (key) => localStorage.removeItem(key)
  return { get, set, remove }
}

export function useSessionStorage() {
  const get = (key) => {
    try { return JSON.parse(sessionStorage.getItem(key)) } catch { return null }
  }
  const set = (key, value) => sessionStorage.setItem(key, JSON.stringify(value))
  return { get, set }
}
