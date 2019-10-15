import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
  button: {
    fontSize: '1.2em',
  },
  contentText: {
    fontSize: '1.2em',
  },
  title: {
    '& h2': {
      fontSize: '1.6em',
    },
  },
  notUse: {
    margin: theme.spacing(1),
  },
}));

function ChangeConfirm({ openCC, handleCloseCC }) {
  const classes = useStyles();

  return (
    <div>
      <Dialog open={openCC} onClose={handleCloseCC} aria-labelledby="form-dialog-title">
        <DialogTitle className={classes.title}>Ready to Change Plan?</DialogTitle>
        <DialogContent>
          <DialogContentText className={classes.contentText}>
            Are you sure to change your current plan to the new one?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCC} color="primary" className={classes.button}>
            Confirm
          </Button>
          <Button onClick={handleCloseCC} color="primary" className={classes.button}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

ChangeConfirm.propTypes = {
  openCC: PropTypes.bool.isRequired,
  handleCloseCC: PropTypes.func.isRequired,
};

export default ChangeConfirm;
