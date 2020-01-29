import React, { useState, useEffect } from 'react'
import { Buffer } from 'buffer/'
import { UXTX } from '@bpanel/bpanel-utils';

const LOADING = "LOADING"
const DEFAULT = "DEFAULT"
const COINBASE = "COINBASE"
const FLODATA = "FLODATA"
const OIP042 = "OIP042"
const OIP5 = "OIP5"

const txColors = {
  LOADING: {
    background: '#fff',
    border: '1px solid #000'
  },
  DEFAULT: {
    background: '#FFF2CC',
    border: '1px solid #D6B656'
  },
  COINBASE: {
    background: '#D0CEE2',
    border: '1px solid #56517E'
  },
  FLODATA: {
    background: '#B1DDF0',
    border: '1px solid #10739E'
  }
}

const MiniTX = ({
  txid,
  getTX,
  tx
}) => {
  useEffect(() => {
    // If we already have the tx we want, just skip
    if (tx) { return }
    // otherwise, dispatch an action to grab our desired TX
    getTX(txid)
  }, [tx, txid, getTX])

  let txType
  if (tx) {
    let uxtx = UXTX.fromRaw(tx.hex, 'hex', { constants: { DATE_FORMAT: 'MMMM Do YYYY, h:mm:ss a' }, json: tx })
    if (uxtx.getUXType() === COINBASE) { txType = COINBASE }
    if (!txType && tx.floData.data.length > 0) txType = FLODATA
    // let floData = Buffer.from(tx.floData.data).toString('utf-8')

    if (!txType) txType = DEFAULT
  }

  if (!txType) txType = LOADING

  return <div 
    className="card" 
    style={{margin: '5px', width: '50px', height: '50px', ...txColors[txType]}}
  >
    <p style={{margin: 'auto'}}>{txid.substr(0,4)}</p>
  </div>
}

export default MiniTX