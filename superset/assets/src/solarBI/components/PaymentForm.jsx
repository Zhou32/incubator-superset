import React, { useState } from 'react';
import { connect } from 'react-redux';
import { CardElement, injectStripe, ReactStripeElements } from 'react-stripe-elements';
import { processPayment } from '../actions/solarActions';


function PaymentForm({ stripe, processPayment }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault()
    let { token } = await stripe.createToken({ name });
    processPayment(token);
  };

  return (
    <main className="container">
      <form
        className="form-group mt-3 border border-primary rounded shadow-lg"
        onSubmit={handleSubmit}
      >
        <label>Name</label>
        <input
          type="text"
          className="inputgroup my-1 p-1 border border-dark"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <label>Amount</label>
        <input
          type="text"
          className="inputgroup my-1 p-1 border border-dark"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <label>CC Number -- Exp. Date -- CVC</label>
        <CardElement className="p-2 border border-dark" />
        <button style={{ backgroundColor: 'grey' }}>Charge It!</button>
      </form>
    </main>
  )
}

function mapStateToProps({ solarBI }) {
  return {
    solarBI,
  };
}

export default injectStripe(connect(
  mapStateToProps,
  { processPayment },
)(PaymentForm));
