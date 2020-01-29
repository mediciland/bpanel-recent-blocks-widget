import React from 'react'
import moment from 'moment';
import Box from '@material-ui/core/Box'
import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'

import { getClient, chain as chainUtils } from '@bpanel/bpanel-utils';

import MinedBy from './MinedBy'
import MiniTX from './MiniTX'

const BlockCard = ({
  block,
  transactions = {},
  getTX
}) => {
  // convert unix timestamp to human readable string
  let blockTime = block.time ? moment.unix(block.time).fromNow() : block.time
  if (blockTime === "Invalid Date")
    blockTime = ""

  return <div className="card" style={{color: '#000', margin: '10px 0px', padding: '16px 24px'}}>
    <div className="row">
      <div className="col-sm">
        <p>{block.height}</p>
        <p>{block.size}</p>
      </div>
      <div className="col-sm">
        <p className="text-right">{blockTime}</p>
        <MinedBy txid={block.tx[0]} tx={transactions[block.tx[0]]} getTX={getTX} />
        <p className="text-right">Difficulty: {block.difficulty < 1 ? block.difficulty.toFixed(4) : block.difficulty.toFixed(0)}</p>
      </div>
    </div>
    <hr />
    <div className="row">
      <p className="col-sm-12">Transactions <strong>{block.tx.length}</strong></p>
      <div className="col-sm-12" style={{display: 'flex', flexDirection: 'row'}}>
        {block.tx.map((txid) => {
          return <MiniTX txid={txid} tx={transactions[txid]} getTX={getTX} /> 
        })}
      </div>
    </div>
  </div>
}

export default BlockCard