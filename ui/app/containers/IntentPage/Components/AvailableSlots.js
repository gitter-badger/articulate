import React from 'react';
import {
  Dropdown,
  NavItem,
} from 'react-materialize';
import messages from '../messages';

export function AvailableSlots(props) {
  let items = [<NavItem style={{ color: '#4e4e4e' }} key="addSlots" href="#">{messages.emptySlotList.defaultMessage}</NavItem>];
  if (props.slots && props.slots.length > 0) {
    items = props.slots.map((slot, index) => {
      const agentEntity = props.agentEntities.filter((agentEntity) => agentEntity.entityName === slot.entity)[0];
      let entityColor = props.dirOfColors[slot.entity];
      return (
        <NavItem onClick={props.onClickFunction.bind(null, slot.slotName)} key={index}><span style={{ color: entityColor }}>{`{${slot.slotName}}`}</span></NavItem>
      );
    });
  }
  return (
    <Dropdown className="dropdown-slot-entity-selector" trigger={<span id={'intentResponseEntityDropdown'}></span>}>
      {items}
    </Dropdown>
  );
}

AvailableSlots.propTypes = {
  slots: React.PropTypes.array,
  agentEntities: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.bool,
  ]),
  onClickFunction: React.PropTypes.func,
  dirOfColors: React.PropTypes.object,
};

export default AvailableSlots;
