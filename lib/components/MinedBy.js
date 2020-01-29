import React, { useState, useEffect } from 'react'
import { Buffer } from 'buffer/'
import pools from '../pools'

const MinedBy = ({
  txid,
  getTX,
  tx
}) => {
  useEffect(() => {
    // If we already have the tx we want, just skip
    if (tx) { return }
    // otherwise, dispatch an action to grab our TX
    getTX(txid)
  }, [tx, txid, getTX])

  let miner
  if (tx) {
    let floData = Buffer.from(tx.floData.data).toString('utf-8')
    for (let pool of pools) {
      if (miner) { break }
      for (let searchStr of pool.searchStrings) {
        if (floData.includes(searchStr)) {
          miner = (<a href={pool.url}>{pool.poolName}</a>)
          break
        }
      }
    }

    // If we have the tx, and were not able to find a match, go ahead and return "Unknown"
    if (!miner) miner = "Unknown"
  }
  
  // Set `miner` to an empty string if there is no tx :) 
  if (!miner) miner = ""

  return <p className="text-right" style={{marginBottom: 0}}>Mined By: {miner}</p>
}

export default MinedBy