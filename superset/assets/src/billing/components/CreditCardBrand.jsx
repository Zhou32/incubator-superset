import React from 'react';
import PropTypes from 'prop-types';

function CreditCardBrand({ brand }) {
  return (
    <React.Fragment>
      {brand === 'visa' && <img style={{ height: 40 }} src="/static/assets/images/visa_icon.png" alt="Card Logos" />}
      {brand === 'mastercard' && <img style={{ height: 40 }} src="/static/assets/images/master_icon.png" alt="Card Logos" />}
      {brand === 'amex' && <img style={{ height: 40 }} src="/static/assets/images/amex_icon.png" alt="Card Logos" />}
      {brand === 'dinersclub' && <img style={{ height: 40 }} src="https://www.merchantequip.com/image/?logos=dc&height=40" alt="Card Logos" />}
      {brand === 'dicover' && <img style={{ height: 40 }} src="https://www.merchantequip.com/image/?logos=dc&height=40" alt="Card Logos" />}
      {brand === 'jcb' && <img style={{ height: 40 }} src="https://www.merchantequip.com/image/?logos=jcb&height=64" alt="Card Logos" />}
    </React.Fragment>
  );
}

CreditCardBrand.propTypes = {
  brand: PropTypes.string.isRequired,
};

export default CreditCardBrand;
