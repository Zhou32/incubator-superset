import React from 'react';
import PropTypes from 'prop-types';

function CreditCardBrand({ brand }) {
  return (
    <React.Fragment>
      {brand === 'visa' && <img style={{ height: 64 }} src="https://www.merchantequip.com/image/?logos=v&height=64" alt="Card Logos" />}
      {brand === 'mastercard' && <img style={{ height: 64 }} src="https://www.merchantequip.com/image/?logos=m&height=64" alt="Card Logos" />}
      {brand === 'amex' && <img style={{ height: 64 }} src="https://www.merchantequip.com/image/?logos=a&height=64" alt="Card Logos" />}
      {brand === 'dinersclub' && <img style={{ height: 64 }} src="https://www.merchantequip.com/image/?logos=dc&height=64" alt="Card Logos" />}
      {brand === 'dicover' && <img style={{ height: 64 }} src="https://www.merchantequip.com/image/?logos=dc&height=64" alt="Card Logos" />}
      {brand === 'jcb' && <img style={{ height: 64 }} src="https://www.merchantequip.com/image/?logos=jcb&height=64" alt="Card Logos" />}
    </React.Fragment>
  );
}

CreditCardBrand.propTypes = {
  brand: PropTypes.string.isRequired,
};

export default CreditCardBrand;
