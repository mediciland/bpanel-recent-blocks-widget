import modules from './plugins';
import RecentBlocks from './components/RecentBlocks';
import {
  addRecentBlock,
  getRecentBlocks,
  getTX,
  updateMempool,
  watchMempool,
  broadcastSetFilter,
  subscribeTX
} from './actions';
import reducers from './reducers';
import { NEW_BLOCK, PLUGIN_NAMESPACE, UPDATE_MEMPOOL, MEMPOOL_TX, SOCKET_CONNECTED } from './constants';

import { recentBlocks } from './selectors';
const { getBlocksWithTxCount } = recentBlocks;

const plugins = Object.keys(modules).map(name => modules[name]);

export const metadata = {
  name: '@bpanel/recent-blocks',
  pathName: '',
  displayName: 'Recent Blocks',
  author: 'bcoin-org',
  description:
    'A widget that shows the recent block information, optimized for bpanel dashboard',
  version: require('../package.json').version
};

export const pluginConfig = { plugins };

export const getRouteProps = {
  'bpanel-homepage': (parentProps, props) =>
    Object.assign(props, {
      chainHeight: parentProps.chainHeight,
      recentBlocks: parentProps.recentBlocks,
      transactions: parentProps.transactions,
      mempool: parentProps.mempool,
      getRecentBlocks: parentProps.getRecentBlocks,
      getTX: parentProps.getTX,
      progress: parentProps.progress
    })
};

// This connects your plugin's component to the state's dispatcher
// Make sure to pass in an actual action to the dispatcher
export const mapComponentDispatch = {
  Panel: (dispatch, map) =>
    Object.assign(map, {
      getRecentBlocks: (n = 15) => dispatch(getRecentBlocks(n)),
      getTX: (txid) => dispatch(getTX(txid))
    })
};

// Tells the decorator what our plugin needs from the state
// This is available for container components that use an
// extended version of react-redux's connect to connect
// a container to the state and retrieve props
// make sure to replace the corresponding state mapping
// (e.g. `state.chain.height`) and prop names
export const mapComponentState = {
  Panel: (state, map) =>
    Object.assign(map, {
      chainHeight: state.chain.height,
      recentBlocks: state.plugins[PLUGIN_NAMESPACE].blocks
        ? getBlocksWithTxCount(state)
        : [],
      transactions: state.plugins[PLUGIN_NAMESPACE].transactions || {},
      mempool: state.plugins[PLUGIN_NAMESPACE].mempool || {},
      progress: state.chain.progress,
    })
};

// Subscript to mempool updates and transactions
export const addSocketConstants = (sockets = { listeners: [] }) => {
  sockets.listeners.push(
    {
      event: 'mempool tx',
      actionType: MEMPOOL_TX
    }
  );
  return Object.assign(sockets, {
    socketListeners: sockets.listeners
  });
};


// const debounceInterval = 100;
// let deboucer = null;

// custom middleware for our plugin. This gets
// added to the list of middlewares in the app's store creator
// Use this to intercept and act on dispatched actions
// e.g. for responding to socket events
export const middleware = ({ dispatch, getState }) => next => action => {
  const { type, payload } = action;
  const { progress } = getState().chain;
  const { plugins } = getState();
  let blocks;

  if (plugins && plugins[PLUGIN_NAMESPACE])
    blocks = plugins[PLUGIN_NAMESPACE].blocks;

  if (type === SOCKET_CONNECTED) {
    // actions to dispatch when the socket has connected
    // these are broadcasts and subscriptions we want to make
    // to the bcoin node
    dispatch(watchMempool());
    dispatch(broadcastSetFilter());
    dispatch(subscribeTX());
    dispatch(updateMempool());
  }
  if ((type === NEW_BLOCK || type === MEMPOOL_TX) && blocks && blocks.length && progress > 0.9) {
    // if dispatched action is NEW_BLOCK,
    // and recent blocks are already loaded
    // this middleware will intercept and dispatch addRecentBlock
    if (type === NEW_BLOCK) {
      dispatch(addRecentBlock(...payload));
    }
    // if (deboucer) return next(action);

    dispatch(updateMempool())

    // deboucer = setTimeout(() => {
    //   deboucer = null;
    // }, debounceInterval);
  }
  return next(action);
};

export const pluginReducers = reducers;

// very/exactly similar to normal decorators
// name can be anything, but must match it to target
// plugin name via decoratePlugin export below
const decorateHomepage = (Homepage, { React, PropTypes }) => {
  return class extends React.PureComponent {
    constructor(props) {
      super(props);
      this.requestedBlocks = false;
      this.blockCount = 15;
      this.lastTxCount = 0
      this.lastMempoolSnapshot = ''
    }

    static get displayName() {
      return metadata.displayName;
    }

    static get propTypes() {
      return {
        primaryWidget: PropTypes.oneOf([PropTypes.array, PropTypes.node]),
        chainHeight: PropTypes.number,
        recentBlocks: PropTypes.array,
        transactions: PropTypes.object,
        mempool: PropTypes.object,
        getRecentBlocks: PropTypes.func,
        getTX: PropTypes.func,
        progress: PropTypes.number
      };
    }

    UNSAFE_componentWillMount() {
      const {
        recentBlocks,
        transactions,
        mempool,
        getRecentBlocks,
        chainHeight,
        progress,
        getTX
      } = this.props;
      this.recentBlocks = RecentBlocks({
        recentBlocks,
        transactions,
        mempool,
        getRecentBlocks,
        chainHeight,
        progress,
        getTX
      });
      if (!recentBlocks.length && !this.requestedBlocks) {
        getRecentBlocks(this.blockCount);
      }
    }

    componentWillUnmount() {
      this.requestedBlocks = false;
    }

    componentDidUpdate({ chainHeight: prevHeight, progress }) {
      const { chainHeight, recentBlocks = [], transactions = {}, getRecentBlocks, getTX } = this.props;

      if (
        chainHeight > prevHeight &&
        (!recentBlocks.length && !this.requestedBlocks)
      ) {
        // if chainHeight has increased and recentBlocks is not set,
        // get the most recent blocks
        // `getRecentBlocks` is attached to the store
        // and will dispatch action creators to udpate the state
        getRecentBlocks(this.blockCount);
        this.requestedBlocks = true;
      } else if (chainHeight > prevHeight || this.requestedBlocks) {
        this.recentBlocks = RecentBlocks(this.props);
        this.requestedBlocks = false;
      } else if (recentBlocks.length === 0) {
        this.recentBlocks = RecentBlocks(this.props);
      }
    }

    UNSAFE_componentWillUpdate({
      chainHeight: nextHeight,
      recentBlocks: nextBlocks,
      transactions: nextTransactions,
      mempool: nextMempool,
      progress
    }) {
      const { chainHeight, recentBlocks = [], transactions = {}, mempool = {}, getRecentBlocks, getTX } = this.props;
      if (recentBlocks.length && this.requestedBlocks)
        this.requestedBlocks = false;

      let txCount = 0
      for (let bHash in transactions) { txCount += Object.keys(transactions[bHash]).length }
      // Build a string to represent a snapshot of the mempool
      let mempoolSnapshot = ''
      for (let txid in nextMempool) {
        // Grab the first 6 of the txid
        mempoolSnapshot += txid.substr(0,6)
        // Add a true or false flag to detect if transactions were loaded or undefined
        mempoolSnapshot += nextMempool[txid] ? 't' : 'f'
      }

      if (
        (progress > 0.9 && (nextHeight && nextHeight > chainHeight)) ||
        (nextBlocks && recentBlocks[0] &&
          nextBlocks.length &&
          recentBlocks[0].hash !== nextBlocks[0].hash) ||
        (nextBlocks && recentBlocks && !recentBlocks[0] && nextBlocks[0]) ||
        (this.lastTxCount < txCount) ||
        (this.lastMempoolSnapshot !== mempoolSnapshot)
      ) {
        // otherwise if we just have an update to the chainHeight
        // or recent blocks we should update the table
        this.recentBlocks = RecentBlocks({
          chainHeight: nextHeight,
          recentBlocks: nextBlocks,
          transactions: nextTransactions,
          mempool: nextMempool,
          getRecentBlocks,
          getTX,
          progress
        });
      }

      this.lastTxCount = txCount
      this.lastMempoolSnapshot = mempoolSnapshot
    }

    render() {
      const { primaryWidget = [] } = this.props;
      primaryWidget.push(this.recentBlocks);
      return <Homepage {...this.props} primaryWidget={primaryWidget} />;
    }
  };
};

// `decoratePlugin` passes an object with properties to map to the
// plugins they will decorate. Must match target plugin name exactly
export const decoratePlugin = { 'bpanel-homepage': decorateHomepage };
