import PropTypes from 'prop-types';
import React from 'react';

const Chip = ({ children, close, onClose }) => {
  return (
    <div className='chip'>
      {children}
      {close ? <i onClick={onClose} className='remove material-icons'>close</i> : null}
    </div>
  );
};

Chip.propTypes = {
  children: PropTypes.node,
  /**
   * If show a close icon
   * @default false
   */
  close: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Chip;
