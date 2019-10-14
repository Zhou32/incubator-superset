import React from 'react';

function Plan() {
  return (
    <React.Fragment>
      <div className="tab-pane" id="plan">
        <h1>Add a plan</h1>
        <div className="plan-option-pane">
          <div className="option-name"><i className="fas fa-list-ul" /><span>On Demand</span></div>
          <div className="option-description">On demand you will be charge every new downloadable data set</div>
          <div className=" option-submit"><button className="btn btn-default">Current</button></div>
        </div>
        <div className="plan-option-pane">
          <div className="option-name"><i className="fas fa-hotel" /><span>Subscription</span></div>
          <div className="option-description">$100 Increases for upto 3 new download data sets</div>
          <div className=" option-submit"><button className="btn btn-default">Choose</button></div>
        </div>
        <div className="plan-option-pane">
          <div className="option-name"><i className="fas fa-project-diagram" /><span>Unlimited</span></div>
          <div className="option-description">$1000 month flat fee for all the downloads you can do !</div>
          <div className=" option-submit"><button className="btn btn-default">Choose</button></div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Plan;
