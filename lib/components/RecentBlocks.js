import React from 'react';
import PropTypes from 'prop-types';
import {
  Header,
  Button,
  widgetCreator,
  Table,
  ExpandedDataRow,
  Text
} from '@bpanel/bpanel-ui';
import { getClient } from '@bpanel/bpanel-utils';

import Container from '@material-ui/core/Container'

import Mempool from './Mempool'
import BlockList from './BlockList'

class RecentBlocks extends React.Component {
  constructor(props) {
    super(props);
  }

  static get displayName() {
    return 'Recent Blocks Widget';
  }

  static get propTypes() {
    return {
      chainHeight: PropTypes.number,
      recentBlocks: PropTypes.array,
      transactions: PropTypes.object,
      mempool: PropTypes.object,
      getRecentBlocks: PropTypes.func,
      getTX: PropTypes.func,
      progress: PropTypes.number
    };
  }

  render() {
    // const isSPV = getClient().isSPV;
    const isSPV = false;
    const { getRecentBlocks, getTX, recentBlocks, transactions = {}, mempool = {}, progress } = this.props;

    return (
      <Container style={{fontFamily: 'Roboto'}}>
        <Mempool mempool={mempool} getTX={getTX} />
        <Header type="h3">Recent Blocks</Header>
        <div><BlockList blocks={recentBlocks} transactions={transactions} getTX={getTX} /></div>
        {progress < 0.97 && (
          <div className="row mt-3">
            <Text type="p" className="col">
              While your node is syncing you can use this button to get more
              recent blocks as they come in. Once your node is at 100% this
              button will go away and the table will update automatically
            </Text>
            <Button
              type="primary"
              className="col-xl-3"
              onClick={() => getRecentBlocks(this.blockCount)}
            >
              Get Blocks
            </Button>
          </div>
        )}
        {isSPV && <Text>Limited information is available in SPV mode</Text>}
      </Container>
    );
  }
}

export default widgetCreator(RecentBlocks);
