import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ChangeConfirm from './ChangeConfirm';

const useStyles = makeStyles(tm => ({
  button: {
    float: 'right',
    width: 255,
    height: 80,
    color: '#024067',
    borderColor: '#024067',
    borderRadius: 10,
  },
  notUse: {
    margin: tm.spacing(1),
  },
}));

function Plan() {
  const classes = useStyles();
  const [openCC, setOpenCC] = React.useState(false);

  const handleOpenCC = () => {
    setOpenCC(true);
  };

  const handleCloseCC = () => {
    setOpenCC(false);
  };

  return (
    <React.Fragment>
      <div className="tab-pane" id="plan">
        <h1>Add a plan</h1>
        <div className="plan-option-pane">
          <div className="option-name"><i className="fas fa-list-ul" /><span>Free</span></div>
          <div className="option-description">On demand you will be charge every new downloadable data set</div>
          <div className="option-submit"><button className="btn btn-default" disabled>Current</button></div>
        </div>
        <div className="plan-option-pane">
          <div className="option-name"><i className="fas fa-hotel" /><span>Starter</span></div>
          <div className="option-description">$100 Increases for upto 3 new download data sets</div>
          <div className="option-submit">
            <Button variant="outlined" color="primary" className={classes.button} onClick={handleOpenCC}>Choose</Button>
          </div>
        </div>
        <div className="plan-option-pane">
          <div className="option-name"><i className="fas fa-project-diagram" /><span>Medium</span></div>
          <div className="option-description">$1000 month flat fee for all the downloads you can do !</div>
          <div className="option-submit">
            <Button variant="outlined" color="primary" className={classes.button} onClick={handleOpenCC}>Choose</Button>
          </div>
        </div>
        <div className="plan-option-pane">
          <div className="option-name"><i className="fas fa-project-diagram" /><span>Advance</span></div>
          <div className="option-description">$1000 month flat fee for all the downloads you can do !</div>
          <div className="option-submit">
            <Button variant="outlined" color="primary" className={classes.button} onClick={handleOpenCC}>Choose</Button>
          </div>
        </div>
      </div>

      <ChangeConfirm openCC={openCC} handleCloseCC={handleCloseCC} />
    </React.Fragment>
  );
}

export default Plan;
