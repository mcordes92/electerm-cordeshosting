/**
 * setting sync panel，
 */

/**
 * bookmark form
 */
import React from 'react'
import {
  Form, Button, Input,
  Tooltip, Icon,
  Switch
} from 'antd'
import { validateFieldsAndScroll } from '../../common/dec-validate-and-scroll'
import { formItemLayout, tailFormItemLayout } from '../../common/form-layout'
import InputAutoFocus from '../common/input-auto-focus'
import Link from '../common/external-link'

const FormItem = Form.Item
const { prefix } = window
const e = prefix('form')
const ss = prefix('settingSync')

export class SyncForm extends React.PureComponent {
  state = {
    submitting: false,
    syncing: false
  }

  disabled = () => {
    const {
      gistId,
      githubAccessToken
    } = this.props.formData
    return !!gistId && !!githubAccessToken
  }

  submit = async () => {
    const res = await this.validateFieldsAndScroll()
    if (!res) {
      return
    }
    const gist = await this.props.store.getGist(res)
    if (!gist) {
      return
    }
    if (this.isNew(gist)) {
      await this.upload(res)
    }
    res.lastSyncTime = Date.now()
    this.props.doSubmit(res)
  }

  doSubmit = res => {
    this.props.store.updateSyncSetting(res)
  }

  sync = () => {
    this.props.store.syncSetting()
  }

  upload = async () => {
    this.props.store.uploadSetting()
  }

  download = () => {
    this.props.store.downloadSetting()
  }

  onChangeAutoSync = checked => {
    this.props.store.updateSyncSetting({
      autoSync: checked
    })
  }

  render () {
    const { getFieldDecorator } = this.props.form
    const {
      autofocustrigger
    } = this.props
    const {
      gistId,
      githubAccessToken,
      autoSync,
      lastSyncTime = ''
    } = this.props.formData
    const { submitting, syncing } = this.state
    const tokenLabel = (
      <Tooltip
        title={
          <span>
            github personal access token
            <Link className='mg1l' to='https://github.com/electerm/electerm/wiki/create-personal-access-token' />
          </span>
        }
      >
        <span>
          token <Icon type='question-circle' />
        </span>
      </Tooltip>
    )
    const gistIdLabel = (
      <Tooltip title={
        <span>
          secret gist id
          <Link className='mg1l' to='https://github.com/electerm/electerm/wiki/create-secret-gist' />
        </span>
      }>
        <span>
          gist id <Icon type='question-circle' />
        </span>
      </Tooltip>
    )
    return (
      <Form onSubmit={this.handleSubmit} className='form-wrap pd1x'>
        <FormItem
          {...formItemLayout}
          label={gistIdLabel}
          hasFeedback
        >
          {getFieldDecorator('gistId', {
            rules: [{
              max: 100, message: '100 chars max'
            }, {
              required: true, message: 'gistId required'
            }],
            initialValue: gistId
          })(
            <InputAutoFocus
              autofocustrigger={autofocustrigger}
              selectall='true'
              placeholder='gist id'
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={tokenLabel}
          hasFeedback
        >
          {getFieldDecorator('githubAccessToken', {
            rules: [{
              max: 100, message: '100 chars max'
            }, {
              required: true, message: 'githubAccessToken required'
            }],
            initialValue: githubAccessToken
          })(
            <Input
              type='password'
              placeholder='github personal access token'
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={ss('autoSync')}
        >
          <Switch
            checked={autoSync}
            onChange={this.onChangeAutoSync}
          />
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <p>
            <Button
              type='ghost'
              className='mg1r'
              onClick={() => this.submit()}
              loading={submitting}
            >{e('save')}</Button>
            <Button
              type='ghost'
              onClick={this.sync}
              disabled={this.disabled()}
              className='mg1r'
              loading={syncing}
            >{ss('sync')}</Button>
            <Button
              type='ghost'
              onClick={this.upload}
              disabled={this.disabled()}
              className='mg1r'
              loading={syncing}
            >{ss('uploadSettings')}</Button>
            <Button
              type='ghost'
              onClick={this.download}
              disabled={this.disabled()}
              className='mg1r'
              loading={syncing}
            >{ss('downloadSettings')}</Button>
          </p>
          <p>
            {e('lastSyncTime')}: {lastSyncTime}
          </p>
        </FormItem>
      </Form>
    )
  }
}

@Form.create()
@validateFieldsAndScroll
class SyncFormExport extends SyncForm {}

export default SyncFormExport
