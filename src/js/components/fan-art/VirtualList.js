var React = require('react');
var ReactDOM = require("react-dom");
var utils = require('./utils');

class VirtualList extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
          items: [],
          bufferStart: 0,
          height: 0
      };
      this._getListBox = this._getListBox.bind(this);
    }

    getVirtualState(props) {
        var state = {
            items: [],
            bufferStart: 0,
            height: 0
        };

        if (typeof props.container === 'undefined' || props.items.length === 0 || props.itemHeight <= 0 ) return state;

        var items = props.items;

        state.height = props.items.length * props.itemHeight;

        var viewBox = this.viewBox(props);

        if (viewBox.height <= 0) return state;

        viewBox.top = utils.viewTop(props.container);
        viewBox.bottom = viewBox.top + viewBox.height;

        var listBox = this.listBox(props);

        var renderStats = VirtualList.getItems(viewBox, listBox, props.itemHeight, items.length, props.itemBuffer);

        if (renderStats.itemsInView.length === 0) return state;

        state.items = items.slice(renderStats.firstItemIndex, renderStats.lastItemIndex + 1);
        state.bufferStart = renderStats.firstItemIndex * props.itemHeight;

        return state;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.bufferStart !== nextState.bufferStart) return true;

        if (this.state.height !== nextState.height) return true;

        var equal = utils.areArraysEqual(this.state.items, nextState.items);

        return !equal;
    }

    viewBox(nextProps) {
        return (this.view = this.view || this._getViewBox(nextProps));
    }

    _getViewBox(nextProps) {
        return {
            height: typeof nextProps.container.innerHeight !== 'undefined' ? nextProps.container.innerHeight : nextProps.container.clientHeight
        };
    }

    _getListBox(nextProps) {
        var list = ReactDOM.findDOMNode(this);

        var top = utils.topDifference(list, nextProps.container);

        var height = nextProps.itemHeight * nextProps.items.length;

        return {
            top: top,
            height: height,
            bottom: top + height
        };
    }

    listBox(nextProps) {
        return (this.list = this.list || this._getListBox(nextProps));
    }

    componentWillReceiveProps(nextProps) {
        this.view = this.list = null;

        var state = this.getVirtualState(nextProps);

        this.props.container.removeEventListener('scroll', this.onScrollDebounced);

        this.onScrollDebounced = utils.debounce(this.onScroll, nextProps.scrollDelay, false);

        nextProps.container.addEventListener('scroll', this.onScrollDebounced);

        this.setState(state);
    }

    componentWillMount() {
        this.onScrollDebounced = utils.debounce(this.onScroll, this.props.scrollDelay, false);
    }

    componentDidMount() {
        var state = this.getVirtualState(this.props);

        this.setState(state);

        this.props.container.addEventListener('scroll', this.onScrollDebounced);
    }

    componentWillUnmount() {
        this.props.container.removeEventListener('scroll', this.onScrollDebounced);

        this.view = this.list = null;
    }

    onScroll() {
        var state = this.getVirtualState(this.props);

        this.setState(state);
    }

    // in case you need to get the currently visible items
    visibleItems() {
        return this.state.items;
    }

    render() {
        return (
        <this.props.tagName {...this.props} style={{boxSizing: 'border-box', height: this.state.height, paddingTop: this.state.bufferStart }} >
            {this.state.items.map(this.props.renderItem)}
        </this.props.tagName>
        );
    }
};

VirtualList.getBox = function getBox(view, list) {
    list.height = list.height || list.bottom - list.top;

    return {
        top: Math.max(0, Math.min(view.top - list.top)),
        bottom: Math.max(0, Math.min(list.height, view.bottom - list.top))
    };
};

VirtualList.getItems = function(viewBox, listBox, itemHeight, itemCount, itemBuffer) {
    if (itemCount === 0 || itemHeight === 0) return {
        itemsInView: 0
    };

    // list is below viewport
    if (viewBox.bottom < listBox.top) return {
        itemsInView: 0
    };

    // list is above viewport
    if (viewBox.top > listBox.bottom) return {
        itemsInView: 0
    };

    var listViewBox = VirtualList.getBox(viewBox, listBox);

    var firstItemIndex = Math.max(0,  Math.floor	(listViewBox.top / itemHeight) - itemBuffer);
    var lastItemIndex = Math.min(itemCount, Math.ceil(listViewBox.bottom / itemHeight) + itemBuffer) - 1;

    var itemsInView = lastItemIndex - firstItemIndex + 1;

    var result = {
        firstItemIndex: firstItemIndex,
        lastItemIndex: lastItemIndex,
        itemsInView: itemsInView,
    };

    return result;
};

VirtualList.propTypes = {
  items: React.PropTypes.array.isRequired,
  itemHeight: React.PropTypes.number.isRequired,
  renderItem: React.PropTypes.func.isRequired,
  container: React.PropTypes.object.isRequired,
  tagName: React.PropTypes.string.isRequired,
  scrollDelay: React.PropTypes.number,
  itemBuffer: React.PropTypes.number
};
VirtualList.defaultProps = {
  container: typeof window !== 'undefined' ? window : undefined,
  tagName: 'div',
  scrollDelay: 0,
  itemBuffer: 0
};

module.exports = VirtualList;
