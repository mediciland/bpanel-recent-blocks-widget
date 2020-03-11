import React from 'react'

import MiniTX from './MiniTX'

const MiniTXList = ({ transactions = {}, getTX }) => {
  return <div className='col-sm-12'>
    <div className='row' style={{color: '#000', marginRight: '0', marginLeft: '0', minHeight: '60px'}}>
      {Object.keys(transactions).map((txid) => {
        return <MiniTX key={txid} txid={txid} tx={transactions[txid]} getTX={getTX} />
      })}
    </div>
  </div>
}

export default MiniTXList
