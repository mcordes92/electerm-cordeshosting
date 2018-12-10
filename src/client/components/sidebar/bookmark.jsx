/**
 * history select
 */

import {memo} from 'react'
import ItemList from '../setting-panel/list'
import TreeList from '../setting-panel/list'
import {
  Icon,
  Tooltip
} from 'antd'
import copy from 'json-deep-copy'

const {prefix, getGlobal} = window
const c = prefix('common')
const m = prefix('menu')
const e = prefix('control')
const sshConfigItems = copy(getGlobal('sshConfigItems'))

export default memo((props) => {
  let {
    bookmarkGroups = []
  } = props
  const onClickItem = (item) => {
    props.onSelectBookmark(item.id)
  }
  let props0 = {
    bookamrks: [
      ...props.bookamrks || [],
      ...sshConfigItems
    ],
    type: 'bookamrks',
    onClickItem,
    activeItemId: props.activeItemId
  }
  let bookmarkGroupsTotal = sshConfigItems.length
    ? [
      ...bookmarkGroups,
      {
        title: 'ssh-config',
        id: 'ssh-config',
        bookmarkIds: sshConfigItems.map(d => d.id)
      }
    ]
    : bookmarkGroups
  let bookmarkSelect = bookmarkGroups.length > 1
    ? (
      <TreeList
        {...props0}
        bookmarkGroups={bookmarkGroupsTotal}
        onClickItem={onClickItem}
      />
    )
    : (
      <ItemList
        {...props0}
        list={props0.bookamrks}
        onClickItem={item => props.onSelectHistory(item.id)}
      />
    )
  return (
    <div className="sidebar-panel bookamrks-panel">
      <div className="pd1y pd2x">
        <div className="fix">
          <div className="fleft">{c('bookamrks')}</div>
          <div className="fright">
            <Tooltip title={e('newSsh')}>
              <Icon
                type="plus-circle"
                className="font16 mg1x mg2l pointer iblock control-icon icon-do-edit"
                onClick={props.onNewSsh}
              />
            </Tooltip>
            <Tooltip title={`${m('edit')} ${c('bookamrks')}`}>
              <Icon
                type="edit"
                className="font16 mg1x mg2l pointer iblock control-icon icon-do-edit"
                onClick={props.onNewSsh}
              />
            </Tooltip>
          </div>
        </div>
      </div>
      {bookmarkSelect}
    </div>
  )
})
