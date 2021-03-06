/**
 *
 * EntitiesTable
 *
 */

import React from 'react';
import Table2 from '../../components/Table2';
import columns from './columnDefinition';

class EntitiesTable extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { data, onCellChange, menu } = this.props;
    return (
      <Table2
        columns={columns}
        data={data}
        onCellChange={onCellChange}
        menu={menu}
        tableName={'Entities'}
      />
    );
  }
}

EntitiesTable.propTypes = {
  data: React.PropTypes.array,
  menu: React.PropTypes.array,
  onCellChange: React.PropTypes.func,
};

export default EntitiesTable;
