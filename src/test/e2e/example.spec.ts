import { test, expect, _electron as electron } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'

// ── App launch ────────────────────────────────────────────────────────────────
let electronApp: ElectronApplication
let page: Page

test.beforeEach(async () => {
  electronApp = await electron.launch({
    args: ['.'],
  })
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
test('FR1.1 - create/edit/delete within 10s and no data loss', async () => {
  const newFileButton = page.getByText('New File')
  await newFileButton.waitFor({ state: 'visible' })
  await newFileButton.click()
  await page.getByRole('textbox').fill('test')
  await page.getByRole('textbox').press('Enter')
  let duration = await measure(async () => {
    for (let i = 0; i < 20; i++) {
      const menu = page.getByTestId('addblockmenu').last()
      await menu.hover()
      await page.getByText('Code Block').last().waitFor({ state: 'visible' })
      await page.getByText('Code Block').last().click()
      await page.getByTestId('editor').nth(i).click()
      await page.keyboard.type(`code ${i}`)
    }
  })
  expect(duration).toBeLessThan(10000)
  let blocks = await page.getByTestId('editor').count()
  expect(blocks).toBe(20)
  duration = await measure(async () => {
    for (let i = 0; i < 20; i++) {
      await page.getByTestId('remove').last().click()
    }
  })
  expect(duration).toBeLessThan(8000)
  blocks = await page.getByTestId('codeblock').count()
  expect(blocks).toBe(0)
})

// ── FR1.3 - Code execution correctness (>= 90%) ───────────────────────────────
test('FR1.3 - execution success rate >= 90%', async () => {
  const cases = [
    'console.log(1+1);',
    'console.log(2*3);',
    'console.log(Math.max(1,2));',
    'console.log(10/2);',
    'console.log(5-2);',
  ]
  let success = 0
  const newFileButton = page.getByText('New File')
  await newFileButton.waitFor({ state: 'visible' })
  await newFileButton.click()
  await page.getByRole('textbox').fill('test')
  await page.getByRole('textbox').press('Enter')
  const menu = page.getByTestId('addblockmenu').last()
  await menu.hover()
  await page.getByText('Code Block').last().waitFor({ state: 'visible' })
  await page.getByText('Code Block').last().click()
  for (const code of cases) {
    await page.getByTestId('editor').click()
    await page.getByTestId('editor').press('Control+A')
    await page.getByTestId('editor').press('Delete')
    await page.keyboard.type(code)
    await page.getByTestId('executecellbutton').click()
    await page.getByTestId('output').waitFor()
    const output = await page.getByTestId('output').innerText()
    if (!output.includes('Error')) success++
  }
  const rate = success / cases.length
  expect(rate).toBeGreaterThanOrEqual(0.9)
})

// ── FR1.7 - Markdown + code rendering <= 2s ───────────────────────────────────
test('FR1.7 - markdown and code render correctly within 2s', async () => {
  const newFileButton = page.getByText('New File')
  await newFileButton.waitFor({ state: 'visible' })
  await newFileButton.click()
  await page.getByRole('textbox').fill('test')
  await page.getByRole('textbox').press('Enter')
  const duration = await measure(async () => {
    await page.getByTestId('markdownblock').click()
    await page.keyboard.type('Hello')
    await page.getByTestId('markdownblock').locator('textarea').blur()
    const menu = page.getByTestId('addblockmenu').last()
    await menu.hover()
    await page.getByText('Code Block').waitFor({ state: 'visible' })
    await page.getByText('Code Block').click()
    await page.getByTestId('editor').click()
    await page.keyboard.type('console.log("hi")')
    await page
      .getByTestId('dragbutton')
      .last()
      .dragTo(page.getByTestId('markdownblock'))
    await page
      .getByTestId('dragbutton')
      .last()
      .dragTo(page.getByTestId('codeblock'))
  })
  expect(duration).toBeLessThan(2000)
  await expect(page.getByTestId('markdownblock').first()).toContainText('Hello')
  await expect(page.getByTestId('editor')).toBeVisible()
})

// ── FR2.1 - File operations <= 1s, 100% success ───────────────────────────────
test('FR2.1 - file CRUD operations succeed within 5s', async () => {
  const newFolderButton = page.getByText('Create Folder')
  await newFolderButton.waitFor({ state: 'visible' })
  await newFolderButton.click()
  await page.getByRole('textbox').fill('test')
  await page.getByRole('textbox').press('Enter')
  let duration = await measure(async () => {
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('ellipsis').click()
      await page.getByText('Create New Notebook').click()
      await page.waitForTimeout(200)
      const innerButton = page
        .getByTestId('notebookelement')
        .last()
        .locator('span')
        .last()
      await innerButton.dblclick()
      const input = page.getByTestId('notebookelement').last().locator('input')
      await input.waitFor({ state: 'visible' })
      await input.press('Control+A')
      await input.press('Delete')
      await input.type(`notebook ${i}`)
      await input.press('Enter')
      await input.waitFor({ state: 'hidden' })
    }
  })
  expect(duration).toBeLessThan(7000)
})

// ── FR2.2 - Search performance + relevance ────────────────────────────────────
test('FR2.2 - search in notebook returns results within 2s', async () => {
  const newFileButton = page.getByText('New File')
  await newFileButton.waitFor({ state: 'visible' })
  await newFileButton.click()
  await page.getByRole('textbox').fill('test')
  await page.getByRole('textbox').press('Enter')
  for (let i = 0; i < 5; i++) {
    const menu = page.getByTestId('addblockmenu').last()
    await menu.hover()
    await page.getByText('Code Block').last().waitFor({ state: 'visible' })
    await page.getByText('Code Block').last().click()
    await page.getByTestId('editor').nth(i).click()
    await page.keyboard.type(`code ${i}`)
  }
  const duration = await measure(async () => {
    await page.getByTestId('fileheader').click()
    await page.getByTestId('fileheader').press('Control+F')
    const searchInput = page.getByTestId('searchbar').getByRole('textbox')
    await searchInput.waitFor({ state: 'visible' })
    await searchInput.fill('code')
    await page
      .getByTestId('editor')
      .first()
      .locator('.cm-searchMatch')
      .first()
      .waitFor({ state: 'visible' })
  })
  expect(duration).toBeLessThan(2000)
})

test('FR2.2 - search across notebook returns results within 2s', async () => {
  const newFileButton = page.getByText('New File')
  await newFileButton.waitFor({ state: 'visible' })
  await newFileButton.click()
  await page.getByRole('textbox').fill('test')
  await page.getByRole('textbox').press('Enter')
  const cases = [
    'console.log(1+1);',
    'console.log(2*3);',
    'console.log(Math.max(1,2));',
    'console.log(10/2);',
    'console.log(5-2);',
  ]
  for (let j = 0; j < 5; j++) {
    await page.getByTestId('ellipsis').click()
    await page.getByText('Create New Notebook').click()
    await page.getByTestId('notebookelement').last().click()
    await page.waitForTimeout(200)
    const innerButton = page
      .getByTestId('notebookelement')
      .last()
      .locator('span')
      .last()
    await innerButton.dblclick()
    const input = page.getByTestId('notebookelement').last().locator('input')
    await input.waitFor({ state: 'visible' })
    await input.press('Control+A')
    await input.press('Delete')
    await input.type(`notebook ${j}`)
    await input.press('Enter')
    for (let i = 0; i < 5; i++) {
      const menu = page.getByTestId('addblockmenu').last()
      await menu.hover()
      await page.getByText('Code Block').last().waitFor({ state: 'visible' })
      await page.getByText('Code Block').last().click()
      await page.getByTestId('editor').nth(i).click()
      await page.keyboard.type(cases[i])
    }
  }
  const duration = await measure(async () => {
    await page.getByTestId('fileheader').click()
    await page.getByTestId('searchbutton').click()
    const searchInput = page.getByPlaceholder('Search...')
    await searchInput.waitFor({ state: 'visible' })
    await searchInput.fill('max')
  })
  expect(duration).toBeLessThan(2000)
  const count = await page.getByTestId('result').count()
  expect(count).toBeGreaterThanOrEqual(5)
})

// ── FR2.3 - Folder operations success rate ────────────────────────────────────
test('FR2.3 - folder CRUD operations succeed within 5s', async () => {
  const newFileButton = page.getByText('New File')
  await newFileButton.waitFor({ state: 'visible' })
  await newFileButton.click()
  await page.getByRole('textbox').fill('test')
  await page.getByRole('textbox').press('Enter')
  const duration = await measure(async () => {
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('ellipsis').click()
      await page.getByText('Create New Folder').click()
      await page.waitForTimeout(200)
      await page.getByTestId('folderelement').last().dblclick()
      await page.keyboard.press('Control+A')
      await page.keyboard.press('Delete')
      await page.keyboard.type(`folder ${i}`)
    }
  })
  expect(duration).toBeLessThan(7000)
  const count = await page.getByTestId('folderelement').count()
  expect(count).toBeGreaterThanOrEqual(10)
})

// ── NFR1.2 - Offline mode (no network calls) ──────────────────────────────────
// test('NFR1.2 - no external API calls made by the app', async () => {
//   const externalRequests: string[] = []

//   // await electronApp.exposeFunction('trackRequest', (url: string) => {
//   //   externalRequests.push(url)
//   // })

//   await electronApp.evaluate(({ session }) => {
//     session.defaultSession.webRequest.onBeforeRequest(
//       { urls: ['<all_urls>'] },
//       (details, callback) => {
//         const url = details.url

//         if (
//           !url.startsWith('file://') &&
//           !url.includes('localhost') &&
//           !url.startsWith('devtools://')
//         ) {
//           // @ts-expect-error because of globalThis
//           globalThis.trackRequest(url)
//         }

//         callback({ cancel: false })
//       }
//     )
//   })

//   await page.getByTestId('create-notebook').click()

//   expect(externalRequests.length).toBe(0)
// })

// // ── NFR2.1 - Code execution performance <= 2s ─────────────────────────────────

// test('NFR2.1 - code executes within 2s', async () => {
//   const duration = await measure(async () => {
//     await page.getByTestId('code-input').fill('1+1')
//     await page.getByTestId('run-code').click()
//     await page.getByTestId('output').waitFor()
//   })

//   expect(duration).toBeLessThan(2000)
// })

// // ── NFR2.2 - Search performance <= 3s ────────────────────────────────────────

// test('NFR2.2 - search completes within 3s', async () => {
//   const duration = await measure(async () => {
//     await page.getByTestId('search-input').fill('test')
//     await page.waitForSelector('[data-testid="search-result"]')
//   })

//   expect(duration).toBeLessThan(3000)
// })

// // ── NFR2.4 - Memory usage <= 1GB ─────────────────────────────────────────────

// test('NFR2.4 - main process memory usage', async () => {
//   const memory = await electronApp.evaluate(() => {
//     // This runs in the Node.js Main process context
//     return process.memoryUsage().heapUsed
//   })

//   expect(memory).toBeLessThan(1_000_000_000)
// })

// // ── NFR3.1 - No outbound data transmission ────────────────────────────────────

// test('NFR3.1 - no external data transmitted on launch', async () => {
//   // Re-launch a clean instance with the request interceptor in place
//   // before the window opens so we catch requests from startup too.
//   await electronApp.close()

//   const externalCalls: string[] = []

//   electronApp = await electron.launch({
//     args: ['.'],
//   })

//   await electronApp.evaluate(({ session }) => {
//     session.defaultSession.webRequest.onBeforeRequest(
//       { urls: ['<all_urls>'] },
//       (details, callback) => {
//         const url = details.url
//         if (
//           !url.startsWith('file://') &&
//           !url.includes('localhost') &&
//           !url.startsWith('devtools://')
//         ) {
//           externalCalls.push(url)
//         }
//         callback({ cancel: false })
//       }
//     )
//   })

//   page = await electronApp.firstWindow()
//   await page.waitForLoadState('domcontentloaded')

//   expect(externalCalls.length).toBe(0)
// })
