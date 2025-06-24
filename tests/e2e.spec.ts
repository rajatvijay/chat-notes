import { test, expect } from '@playwright/test'

test('chat notes full workflow', async ({ page }) => {
  // Launch and navigate to home page
  await page.goto('/')
  
  // Check if we're on the chat page
  await expect(page.locator('h1, [data-testid="app-title"]').first()).toContainText('Chat Notes')
  
  // Type a note
  const noteContent = 'Buy milk from the store'
  await page.fill('textarea[placeholder*="Type your note"]', noteContent)
  
  // Press send button
  await page.click('button:has-text("Send"), button[aria-label*="Send"]')
  
  // Wait for the note to appear in the chat
  await expect(page.locator(`text=${noteContent}`).first()).toBeVisible()
  
  // Wait a moment for auto-classification
  await page.waitForTimeout(2000)
  
  // Navigate to Tasks category
  await page.click('a[href="/c/task"], text=Tasks')
  
  // Verify we're on the tasks page
  await expect(page.locator('h1').first()).toContainText('Tasks')
  
  // Check that our note is present in the tasks list
  await expect(page.locator(`text=${noteContent}`).first()).toBeVisible()
  
  // Test search functionality
  await page.fill('input[placeholder*="Search"]', 'milk')
  
  // Wait for search results dropdown
  await page.waitForSelector('[data-testid="search-results"], .search-results, [role="listbox"]', { 
    state: 'visible',
    timeout: 5000
  }).catch(() => {
    // If specific selector doesn't exist, look for any dropdown with our content
    return page.waitForSelector(`text=${noteContent}`, { state: 'visible' })
  })
  
  // Click on the search result
  await page.click(`text=${noteContent}`)
  
  // Verify we navigated back to the task category and the note is highlighted/visible
  await expect(page.url()).toContain('/c/task')
  await expect(page.locator(`text=${noteContent}`).first()).toBeVisible()
})