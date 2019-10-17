/* eslint-disable camelcase */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ChangeAddress from './ChangeAddress';
import { changeBillDetail } from '../actions/billingActions';
// import TeamCreditCard from './TeamCreditCard';

function BillingDetails({ billing, changeBillDetailConnect }) {
  const { cus_name, cus_email, cus_address } = billing.cus_info;
  let country = '';
  let city = '';
  let line1 = '';
  let line2 = '';
  let state = '';
  let postal_code = '';
  if (cus_address != null) {
    const cus_city = cus_address.city;
    const cus_country = cus_address.country;
    const cus_line1 = cus_address.line1;
    const cus_line2 = cus_address.line2;
    const cus_postal_code = cus_address.postal_code;
    const cus_state = cus_address.state;
    country = cus_country; city = cus_city; line1 = cus_line1; line2 = cus_line2;
    state = cus_state; postal_code = cus_postal_code;
  }
  const [changeAddressOpen, setChangeAddressOpen] = useState(false);
  const [billingValues, setBillingValues] = useState({
    name: cus_name,
    email: cus_email,
    country,
    line1,
    city,
    line2,
    state,
    postal_code,
  });

  const handleChange = name => (event) => {
    setBillingValues({ ...billingValues, [name]: event.target.value });
  };

  const handleChangeAddressOpen = () => {
    setChangeAddressOpen(true);
  };

  const handleChangeAddressClose = () => {
    setChangeAddressOpen(false);
  };

  const handleUpdateSubmit = () => {
    changeBillDetailConnect(billing.cus_id, billingValues).then((json) => {
      console.log(json);
    });
  };

  return (
    <React.Fragment>
      <div className="tab-pane active" id="billing">
        {/* <TeamCreditCard /> */}
        <div className="panel panel-primary">
          <div className="panel-heading">Billing Details</div>
          <div className="panel-body">
            <p>Please let us know how you’d like your invoices to be addressed.</p>
            <form method="post" action="">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input id="name" className="form-control billing-details" value={billingValues.name} onChange={handleChange('name')} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Billing email</label>
                <input type="email" id="email" className="form-control billing-details" value={billingValues.email} onChange={handleChange('email')} />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <div
                  onClick={handleChangeAddressOpen}
                  id="billing-address"
                  className="form-control billing-details"
                >
                  {billingValues.line1} {billingValues.line2}<br />
                  {billingValues.city === '' ? '' : billingValues.city + ','} {billingValues.state} {billingValues.postal_code}<br />
                  {billingValues.country}
                </div>
              </div>
            </form>
          </div>
          <div className="panel-footer">
            <button className="update-details-btn" onClick={handleUpdateSubmit}>Update details</button>
          </div>
        </div>
        <div className="panel panel-primary">
          <div className="panel-heading">Users</div>
          <div className="panel-body billing-users">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>INVOICE #</th>
                  <th>DATE</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>19290839</td>
                  <td>24/03/2019</td>
                  <td><i style={{ color: '#024067' }} className="fas fa-cloud-download-alt" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ChangeAddress
        open={changeAddressOpen}
        handleChangeAddressClose={handleChangeAddressClose}
        billingValues={billingValues}
        setBillingValues={setBillingValues}
        handleChange={handleChange}
      />
    </React.Fragment>
  );
}

BillingDetails.propTypes = {
  billing: PropTypes.object.isRequired,
};

function mapStateToProps({ billing }) {
  return {
    billing,
  };
}

export default connect(
  mapStateToProps,
  { changeBillDetailConnect: changeBillDetail },
)(BillingDetails);

