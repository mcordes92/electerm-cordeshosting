const { Application } = require('spectron')
const electronPath = require('electron')
const {resolve} = require('path')
const delay = require('./common/wait')
const {expect} = require('chai')
const cwd = process.cwd()
const packInfo = require('../../package.json')
const {log} = console

describe('main window', function () {
  this.timeout(100000)

  beforeEach(async function() {
    this.app = new Application({
      path: electronPath,
      webdriverOptions: {
        deprecationWarnings: false
      },
      args: [resolve(cwd, 'work/app')]
    })
    return this.app.start()
  })

  afterEach(function() {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('should open window and buttons works', async function() {
    const { client, browserWindow } = this.app

    await client.waitUntilWindowLoaded()
    await delay(500)

    log('title')
    const title = await browserWindow.getTitle()
    expect(title).includes(packInfo.name)

    log('elements')
    let wrap = await  client.element('#outside-context')
    expect(!!wrap.value).equal(true)
    let tabs = await client.element('.tabs')
    expect(!!tabs.value).equal(true)
    let term = await client.element('.xterm')
    expect(!!term.value).equal(true)

    log('button click')

    log('button:edit')
    await client.click('.btns .anticon-edit')
    let active = await client.element('.ant-modal .ant-tabs-line > .ant-tabs-bar .ant-tabs-tab-active')
    expect(!!active.value).equal(true)

    log('button:close modal')
    await client.execute(function() {
      document.querySelector('.ant-modal .ant-modal-close').click()
    })
    //await client.click('.ant-modal-close')
    await delay(900)
    let isVisible = await client.isVisible('.ant-modal')
    expect(isVisible).equal(false)

    log('button:about')
    await client.click('.btns .anticon-info-circle-o')
    let c = await client.element('.ant-modal.ant-confirm')
    expect(!!c.value).equal(true)

    log('button:close info modal')
    await client.execute(function() {
      document.querySelector('.ant-modal.ant-confirm .ant-confirm-btns button').click()
    })
    await delay(900)
    let isVisible2 = await client.isVisible('.ant-modal.ant-confirm')
    expect(isVisible2).equal(false)

    log('button:add new tab')
    await client.click('.tabs .tabs-add-btn')
    await delay(900)
    let count = await client.elements('.tabs .tab')
    expect(count.value.length).equal(2)
  })

})
