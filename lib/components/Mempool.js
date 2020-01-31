import React from 'react'

import MiniTXList from './MiniTXList'

const Mempool = ({
  mempool,
  getTX
}) => {
  return <div className='row'>
    <h4 className='col-sm-12'>{Object.keys(mempool).length} Pending Transactions (Mempool)</h4>
    <MiniTXList transactions={mempool} getTX={getTX} />
  </div>
}

export default Mempool