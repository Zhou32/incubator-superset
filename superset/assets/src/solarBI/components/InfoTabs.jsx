/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import SaveIcon from '@material-ui/icons/Save';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import ExportModal from './ExportModal';

const styles = theme => ({
  root: {
    marginBottom: 40,
  },
  slider: {
    padding: '22px 0px',
  },
  card: {
    minWidth: 450,
  },
  infoCard: {
    minHeight: 200,
    marginTop: 10,
    marginBottom: 100,
  },
  cardContent: {
    margin: '0 20',
  },
  typography: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  icon: {
    color: '#09290f',
    backgroundColor: '#489795',
    transform: 'scale(1.4)',
    margin: '15 20',
  },
  tooltip: {
    fontSize: 14,
  },
  tabContainer: {
    fontWeight: 300,
  },
  notUse: {
    margin: theme.spacing.unit,
  },
});

class InfoTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0,
      showExportModal: false,
    };
    this.handleTabChange = this.handleTabChange.bind(this);
    this.onBackClick = this.onBackClick.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.toggleExportModal = this.toggleExportModal.bind(this);
  }

  onBackClick() {
    if (this.props.can_save && this.props.solar_new) {
      this.props.onBackClick(false);
    } else {
      this.props.onBackClick(true);
    }
  }

  onSaveClick() {
    this.props.onSaveClick();
  }

  getCSVURL() {
    return this.props.getCSVURL();
  }

  toggleExportModal() {
    this.setState({ showExportModal: !this.state.showExportModal });
  }

  handleTabChange(event, tabValue) {
    this.setState({ tabValue });
  }

  render() {
    const { classes } = this.props;
    // const tabValue = this.state.tabValue;
    return (
      <div className={classes.root}>
        <Tooltip title="Go Back" classes={{ tooltip: classes.tooltip }}>
          <IconButton
            id="backIcon"
            className={classes.icon}
            onClick={this.onBackClick}
          >
            <KeyboardBackspaceIcon />
          </IconButton>
        </Tooltip>
        <div style={{ float: 'right' }}>
          {this.props.can_save && this.props.solar_new && (
            <Tooltip title="Save" classes={{ tooltip: classes.tooltip }}>
              <IconButton
                id="saveIcon"
                className={classes.icon}
                onClick={this.onSaveClick}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
          )}
          {this.props.can_export && (
            <Tooltip
              title="Export As CSV"
              classes={{ tooltip: classes.tooltip }}
            >
              <IconButton
                id="exportIcon"
                className={classes.icon}
                // href={this.getCSVURL()}
                onClick={this.toggleExportModal}
              >
                <CloudDownloadIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>

        <ExportModal
          open={this.state.showExportModal}
          onHide={this.toggleExportModal}
        />
      </div>
    );
  }
}

InfoTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  onBackClick: PropTypes.func.isRequired,
  onSaveClick: PropTypes.func.isRequired,
  getCSVURL: PropTypes.func.isRequired,
  can_save: PropTypes.bool.isRequired,
  can_export: PropTypes.bool.isRequired,
  solar_new: PropTypes.bool.isRequired,
};

export default withStyles(styles)(InfoTabs);
