/**
 * init before load components
 */

import React from 'react'
import Main from './main'
import {initFS} from '../../common/fs'

export default class Init extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true
    }
    this.init()
  }

  init = async () => {
    await initFS()
    this.setState({
      loading: false
    })
  }

  render() {
    if (this.state.loading) {
      return (
        <div>loading...</div>
      )
    }
    return <Main />
  }
}
