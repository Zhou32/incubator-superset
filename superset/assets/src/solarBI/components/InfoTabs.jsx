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

// const tabHeadStyles = {
//   fontSize: 20,
//   textTransform: 'none',
// };

// function TabContainer(props) {
//   return (
//     <Typography component="div" style={{ padding: 8 * 3, fontSize: 20 }}>
//       {props.children}
//     </Typography>
//   );
// }

class InfoTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0,
    };
    this.handleTabChange = this.handleTabChange.bind(this);
    this.onBackClick = this.onBackClick.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.onExportClick = this.onExportClick.bind(this);
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

  onExportClick() {
    this.props.onExportClick();
  }

  getCSVURL() {
    return this.props.getCSVURL();
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
                href={this.getCSVURL()}
                onClick={this.onExportClick}
              >
                <CloudDownloadIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>
        {/* <Card className={classes.infoCard} md={6} xs={3}>
          <CardContent className={classes.cardContent}>
            <Typography
              variant="h3"
              id="label"
              className={classes.typography}
              style={{ marginBottom: "35px" }}
            >
              Need more?
            </Typography>
            <AppBar position="static" color="default">
              <Tabs
                id="tabs"
                value={tabValue}
                variant="fullWidth"
                onChange={this.handleTabChange}
                indicatorColor="secondary"
              >
                <Tab id="tab1" label="Solar Solution" style={tabHeadStyles} />
                <Tab id="tab2" label="Energy Profile" style={tabHeadStyles} />
                <Tab id="tab3" label="Business Case" style={tabHeadStyles} />
              </Tabs>
            </AppBar>
            {tabValue === 0 && (
              <TabContainer
                id='tab1Content'>
                <p style={{ fontWeight: 300 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
                  rutrum quam sem, ut vulputate nulla faucibus eu. Sed eu augue
                  sed magna luctus iaculis placerat et neque. Nulla sed quam ut
                  libero semper vestibulum vel ut sapien. Integer rutrum metus
                  sed velit aliquam viverra. Sed consequat sit amet ligula sed
                  laoreet.
                </p>
              </TabContainer>
            )}
            {tabValue === 1 && (
              <TabContainer
                id='tab2Content'>
                <p style={{ fontWeight: 300 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
                  rutrum quam sem, ut vulputate nulla faucibus eu. Sed eu augue
                  sed magna luctus iaculis placerat et neque. Nulla sed quam ut
                  libero semper vestibulum vel ut sapien. Integer rutrum metus
                  sed velit aliquam viverra. Sed consequat sit amet ligula sed
                  laoreet.
                </p>
              </TabContainer>
            )}
            {tabValue === 2 && (
              <TabContainer>
                <p style={{ fontWeight: 300 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                  sit amet egestas nibh, nec ornare lectus. Donec tristique
                  justo sit amet placerat placerat. Maecenas et eros non est
                  tincidunt aliquet. Suspendisse euismod consectetur odio.
                  Nullam fermentum sem vel turpis faucibus iaculis.
                </p>
              </TabContainer>
            )}
            <Tooltip title="Go Back" classes={{ tooltip: classes.tooltip }}>
              <IconButton
                id="backIcon"
                className={classes.icon}
                onClick={this.onBackClick}
              >
                <KeyboardBackspaceIcon />
              </IconButton>
            </Tooltip>
            <div style={{ float: "right" }}>
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
                    href={this.getCSVURL()}
                    onClick={this.onExportClick}
                  >
                    <CloudDownloadIcon />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </CardContent>
        </Card> */}
      </div>
    );
  }
}

InfoTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  onBackClick: PropTypes.func.isRequired,
  onSaveClick: PropTypes.func.isRequired,
  onExportClick: PropTypes.func.isRequired,
  getCSVURL: PropTypes.func.isRequired,
  can_save: PropTypes.bool.isRequired,
  can_export: PropTypes.bool.isRequired,
  solar_new: PropTypes.bool.isRequired,
};

export default withStyles(styles)(InfoTabs);
