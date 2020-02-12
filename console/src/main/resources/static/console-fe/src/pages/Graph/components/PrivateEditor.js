
import React from 'react';
import PropTypes from 'prop-types';
import { withEditorContext } from 'gg-editor';
import { Drawer, Button, Loading, Icon } from '@alifd/next';
import { request } from '../../../globalLib';

import ServiceDialog from './ServiceDialog';

const DELTA = 0.05;

class PrivateEditor extends React.Component {
  static propTypes = {
    renderData: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.serviceDialog = React.createRef();
    this.state = {
      visible: false,
      loading: false,
    };
  }

  componentDidMount() {
    const { graph } = this.props;

    graph.on('node:click', this.onNodeClick);
  }

  onNodeClick = (node) => {
    console.log(node);
    this.setState({
      visible: true,
    });
  }

  onClose = (reason, e) => {
    this.setState({
      visible: false,
    });
  }

  onOpenDialog = () => {
    if (this.serviceDialog) {
      this.serviceDialog.current.getInstance()
        .show();
    }
  }

  onGetInstance = (item) => {
    request({
      url: `v1/console/graph/instances?serviceName=${item.name}`,
      success: ({ data }) => {
        if (data && typeof data === 'object') {
          this.props.renderData(data);
        }
      },
      complete: () => {
        this.setState({
          loading: false,
        });
      },
    });
  }

  onZoomIn = () => {
    const { graph } = this.props;
    const ratio = 1 + DELTA;

    const zoom = graph.getZoom() * ratio;
    const maxZoom = graph.get('maxZoom');

    if (zoom > maxZoom) {
      return;
    }

    graph.zoom(ratio);
  }

  onZoomOut = () => {
    const { graph } = this.props;
    const ratio = 1 - DELTA;

    const zoom = graph.getZoom() * ratio;
    const minZoom = graph.get('minZoom');

    if (zoom < minZoom) {
      return;
    }

    graph.zoom(ratio);
  }

  render() {
    const { loading, visible } = this.state;
    return (
      <div>
        <Loading
          shape="flower"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
          visible={loading}
          tip="Loading..."
          color="#333"
        />
        <div className="editorTool">
          <Button warning onClick={this.onOpenDialog}><Icon type="search" /> 选择服务</Button>
          <div className="g6-fa">
            <Button.Group size="large">
              <Button onClick={this.onZoomIn}><i className="fa fa-search-plus" aria-hidden="true" /></Button>
              <Button onClick={this.onZoomOut}><i className="fa fa-search-minus" aria-hidden="true" /></Button>
            </Button.Group>
          </div>
        </div>
        <Drawer
          title="标题"
          placement="right"
          visible={visible}
          onClose={this.onClose}
        >
          Start your business here by searching a popular product
        </Drawer>
        <ServiceDialog
          ref={this.serviceDialog}
          getInstance={this.onGetInstance}
        />
      </div>
    );
  }
}

export default withEditorContext(PrivateEditor);
