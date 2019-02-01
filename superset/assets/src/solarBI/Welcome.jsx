import React from 'react';
import PropTypes from 'prop-types';
import MapView from './components/MapView';

const propTypes = {
  user: PropTypes.object.isRequired,
};

export default class Welcome extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
    };
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  onSearchChange(event) {
    this.setState({ search: event.target.value });
  }

  render() {
    return (
      <div>
        <MapView />
      </div>
    );
  }
}

Welcome.propTypes = propTypes;
