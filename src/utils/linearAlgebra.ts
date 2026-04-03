// SPDX-License-Identifier: Apache-2.0
// Pure math utilities — no React dependencies

// ─── Seeded LCG PRNG ────────────────────────────────────────────────────────
function lcg(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 4294967296
  }
}

// Box-Muller transform for normal random numbers
function makeNormalRng(seed: number) {
  const rand = lcg(seed)
  let spare: number | null = null
  return () => {
    if (spare !== null) {
      const v = spare
      spare = null
      return v
    }
    let u, v, s
    do {
      u = rand() * 2 - 1
      v = rand() * 2 - 1
      s = u * u + v * v
    } while (s >= 1 || s === 0)
    const mul = Math.sqrt(-2 * Math.log(s) / s)
    spare = v * mul
    return u * mul
  }
}

// ─── Basic utilities ─────────────────────────────────────────────────────────
export function linspace(start: number, end: number, n: number): number[] {
  if (n <= 1) return [start]
  const step = (end - start) / (n - 1)
  return Array.from({ length: n }, (_, i) => start + i * step)
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

export function mse(yTrue: number[], yPred: number[]): number {
  const n = yTrue.length
  let sum = 0
  for (let i = 0; i < n; i++) sum += (yTrue[i] - yPred[i]) ** 2
  return sum / n
}

export function rSquared(yTrue: number[], yPred: number[]): number {
  const mean = yTrue.reduce((a, b) => a + b, 0) / yTrue.length
  const ssTot = yTrue.reduce((a, y) => a + (y - mean) ** 2, 0)
  const ssRes = yTrue.reduce((a, y, i) => a + (y - yPred[i]) ** 2, 0)
  if (ssTot === 0) return 1
  return 1 - ssRes / ssTot
}

// ─── Data generators ─────────────────────────────────────────────────────────
export function generateLinearData(
  n: number,
  slope: number,
  intercept: number,
  noise: number,
  seed: number
): { x: number; y: number }[] {
  const rng = makeNormalRng(seed)
  return linspace(-3, 3, n).map(x => ({
    x,
    y: slope * x + intercept + rng() * noise,
  }))
}

export function generateClassificationData(
  n: number,
  seed: number
): { x1: number; x2: number; label: number }[] {
  const rng = makeNormalRng(seed)
  const half = Math.floor(n / 2)
  const result: { x1: number; x2: number; label: number }[] = []
  // Class 0: centered at (-1.5, -1.5)
  for (let i = 0; i < half; i++) {
    result.push({ x1: rng() * 0.8 - 1.5, x2: rng() * 0.8 - 1.5, label: 0 })
  }
  // Class 1: centered at (1.5, 1.5)
  for (let i = half; i < n; i++) {
    result.push({ x1: rng() * 0.8 + 1.5, x2: rng() * 0.8 + 1.5, label: 1 })
  }
  return result
}

// ─── OLS fitting ─────────────────────────────────────────────────────────────
export function fitOLS(data: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = data.length
  const sumX = data.reduce((a, d) => a + d.x, 0)
  const sumY = data.reduce((a, d) => a + d.y, 0)
  const sumXY = data.reduce((a, d) => a + d.x * d.y, 0)
  const sumX2 = data.reduce((a, d) => a + d.x * d.x, 0)
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: sumY / n }
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

// ─── Matrix utilities (no external library) ──────────────────────────────────
type Matrix = number[][]

function matMul(A: Matrix, B: Matrix): Matrix {
  const rows = A.length
  const cols = B[0].length
  const inner = B.length
  const C: Matrix = Array.from({ length: rows }, () => Array(cols).fill(0))
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      for (let k = 0; k < inner; k++)
        C[i][j] += A[i][k] * B[k][j]
  return C
}

function matTranspose(A: Matrix): Matrix {
  const rows = A.length
  const cols = A[0].length
  return Array.from({ length: cols }, (_, i) => Array.from({ length: rows }, (_, j) => A[j][i]))
}

// Gaussian elimination to solve Ax = b
function solveLinear(A: Matrix, b: number[]): number[] {
  const n = A.length
  const aug: Matrix = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col
    for (let row = col + 1; row < n; row++)
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]]
    if (Math.abs(aug[col][col]) < 1e-12) continue
    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / aug[col][col]
      for (let j = col; j <= n; j++) aug[row][j] -= factor * aug[col][j]
    }
  }
  // Back substitution
  const x = Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(aug[i][i]) < 1e-12) { x[i] = 0; continue }
    x[i] = aug[i][n]
    for (let j = i + 1; j < n; j++) x[i] -= aug[i][j] * x[j]
    x[i] /= aug[i][i]
  }
  return x
}

// ─── Polynomial fitting (Vandermonde + normal equations) ─────────────────────
export function fitPolynomial(data: { x: number; y: number }[], degree: number): number[] {
  const d = degree + 1
  // Build Vandermonde matrix X (n × d)
  const X: Matrix = data.map(({ x }) =>
    Array.from({ length: d }, (_, p) => Math.pow(x, p))
  )
  const Xt = matTranspose(X)
  const XtX = matMul(Xt, X)
  const Xty = matMul(Xt, data.map(({ y }) => [y]) as Matrix).map(r => r[0])
  // Add tiny ridge for numerical stability
  for (let i = 0; i < d; i++) XtX[i][i] += 1e-8
  return solveLinear(XtX, Xty)
}

export function predictPolynomial(x: number, coeffs: number[]): number {
  return coeffs.reduce((sum, c, p) => sum + c * Math.pow(x, p), 0)
}

// ─── Ridge regularization path (single-feature formula) ──────────────────────
export function ridgePath(
  data: { x: number; y: number }[],
  lambdas: number[]
): number[] {
  const xArr = data.map(d => d.x)
  const yArr = data.map(d => d.y)
  const xTx = xArr.reduce((a, x) => a + x * x, 0)
  const xTy = xArr.reduce((a, x, i) => a + x * yArr[i], 0)
  return lambdas.map(lam => xTy / (xTx + lam))
}
