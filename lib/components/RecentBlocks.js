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
import posed, { PoseGroup } from 'react-pose'

import BlockCard from './BlockCard'

const Item = posed.div({
  preEnter: { y: '-25%' },
  enter: { y: '0px', staggerChildren: 100 },
  exit: { y: '100%' }
})

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
      getRecentBlocks: PropTypes.func,
      getTX: PropTypes.func,
      progress: PropTypes.number
    };
  }

  render() {
    // const isSPV = getClient().isSPV;
    const isSPV = false;
    const { getRecentBlocks, getTX, recentBlocks, transactions = {}, progress } = this.props;
    let blocks;
    if (Array.isArray(recentBlocks) && recentBlocks.length) {
      // structure data for use in the expanded row component
      recentBlocks.sort((a, b) => b.height - a.height).forEach(block => {
        // some blocks come back with coinbase split up into an array
        // for these situations we want to join the data for display purposes
        block.coinbase = Array.isArray(block.coinbase)
          ? block.coinbase.join('')
          : block.coinbase;
      });

      blocks = (
        <PoseGroup animateOnMount={true} preEnterPose={'preEnter'}>
          {recentBlocks.map((block, i) => {
            return <Item key={block.hash}><BlockCard block={block} transactions={transactions[block.hash]} getTX={getTX} /></Item>
          })}
        </PoseGroup>
      )
    } else {
      blocks = <p>Loading...</p>;
    }

    return (
      <Container style={{fontFamily: 'Roboto'}}>
        <Header type="h3">Recent Blocks</Header>
        <div>{blocks}</div>
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
