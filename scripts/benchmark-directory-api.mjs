const endpoint = process.env.BENCHMARK_URL || 'http://localhost:3016/api/public/shops?page=1'
const totalRequests = Number.parseInt(process.env.BENCHMARK_TOTAL_REQUESTS || '200', 10)
const concurrency = Number.parseInt(process.env.BENCHMARK_CONCURRENCY || '20', 10)

if (!Number.isInteger(totalRequests) || totalRequests < 1 || !Number.isInteger(concurrency) || concurrency < 1 || concurrency > totalRequests) {
  throw new Error('BENCHMARK_TOTAL_REQUESTS and BENCHMARK_CONCURRENCY must be positive integers, with concurrency no greater than total requests.')
}
const durations = []
let cursor = 0

async function worker() {
  while (cursor < totalRequests) {
    const index = cursor++
    const startedAt = performance.now()
    const response = await fetch(`${endpoint}&q=shop-${index % 10}`)
    if (!response.ok) throw new Error(`Request ${index} failed with ${response.status}`)
    await response.arrayBuffer()
    durations.push(performance.now() - startedAt)
  }
}

await Promise.all(Array.from({ length: concurrency }, worker))
const ordered = durations.sort((a, b) => a - b)
const percentile = (ratio) => ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * ratio) - 1)]
console.log(JSON.stringify({ endpoint, totalRequests, concurrency, p50Ms: Number(percentile(.5).toFixed(2)), p95Ms: Number(percentile(.95).toFixed(2)), maxMs: Number(Math.max(...ordered).toFixed(2)) }))
