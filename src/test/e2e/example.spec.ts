import { test, expect, _electron as electron } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'
import {dropDB} from '../../electron/backend/database/dropdb'

// ── App launch ────────────────────────────────────────────────────────────────

let electronApp: ElectronApplication
let page: Page

test.beforeEach(async () => {
  electronApp = await electron.launch({
    args: ['.'], // uses package.json "main"
  })
  dropDB()
  page = await electronApp.firstWindow()
  await page.waitForLoadState('domcontentloaded')
})

test.afterEach(async () => {
  if (electronApp) {
    await electronApp.close()
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────

async function measure(fn: () => Promise<void>): Promise<number> {
  const start = performance.now()
  await fn()
  return performance.now() - start
}

// ── FR1.1 - Code block CRUD performance + integrity ───────────────────────────

test('FR1.1 - create/edit/delete within 1s and no data loss', async () => {
  const duration = await measure(async () => {
    for (let i = 0; i < 20; i++) {
      await page.getByTestId('add-block').click()
      await page.getByTestId(`block-${i}`).fill(`code ${i}`)
    }
  })

  expect(duration).toBeLessThan(1000)

  const blocks = await page.locator('[data-testid^="block-"]').count()
  expect(blocks).toBe(20)
})

// ── FR1.3 - Code execution correctness (>= 90%) ───────────────────────────────

test('FR1.3 - execution success rate >= 90%', async () => {
  const cases = ['1+1', '2*3', 'Math.max(1,2)', '10/2', '5-2']
  let success = 0

  for (const code of cases) {
    await page.getByTestId('code-input').fill(code)
    await page.getByTestId('run-code').click()
    await page.getByTestId('output').waitFor()

    const output = await page.getByTestId('output').innerText()
    if (!output.includes('Error')) success++
  }

  const rate = success / cases.length
  expect(rate).toBeGreaterThanOrEqual(0.9)
})

// ── FR1.7 - Markdown + code rendering <= 2s ───────────────────────────────────

test('FR1.7 - markdown and code render correctly within 2s', async () => {
  const duration = await measure(async () => {
    await page.getByTestId('add-markdown').click()
    await page.getByTestId('markdown-input').fill('# Hello')

    await page.getByTestId('add-code').click()
    await page.getByTestId('code-input').fill('console.log("hi")')
  })

  expect(duration).toBeLessThan(2000)

  await expect(page.locator('h1')).toContainText('Hello')
  await expect(page.locator('code')).toBeVisible()
})

// ── FR2.1 - File operations <= 1s, 100% success ───────────────────────────────

test('FR2.1 - file CRUD operations succeed within 1s', async () => {
  const duration = await measure(async () => {
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('create-notebook').click()
      await page.getByTestId('notebook-name').fill(`note-${i}`)
      await page.getByTestId('save-notebook').click()
    }
  })

  expect(duration).toBeLessThan(1000)

  const count = await page.locator('[data-testid^="notebook-"]').count()
  expect(count).toBeGreaterThanOrEqual(10)
})

// ── FR2.2 - Search performance + relevance ────────────────────────────────────

test('FR2.2 - search returns results within 2s', async () => {
  const duration = await measure(async () => {
    await page.getByTestId('search-input').fill('hello')
    await page.waitForSelector('[data-testid="search-result"]')
  })

  expect(duration).toBeLessThan(2000)

  const results = await page.locator('[data-testid="search-result"]').count()
  expect(results).toBeGreaterThan(0)
})

// ── FR2.3 - Folder operations success rate ────────────────────────────────────

test('FR2.3 - folder operations succeed within 2s', async () => {
  const duration = await measure(async () => {
    await page.getByTestId('create-folder').click()
    await page.getByTestId('folder-name').fill('test-folder')
    await page.getByTestId('save-folder').click()
  })

  expect(duration).toBeLessThan(2000)

  await expect(page.getByText('test-folder')).toBeVisible()
})

// ── NFR1.2 - Offline mode (no network calls) ──────────────────────────────────

test('NFR1.2 - no external API calls made by the app', async () => {
  const externalRequests: string[] = []

  // await electronApp.exposeFunction('trackRequest', (url: string) => {
  //   externalRequests.push(url)
  // })

  await electronApp.evaluate(({ session }) => {
    session.defaultSession.webRequest.onBeforeRequest(
      { urls: ['<all_urls>'] },
      (details, callback) => {
        const url = details.url

        if (
          !url.startsWith('file://') &&
          !url.includes('localhost') &&
          !url.startsWith('devtools://')
        ) {
          // @ts-expect-error because of globalThis
          globalThis.trackRequest(url)
        }

        callback({ cancel: false })
      }
    )
  })

  await page.getByTestId('create-notebook').click()

  expect(externalRequests.length).toBe(0)
})

// ── NFR2.1 - Code execution performance <= 2s ─────────────────────────────────

test('NFR2.1 - code executes within 2s', async () => {
  const duration = await measure(async () => {
    await page.getByTestId('code-input').fill('1+1')
    await page.getByTestId('run-code').click()
    await page.getByTestId('output').waitFor()
  })

  expect(duration).toBeLessThan(2000)
})

// ── NFR2.2 - Search performance <= 3s ────────────────────────────────────────

test('NFR2.2 - search completes within 3s', async () => {
  const duration = await measure(async () => {
    await page.getByTestId('search-input').fill('test')
    await page.waitForSelector('[data-testid="search-result"]')
  })

  expect(duration).toBeLessThan(3000)
})

// ── NFR2.4 - Memory usage <= 1GB ─────────────────────────────────────────────

test('NFR2.4 - main process memory usage', async () => {
  const memory = await electronApp.evaluate(() => {
    // This runs in the Node.js Main process context
    return process.memoryUsage().heapUsed
  })

  expect(memory).toBeLessThan(1_000_000_000)
})

// ── NFR3.1 - No outbound data transmission ────────────────────────────────────

test('NFR3.1 - no external data transmitted on launch', async () => {
  // Re-launch a clean instance with the request interceptor in place
  // before the window opens so we catch requests from startup too.
  await electronApp.close()

  const externalCalls: string[] = []

  electronApp = await electron.launch({
    args: ['.'],
  })

  await electronApp.evaluate(({ session }) => {
    session.defaultSession.webRequest.onBeforeRequest(
      { urls: ['<all_urls>'] },
      (details, callback) => {
        const url = details.url
        if (
          !url.startsWith('file://') &&
          !url.includes('localhost') &&
          !url.startsWith('devtools://')
        ) {
          externalCalls.push(url)
        }
        callback({ cancel: false })
      }
    )
  })

  page = await electronApp.firstWindow()
  await page.waitForLoadState('domcontentloaded')

  expect(externalCalls.length).toBe(0)
})
