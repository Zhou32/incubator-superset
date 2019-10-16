/* eslint-disable camelcase */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ChangeAddress from './ChangeAddress';
// import TeamCreditCard from './TeamCreditCard';

function BillingDetails({ billing }) {
  const { cus_name, cus_email, cus_address } = billing.cus_info;
  const { city, country, line1, line2, postal_code, state } = cus_address;
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
                  {billingValues.city}, {billingValues.state} {billingValues.postal_code}<br />
                  {country}
                </div>
              </div>
            </form>
          </div>
          <div className="panel-footer">
            <button className="update-details-btn">Update details</button>
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
  {},
)(BillingDetails);

