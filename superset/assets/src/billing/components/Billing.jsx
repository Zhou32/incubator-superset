import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import BillingDetails from './BillingDetails';
import Plan from './Plan';


const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#0063B0',
    },
    secondary: {
      main: '#0063B0',
    },
  },
});


function Billing() {
  return (
    <ThemeProvider theme={theme}>
      <div className="billing-content">
        <ul className="nav nav-pills">
          <li className="active">
            <a href="#billing" data-toggle="tab"><i className="fas fa-credit-card" />Billing</a>
          </li>
          <li><a href="#plan" data-toggle="tab"><i className="far fa-list-alt" />Plan</a></li>
        </ul>
        <div className="container">
          <div className="tab-content clearfix">
            <BillingDetails />
            <Plan />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default Billing;
