import React from 'react';
import BillingDetails from './BillingDetails';
import Plan from './Plan';


function Billing() {
  return (
    <div>
      <div className="billing-content">
        <ul className="nav nav-pills">
          <li className="active">
            <a href="#billing" data-toggle="tab"><i className="fas fa-credit-card" />Billing</a>
          </li>
          <li><a href="#plan" data-toggle="tab"><i className="far fa-list-alt" />Plan</a></li>
        </ul>
        <div className="billing-wrapper" >
          <div className="tab-content clearfix">
            <BillingDetails />
            <Plan />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Billing;
