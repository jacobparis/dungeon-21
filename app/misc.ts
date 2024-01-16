export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
export function shuffle<T>(arr: Array<T>) {
  const newArr = arr.slice()
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}
