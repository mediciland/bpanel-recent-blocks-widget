import React from 'react'

import { getClient, chain as chainUtils } from '@bpanel/bpanel-utils';

import TimeFromNow from './TimeFromNow'
import MinedBy from './MinedBy'
import MiniTXList from './MiniTXList'

const BlockCard = ({
  block,
  transactions = {},
  getTX
}) => {
  let blockTXMap = {}
  for (let txid of block.tx) {
    blockTXMap[txid] = transactions[txid]
  }

  return <div className="card" style={{color: '#000', margin: '10px 0px', padding: '16px 24px'}}>
    <div className="row">
      <div className="col-sm">
        <p><strong>{block.height}</strong></p>
        <p style={{marginBottom: 0}}><strong>{block.size} bytes</strong></p>
      </div>
      <div className="col-sm">
        <TimeFromNow timestamp={block.time} />
        <MinedBy txid={block.tx[0]} tx={transactions[block.tx[0]]} getTX={getTX} />
        <p className="text-right" style={{marginBottom: 0}}>Difficulty: {block.difficulty < 1 ? block.difficulty.toFixed(4) : block.difficulty.toFixed(0)}</p>
      </div>
    </div>
    <hr />
    <div className="row">
      <p className="col-sm-12">Transactions <strong>{block.tx.length}</strong></p>
      <MiniTXList transactions={blockTXMap} getTX={getTX} />
    </div>
  </div>
}

export default BlockCard