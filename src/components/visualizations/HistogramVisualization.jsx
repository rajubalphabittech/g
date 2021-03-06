import React from 'react';
import ReactDOM from 'react-dom';
import numeral from 'numeral';
import crossfilter from 'crossfilter';
import dc from 'dc';
import d3 from 'd3';

import D3Utils from 'util/D3Utils';

import momentHelper from 'legacy/moment-helper';
import graphHelper from 'legacy/graphHelper';

require('!script!../../../public/javascripts/jquery-2.1.1.min.js');
require('!script!../../../public/javascripts/bootstrap.min.js');

const HistogramVisualization = React.createClass({
  getInitialState() {
    this.triggerRender = true;
    this.histogramData = crossfilter();
    this.dimension = this.histogramData.dimension((d) => momentHelper.toUserTimeZone(d.x * 1000));
    this.group = this.dimension.group().reduceSum((d) => d.y);

    return {
      dataPoints: [],
    };
  },
  componentDidMount() {
    this.renderHistogram();
    this.setState({dataPoints: this.props.data}, this.drawData);
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.height !== this.props.height || nextProps.width !== this.props.width) {
      this._resizeVisualization(nextProps.width, nextProps.height);
    }
    this.setState({dataPoints: nextProps.data}, this.drawData);
  },
  renderHistogram() {
    var histogramDomNode = ReactDOM.findDOMNode(this);

    this.histogram = dc.barChart(histogramDomNode);
    this.histogram
      .width(this.props.width)
      .height(this.props.height)
      .margins({left: 50, right: 15, top: 10, bottom: 30})
      .dimension(this.dimension)
      .group(this.group)
      .x(d3.time.scale())
      .elasticX(true)
      .elasticY(true)
      .centerBar(true)
      .renderHorizontalGridLines(true)
      .brushOn(false)
      .xAxisLabel("Time")
      .yAxisLabel("Messages")
      .renderTitle(false)
      .colors(D3Utils.glColourPalette())
      .on('renderlet', (_) => {
        var formatTitle = (d) => {
          var valueText = numeral(d.y).format("0,0") + " messages<br>";
          var keyText = "<span class=\"date\">" + d.x.format(momentHelper.HUMAN_TZ) + "</span>";

          return "<div class=\"datapoint-info\">" + valueText + keyText + "</div>";
        };

        d3.select(histogramDomNode).selectAll('.chart-body rect.bar')
          .attr('rel', 'tooltip')
          .attr('data-original-title', formatTitle);
      });

    $(histogramDomNode).tooltip({
      'selector': '[rel="tooltip"]',
      'container': 'body',
      'placement': 'auto',
      'delay': {show: 300, hide: 100},
      'html': true
    });

    this.histogram.xAxis()
      .ticks(graphHelper.customTickInterval())
      .tickFormat(graphHelper.customDateTimeFormat());
    this.histogram.yAxis()
      .ticks(3)
      .tickFormat((value) => {
        return value % 1 === 0 ? d3.format("s")(value) : null;
      });
    this.histogram.render();
  },
  _resizeVisualization(width, height) {
    this.histogram
      .width(width)
      .height(height);
    this.triggerRender = true;
  },
  drawData() {
    const dataPoints = $.map(this.state.dataPoints, (value, timestamp) => {
      return {x: Number(timestamp), y: value};
    });
    this.histogram.xUnits(() => dataPoints.length - 1);
    this.histogramData.remove();
    this.histogramData.add(dataPoints);

    // Fix to make Firefox render tooltips in the right place
    // TODO: Find the cause of this
    if (this.triggerRender) {
      this.histogram.render();
      this.triggerRender = false;
    } else {
      this.histogram.redraw();
    }
  },
  render() {
    return (
      <div id={"visualization-" + this.props.id} className="histogram"/>
    );
  }
});

export default HistogramVisualization;
