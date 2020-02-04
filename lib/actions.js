import { ChainEntry as BChainEntry } from 'bcoin';
import { getClient, chain as chainUtils } from '@bpanel/bpanel-utils';
import { ChainEntry as HChainEntry } from 'hsd';
import { ChainEntry as FChainEntry } from 'fcoin';

import { ADD_RECENT_BLOCK, SET_RECENT_BLOCKS, ADD_TX, UPDATE_MEMPOOL, EMIT_SOCKET } from './constants';

// can also accept raw txs array
// as it is returned in payload
export function addRecentBlock(entry) {
  return async (dispatch, getState) => {
    const { currentClient } = getState().clients;
    let blockMeta;
    if (currentClient.chain === 'handshake') { blockMeta = HChainEntry.fromRaw(entry).toJSON() }
    if (currentClient.chain === 'flo') { blockMeta = FChainEntry.fromRaw(entry).toJSON() }
    else blockMeta = BChainEntry.fromRaw(entry).toJSON();

    const block = currentClient.isSPV
      ? await chainUtils.getBlockHeaderInfo(blockMeta.hash)
      : await chainUtils.getBlockInfo(blockMeta.hash);
    return dispatch({
      type: ADD_RECENT_BLOCK,
      payload: block
    });
  };
}

// action creator to set recent blocks on state
// mapped to the state via `mapPanelDispatch`
// which allows plugins to call action creator to update the state
export function getRecentBlocks(n = 5) {
  return async (dispatch, getState) => {
    const { getBlocksInRange } = chainUtils;
    const { height } = getState().chain;
    let count = n;
    // if we have fewer blocks then the range we want to retrieve
    // then only retrieve up to height
    if (height <= n) {
      count = height;
    }
    try {
      const blocks = await getBlocksInRange(
        height,
        height - count,
        -1,
        getClient().isSPV
      );
      dispatch({
        type: SET_RECENT_BLOCKS,
        payload: blocks
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Could not retrieve blocks:', e);
      dispatch({
        type: SET_RECENT_BLOCKS,
        payload: []
      });
    }
  };
}

export function getTX(txid, callback) {
  return async (dispatch, getState) => {
    const tx = await getClient().node.getTX(txid)
    dispatch({
      type: ADD_TX,
      payload: tx
    });
    if (callback) { callback(tx) }
  };
}


export function updateMempool() {
  return async (dispatch, getState) => {
    const mempool = await getClient().node.getMempool()
    return dispatch({
      type: UPDATE_MEMPOOL,
      payload: mempool
    });
  };
}

export function broadcastSetFilter() {
  // need to set a filter for the socket to get mempool updates
  // all zeros means an open filter
  return {
    type: EMIT_SOCKET,
    bsock: {
      type: 'dispatch',
      message: 'set filter',
      filter: '00000000000000000000',
      acknowledge: () => ({})
    }
  };
}

export function subscribeTX() {
  return {
    type: EMIT_SOCKET,
    bsock: {
      type: 'subscribe',
      message: 'tx',
      responseEvent: 'mempool tx'
    }
  };
}

export function watchMempool() {
  return {
    type: EMIT_SOCKET,
    bsock: {
      type: 'dispatch',
      message: 'watch mempool',
      acknowledge: () => ({})
    }
  };
}

export default {
  addRecentBlock,
  getRecentBlocks,
  getTX,
  updateMempool,
  broadcastSetFilter,
  subscribeTX,
  watchMempool
};
