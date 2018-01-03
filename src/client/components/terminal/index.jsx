
import React from 'react'
import fetch from '../../common/fetch'
import {generate} from 'shortid'
import _ from 'lodash'
import {Spin, Icon} from 'antd'
import {statusMap} from '../../common/constants'
import './terminal.styl'
import {contextMenuHeight, contextMenuPaddingTop} from '../../common/constants'
import {readClipboard, copy} from '../../common/clipboard'

const {Terminal, getGlobal} = window
let config = getGlobal('_config')
const computePos = (e, height) => {
  let {clientX, clientY} = e
  let res = {
    left: clientX,
    top: clientY
  }
  if (window.innerHeight < res.top + height + 10) {
    res.top = res.top - height
  }
  return res
}

export default class Term extends React.Component {

  constructor(props) {
    super()
    this.state = {
      id: props.id || 'id' + generate(),
      loading: false
    }
  }

  componentDidMount() {
    this.initTerminal()
    this.initEvt()
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.height !== this.props.height ||
      prevProps.width !== this.props.width
    ) {
      this.onResize()
    }
  }

  componentWillUnmount() {
    Object.keys(this.timers).forEach(k => {
      clearTimeout(this.timers[k])
    })
    clearTimeout(this.timers)
    this.term.destroy()
  }

  timers = {}

  initEvt = () => {
    let {id} = this.state
    let dom = document.getElementById(id)
    this.dom = dom
    dom.addEventListener('contextmenu', this.onContextMenu)
  }

  onContextMenu = e => {
    e.preventDefault()
    if (this.state.loading) {
      return
    }
    let content = this.renderContext()
    let height = content.props.children.filter(_.identity)
      .length * contextMenuHeight + contextMenuPaddingTop * 2
    this.props.openContextMenu({
      content,
      pos: computePos(e, height)
    })
  }

  onCopy = () => {
    let selected = this.term.getSelection()
    copy(selected)
    this.props.closeContextMenu()
  }

  onSelectAll = () => {
    this.term.selectAll()
    this.props.closeContextMenu()
  }

  onClear = () => {
    this.term.clear()
    this.props.closeContextMenu()
  }

  onPaste = () => {
    let selected = readClipboard()
    this.term._sendData(selected)
    this.props.closeContextMenu()
  }

  renderContext = () => {
    let cls = 'pd2x pd1y context-item pointer'
    let hasSlected = this.term.hasSelection()
    let clsCopy = cls +
      (hasSlected ? '' : ' disabled')
    let copyed = readClipboard()
    let clsPaste = cls +
      (copyed ? '' : ' disabled')
    return (
      <div>
        <div
          className={clsCopy}
          onClick={hasSlected ? this.onCopy : _.noop}
        >
          <Icon type="copy" /> copy
        </div>
        <div
          className={clsPaste}
          onClick={copyed ? this.onPaste : _.noop}
        >
          <Icon type="switcher" /> paste
        </div>
        <div
          className={cls}
          onClick={this.onClear}
        >
          <Icon type="reload" /> clear
        </div>
        <div
          className={cls}
          onClick={this.onSelectAll}
        >
          <Icon type="select" /> select all
        </div>
      </div>
    )
  }

  initTerminal = async () => {
    let {id} = this.state
    let term = new Terminal()
    term.open(document.getElementById(id), true)
    await this.remoteInit(term)
    term.focus()
    term.fit()
    this.term = term
  }

  count = 0

  setStatus = status => {
    let id = _.get(this.props, 'tab.id')
    this.props.editTab(id, {
      status
    })
  }

  remoteInit = async (term) => {
    this.setState({
      loading: true
    })
    let {cols, rows} = term
    let {host, port} = config
    let wsUrl
    let url = `http://${host}:${port}/terminals`
    let {tab = {}} = this.props
    let pid = await fetch.post(url, {
      cols,
      rows,
      mode: 'VINTR',
      ...tab,
      type: tab.host ? 'remote' : 'local'
    })
    this.setState({
      loading: false
    })
    if (!pid) {
      this.setStatus(statusMap.error)
      return
    }
    this.setStatus(statusMap.success)
    term.pid = pid
    this.pid = pid
    wsUrl = `ws://${host}:${port}/terminals/${pid}`
    let socket = new WebSocket(wsUrl)
    socket.onclose = this.oncloseSocket
    socket.onerror = this.onerrorSocket
    socket.onopen = () => {
      term.attach(socket)
      term._initialized = true
    }
    this.socket = socket
    term.on('resize', this.onResizeTerminal)
  }

  onResize = () => {
    let cid = _.get(this.props, 'currentTabId')
    let tid = _.get(this.props, 'tab.id')
    if (cid === tid && this.term) {
      let {cols, rows} = this.term.proposeGeometry()
      this.term.resize(cols, rows)
    }
  }

  onerrorSocket = err => {
    this.setStatus(statusMap.error)
    console.log(err.stack)
  }

  oncloseSocket = () => {
    console.log('socket closed, pid:', this.pid)
  }

  onResizeTerminal = size => {
    let {cols, rows} = size
    let {host, port} = config
    let {pid} = this
    let url = `http://${host}:${port}/terminals/${pid}/size?cols=${cols}&rows=${rows}`
    fetch.post(url)
  }

  render() {
    let {id, loading} = this.state
    let {height} = this.props
    return (
      <Spin spinning={loading} wrapperClassName="loading-wrapper">
        <div id={id} style={{height}} className="bg-black" />
      </Spin>
    )
  }

}
