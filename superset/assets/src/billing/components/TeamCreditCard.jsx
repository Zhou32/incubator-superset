import React, { useState } from 'react';
import Card from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';

function TeamCreditCard() {
  const [number, setNumber] = useState('5555 .... .... 1111');
  const [name, setName] = useState('John Smith');
  const [expiry, setExpiry] = useState('10/20');
  const [cvc, setCvc] = useState('737');

  return (
    <div style={{ marginTop: '2em' }}>
      <Card
        number={number}
        name={name}
        expiry={expiry}
        cvc={cvc}
      // focused
      />
    </div>
  );
}

export default TeamCreditCard;
