/**
 * tranporter
 */
import React from 'react'
import {Progress, Popover} from 'antd'
import Transport from './transport'
import _ from 'lodash'

export default class Transports extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      currentTransport: props.transports[0] || null
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      !_.isEqual(this.props.transports, nextProps.transports)
    ) {
      this.rebuildState(nextProps)
    }
  }

  rebuildState = nextProps => {
    let {transports} = nextProps
    let {currentTransport} = this.state
    let has = _.find(transports, t => t.id === _.get(currentTransport, 'id'))
    if (!has) {
      this.setState({
        currentTransport: transports[0] || null
      })
    } else {
      this.setState({
        currentTransport: has
      })
    }
  }

  renderContent = () => {
    let {transports} = this.props
    let {currentTransport} = this.state
    return (
      <div className="transports-content overscroll-y">
        {
          transports.map((t ,i) => {
            return (
              <Transport
                transport={t}
                key={t.id + 'tr' + i}
                {...this.props}
                index={i}
                currentTransport={currentTransport}
              />
            )
          })
        }
      </div>
    )
  }

  render() {
    let {transports} = this.props
    let {currentTransport} = this.state
    let percent = _.get(currentTransport, 'percent')
    let status = _.get(currentTransport, 'status')
    if (!transports.length) {
      return null
    }
    return (
      <div className="tranports-wrap">
        <Popover
          title="file transfers"
          content={this.renderContent()}
          placement="bottom"
        >
          <Progress
            type="circle"
            className="transport-circle"
            width={40}
            percent={percent}
            status={status}
          />
        </Popover>
      </div>
    )
  }
}
