
import React from 'react';
import GGEditor, { Flow, RegisterNode, ItemPopover } from 'gg-editor';
import { Grid } from '@alifd/next';

import Minimap from '@antv/g6/build/minimap';
import G6Grid from '@antv/g6/build/grid';

import PrivateEditor from './components/PrivateEditor';

import './index.scss';

import instance from '../../assets/instance.png';
import service from '../../assets/service.png';

const { Row, Col } = Grid;

class Graph extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      data: {
        nodes: [],
        edges: [],
      },
    };
  }

  renderItemPopover(item, position) {
    console.log(item);
    const { label, service, instance } = item._cfg.model;

    if (service) {
      return (
        <div
          className="g6-tooltip"
          style={{
            position: 'absolute',
            top: position.maxY,
            left: position.maxX,
          }}
        >
          <Row>
            <Col span="24">服务名 : {label}</Col>
          </Row>
          <Row>
            <Col span="24">分组名称 : {service.groupName}</Col>
          </Row>
          <Row>
            <Col span="12">集群数目 : {service.clusterCount}</Col>
            <Col span="12">实例数 : {service.ipCount}</Col>
          </Row>
          <Row>
            <Col span="12">健康实例数 : {service.healthyInstanceCount}</Col>
            <Col span="12">触发保护阈值 : {service.triggerFlag}</Col>
          </Row>
        </div>
      );
    } else if (instance) {
      return (
        <div
          className="g6-tooltip"
          style={{
            position: 'absolute',
            top: position.maxY,
            left: position.maxX,
            'white-space': 'nowrap',
            width: '250px',
          }}
        >
          <Row>
            <Col span="12">IP : {instance.ip}</Col>
            <Col span="12">端口 : {instance.port}</Col>
          </Row>
          <Row>
            <Col span="12">权重 : {instance.weight}</Col>
            <Col span="12">健康状态 : {instance.healthy.toString()}</Col>
          </Row>
          <Row>
            <Col span="12">集群 : {instance.clusterName}</Col>
            <Col span="12">临时实例 : {instance.ephemeral.toString()}</Col>
          </Row>
        </div>
      );
    } else {
      return null;
    }
  }

  renderData = (data) => {
    if (data && data.nodes && data.nodes.length > 0) {
      this.setState({
        data,
      });
    } else {
      this.setState({
        data: {
          nodes: [],
          edges: [],
        },
      });
    }
  }

  render() {
    const { data } = this.state;

    const minimap = new Minimap({
      size: [100, 60],
    });
    const grid = new G6Grid();

    return (
      <div className="editor-root">
        <GGEditor
          className="editor"
        >
          <PrivateEditor renderData={this.renderData} />
          <Flow
            className="editorBd"
            data={data}
            graphConfig={{
              plugins: [minimap, grid],
              layout: {
                type: 'dagre',
              },
              defaultNode: {
                size: [100, 100],
                labelCfg: {
                  position: 'bottom',
                },
                style: {
                  fill: 'rgba(255, 255, 255, 0)',
                  lineWidth: 0,
                },
              },
              nodeStateStyles: {
                selected: {
                  lineWidth: 0,
                },
              },
            }}
          />
          <RegisterNode
            name="service-node"
            config={{
              afterDraw(item, group) {
                // console.log('item', item);
                const size = item.size;
                const width = size[0];
                const height = size[1];
                const img = item.instance ? instance : service;
                const shape = group.get('children')[0];
                group.addShape('image', {
                  attrs: {
                    img,
                    width,
                    height,
                    x: -width / 2,
                    y: -height / 2,
                  },
                });
              },
            }}
            extend="rect"
          />
          <ItemPopover renderContent={this.renderItemPopover} />
        </GGEditor>
      </div>
    );
  }
}

export default Graph;
