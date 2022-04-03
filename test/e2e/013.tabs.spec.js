
const { _electron: electron } = require('playwright')
const {
  test: it
} = require('@playwright/test')
const { describe } = it
it.setTimeout(100000)
const delay = require('./common/wait')
const { expect } = require('chai')
const appOptions = require('./common/app-options')
const extendClient = require('./common/client-extend')
const log = require('./common/log')

describe('tabs', function () {
  it('double click to duplicate tab button works', async function () {
    const electronApp = await electron.launch(appOptions)
    const client = await electronApp.firstWindow()
    extendClient(client, electronApp)
    await delay(4500)
    const tabsLenBefore = await client.countElem('.tabs .tab')
    log('double click tab')
    await client.doubleClick('.tab')
    await delay(1500)
    const tabs0 = await client.countElem('.tabs .tab')
    expect(tabs0).equal(tabsLenBefore + 1)
    const wraps = await client.countElem('.ui-outer > div')
    expect(wraps).equal(tabsLenBefore + 1)
    await delay(500)
    log('click add tab icon')
    await client.click('.tabs .tabs-add-btn')
    await delay(1500)
    const tabs1 = await client.countElem('.tabs .tab')
    expect(tabs1).equal(tabsLenBefore + 2)
  })
})
