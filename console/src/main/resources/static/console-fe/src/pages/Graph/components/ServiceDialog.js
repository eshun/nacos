
import React from 'react';
import PropTypes from 'prop-types';
import { request } from '../../../globalLib';
import {
  Dialog,
  Button,
  Form,
  Grid,
  Input,
  Pagination,
  Table,
  ConfigProvider,
} from '@alifd/next';

const FormItem = Form.Item;
const { Row, Col } = Grid;
const { Column } = Table;

@ConfigProvider.config
class ServiceDialog extends React.Component {
  static displayName = 'ServiceDialog';

  static propTypes = {
    getInstance: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      total: 0,
      pageSize: 10,
      currentPage: 1,
      dataSource: [],
      dialogVisible: false,
      search: {
        serviceName: '',
      },
    };
    this.show = this.show.bind(this);
  }

  componentDidMount() {
    this.queryServiceList();
  }

  queryServiceList() {
    const { currentPage, pageSize, search } = this.state;
    const parameter = [
      `pageNo=${currentPage}`,
      `pageSize=${pageSize}`,
      `serviceNameParam=${search.serviceName}`,
    ];
    request({
      url: `v1/ns/catalog/services?${parameter.join('&')}`,
      beforeSend: () => this.openLoading(),
      success: ({ count = 0, serviceList = [] } = {}) => {
        this.setState({
          dataSource: serviceList,
          total: count,
        });
      },
      error: () =>
        this.setState({
          dataSource: [],
          total: 0,
          currentPage: 0,
        }),
      complete: () => this.closeLoading(),
    });
  }

  openLoading() {
    this.setState({ loading: true });
  }

  closeLoading() {
    this.setState({ loading: false });
  }

  show() {
    this.setState({ dialogVisible: true });
  }

  hide() {
    this.setState({ dialogVisible: false });
  }

  onConfirm(item) {
    this.props.getInstance && this.props.getInstance(item);
    this.hide();
  }

  render() {
    const { search, loading, dialogVisible, currentPage, total, pageSize, dataSource } = this.state;
    return (
      <Dialog
        className="service-dialog"
        title="选择服务"
        style={{ width: 600 }}
        footerActions={['cancel']}
        visible={dialogVisible}
        onCancel={() => this.hide()}
        onClose={() => this.hide()}
      >
        <Row
          className="demo-row"
          style={{
            marginBottom: 10,
            padding: 0,
          }}
        >
          <Col span="24">
            <Form inline field={this.field}>
              <FormItem label="服务名称">
                <Input
                  placeholder="请输入服务名称"
                  style={{ width: 200 }}
                  value=""
                  onChange={serviceName => this.setState({ search: { ...search, serviceName } })}
                  onPressEnter={() =>
                    this.setState({ currentPage: 1 }, () => this.queryServiceList())
                  }
                />
              </FormItem>
              <FormItem label="">
                <Button
                  type="primary"
                  onClick={() => this.setState({ currentPage: 1 }, () => this.queryServiceList())}
                  style={{ marginRight: 10 }}
                >
                  查询
                </Button>
              </FormItem>
            </Form>
          </Col>
        </Row>
        <Row style={{ padding: 0 }}>
          <Col span="24" style={{ padding: 0 }}>
            <Table
              dataSource={dataSource}
              loading={loading}
              locale={{ empty: '没有数据' }}
            >
              <Column title="服务名" dataIndex="name" />
              <Column title="分组名称" width={150} dataIndex="groupName" />
              <Column title="实例数" width={70} dataIndex="ipCount" />
              <Column title="健康实例数" width={100} dataIndex="healthyInstanceCount" />
              <Column
                title="操作"
                align="center"
                width={80}
                cell={(value, index, record) => (
                  <div>
                    <Button type="primary" onClick={() => this.onConfirm(record)}>选择</Button>
                  </div>
                )}
              />
            </Table>
          </Col>
        </Row>
        {total > pageSize && (
          <div
            style={{
              marginTop: 10,
              textAlign: 'right',
            }}
          >
            <Pagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={currentPage =>
                this.setState({ currentPage }, () => this.queryServiceList())
              }
            />
          </div>
        )}
      </Dialog>
    );
  }
}

export default ServiceDialog;
