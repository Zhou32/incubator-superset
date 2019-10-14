import React from 'react';

function BillingDetails() {
  return (
    <React.Fragment>
      <div className="tab-pane active" id="billing">
        <div className="panel panel-primary">
          <div className="panel-heading">Billing Details</div>
          <div className="panel-body">
            <p>Please let us know how you’d like your invoices to be addressed.</p>
            <form method="post" action="">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input id="name" className="form-control" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Billing email</label>
                <input type="email" id="email" className="form-control" />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea id="address" className="form-control" />
              </div>
            </form>
          </div>
          <div className="panel-footer">
            <button className="btn btn-success">Update details</button>
          </div>
        </div>
        <div className="panel panel-primary">
          <div className="panel-heading">Users</div>
          <div className="panel-body">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>INVOICE #</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>19290839</td>
                  <td>24/03/2019</td>
                  <td><i className="fas fa-cloud-download-alt" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}


export default BillingDetails;
