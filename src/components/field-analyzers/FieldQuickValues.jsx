import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Button} from 'react-bootstrap';

import QuickValuesVisualization from 'components/visualizations/QuickValuesVisualization';
import AddToDashboardMenu from 'components/dashboard/AddToDashboardMenu';
import Widget from 'components/widgets/Widget';
import Spinner from 'components/common/Spinner';
import FieldQuickValuesStore from 'stores/field-analyzers/FieldQuickValuesStore';
import UIUtils from 'util/UIUtils';

const FieldQuickValues = React.createClass({
  propTypes: {
    permissions: PropTypes.arrayOf(React.PropTypes.string),
  },
  getInitialState() {
    return {
      field: undefined,
      autoReload: false,
      data: [],
    };
  },

  componentDidMount() {
    this.updateIntervalId = window.setInterval(() => this._loadQuickValuesData(true), 3000);
  },
  componentDidUpdate(oldProps, oldState) {
    if (this.state.field !== oldState.field) {
      const element = ReactDOM.findDOMNode(this);
      UIUtils.scrollToHint(element);
    }
  },
  componentWillUnmount() {
    window.clearInterval(this.updateIntervalId);
  },
  _toggleAutoReload() {
    const shouldAutoReload = !this.state.autoReload;
    this.setState({autoReload: shouldAutoReload});
  },
  addFieldQuickValues(field) {
    this.setState({field: field}, () => this._loadQuickValuesData(false));
  },
  _loadQuickValuesData(autoReload) {
    if (autoReload && !this.state.autoReload) {
      return;
    }

    if (this.state.field !== undefined) {
      this.setState({loadPending: true});
      const promise = FieldQuickValuesStore.getQuickValues(this.state.field);
      promise.then((data) => this.setState({data: data, loadPending: false}));
    }
  },
  _resetStatus() {
    this.setState(this.getInitialState());
  },
  render() {
    let content;

    let inner;
    if (this.state.data.length === 0) {
      inner = <Spinner />;
    } else {
      inner = (
        <QuickValuesVisualization id={this.state.field}
                                  config={{show_pie_chart: true, show_data_table: true}}
                                  data={this.state.data}
                                  horizontal
                                  displayAddToSearchButton
                                  displayAnalysisInformation/>
      );
    }

    if (this.state.field !== undefined) {
      content = (
        <div className="content-col">
          <div className="pull-right">
            <AddToDashboardMenu title="Add to dashboard"
                                widgetType={Widget.Type.QUICKVALUES}
                                configuration={{field: this.state.field}}
                                bsStyle="default"
                                pullRight
                                permissions={this.props.permissions}>
              <Button bsSize="small" onClick={() => this._resetStatus()}>Dismiss</Button>
              <Button bsSize="small"
                      onClick={() => this._toggleAutoReload()}>{this.state.autoReload ? 'Stop reloading' : 'Reload automatically'} </Button>
            </AddToDashboardMenu>
          </div>
          <h1>Quick Values for {this.state.field} {this.state.loadPending && <i
            className="fa fa-spin fa-spinner"></i>}</h1>

          <div style={{maxHeight: 400, overflow: 'auto', marginTop: 10}}>{inner}</div>
        </div>
      );
    }
    return <div id="field-quick-values">{content}</div>;
  },
});

export default FieldQuickValues;
