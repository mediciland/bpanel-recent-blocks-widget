import React from 'react';
// import posed, { PoseGroup } from 'react-pose'
// import { motion, AnimatePresence } from "framer-motion"

import BlockCard from './BlockCard'

// const Item = posed.div({
//   preEnter: { y: '-25%' },
//   enter: { y: '0px', staggerChildren: 100 },
//   exit: { y: '100%' }
// })

function calculateSnapshot(blocks, transactions) {
  let snapshot = ''
  for (let block of blocks) {
    snapshot += block.hash.substr(0,4)
  }
  for (let blockHash in transactions) {
    snapshot += blockHash.substr(0,4)
    for (let txid in transactions[blockHash]) {
      snapshot += txid.substr(0,4)
      snapshot += transactions[blockHash][txid] ? 't' : 'f'
    }
  }

  return snapshot
}

const BlockList = ({
  blocks,
  getTX,
  transactions
}) => {
    // Calculate a "data snapshot"
    // let snapshot = calculateSnapshot(blocks, transactions)

    // console.log(snapshot, dataSnapshot.current)

    // If we have the same snapshot as before, don't rerender
    // if (snapshot === dataSnapshot.current) { console.log("snapshot is the same, bail"); return }
    // console.log('snapshot is different, rendering')
    // dataSnapshot.current = snapshot

  let blocksComponent

  if (Array.isArray(blocks) && blocks.length) {
    // structure data for use in the expanded row component
    blocks.sort((a, b) => b.height - a.height).forEach(block => {
      // some blocks come back with coinbase split up into an array
      // for these situations we want to join the data for display purposes
      block.coinbase = Array.isArray(block.coinbase)
        ? block.coinbase.join('')
        : block.coinbase;
    });
    
    blocksComponent = blocks.map((block, i) => {
      // return <motion.div 
      //   key={block.hash}
      //   positionTransition
      //   initial={{ opacity: 0, y: -50, scale: 0.3 }}
      //   animate={{ opacity: 1, y: 0, scale: 1 }}
      //   exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      // >
        return <BlockCard block={block} transactions={transactions[block.hash]} getTX={getTX} />
      // </motion.div>
    })
  } else {
    blocksComponent = <p key={"loading"}>Loading...</p>
  }

  return blocksComponent
  // return <AnimatePresence initial={true}>{blocksComponent}</AnimatePresence>
}

export default BlockList