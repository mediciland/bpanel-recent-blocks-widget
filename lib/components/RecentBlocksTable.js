import React from 'react'
import { Link } from '@bpanel/bpanel-ui'
import moment from 'moment'
import clsx from 'clsx'
import MinedBy from './MinedBy'

const Th = ({ title, ...rest }) => {
  const { className, ...other } = rest
  return <th {...other} className={'rbt-th ' + className}>
    <span>{title}</span>
  </th>
}

const sortBlocks = blocks => blocks.sort((a, b) => b.height - a.height).forEach(block => {
  // some blocks come back with coinbase split up into an array
  // for these situations we want to join the data for display purposes
  block.coinbase = Array.isArray(block.coinbase)
    ? block.coinbase.join('')
    : block.coinbase;
});

const RecentBlocksTable = ({
  blocks,
  transactions,
  getTX
}) => {
  // let loading
  // if (Array.isArray(blocks) && blocks.length) {
  //   sortBlocks(blocks)
  // } else {
  //   loading = <p key={"loading"}>Loading...</p>
  // }
  return <table className={'recent-blocks-table'}>
    <thead>
      <tr>
        <Th title={'Height'} />
        <Th title={'Timestamp'} />
        <Th className={'text-right'} title={'Transactions'} />
        <Th className={'text-right'} title={'Mined by'} />
        <Th className={'text-right'} title={'Size'} />
      </tr>
    </thead>
    <tbody>
      {blocks && blocks.map(( block, i) => {
        const highlighted = i % 2 === 0
        return <tr key={block.height} className={'recent-block-table-row'}>
          <td className={clsx('rbt-row-item text-left', highlighted && 'highlighted')}>
            <Link className={'block-height-link'} to={`block/${block.hash}`}><strong>{block.height}</strong></Link>
          </td>
          <td className={clsx('rbt-row-item text-left', highlighted && 'highlighted')}>
            {moment.unix(block.time).fromNow()}
          </td>
          <td className={clsx('rbt-row-item text-right', highlighted && 'highlighted')}>
            <strong>{block.tx.length}</strong>
          </td>
          <td className={clsx('rbt-row-item text-right', highlighted && 'highlighted')}>
            <MinedBy txid={block.tx[0]} tx={transactions[block.tx[0]]} getTX={getTX} />
          </td>
          <td className={clsx('rbt-row-item text-right', highlighted && 'highlighted')}>
            {block.size}
          </td>
        </tr>
      })}
    </tbody>
  </table>
}

RecentBlocksTable.propTypes = {}

export default RecentBlocksTable
