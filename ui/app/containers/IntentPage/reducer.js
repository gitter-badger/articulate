import { fromJS } from 'immutable';
import {
  ADD_TEXT_PROMPT,
  CHANGE_INTENT_DATA,
  CHANGE_SLOT_NAME,
  DELETE_TEXT_PROMPT,
  LOAD_INTENT,
  LOAD_INTENT_ERROR,
  LOAD_INTENT_SUCCESS,
  REMOVE_AGENT_RESPONSE,
  REMOVE_SLOT,
  REMOVE_USER_SAYING,
  RESET_INTENT_DATA,
  SET_WINDOW_SELECTION,
  TAG_ENTITY,
  TOGGLE_FLAG,
  UNTAG_ENTITY,
} from './constants';

// The initial state of the App
const initialState = fromJS({
  windowSelection: '',
  intentData: {
    agent: null,
    domain: null,
    intentName: '',
    examples: [],
  },
  scenarioData: {
    agent: null,
    domain: null,
    intent: null,
    scenarioName: '',
    slots: [],
    intentResponses: [],
    useWebhook: false,
    webhookUrl: '',
  },
});

function intentReducer(state = initialState, action) {
  let slots;
  let tempState;
  let examples;

  switch (action.type) {
    case CHANGE_INTENT_DATA:
      if (action.payload.field === 'examples') {
        return state
          .updateIn(['intentData', 'examples'], (x) => x.splice(0, 0, fromJS({ userSays: action.payload.value, entities: [] })));
      } else if (action.payload.field === 'responses') {
        return state
          .updateIn(['scenarioData', 'intentResponses'], (x) => x.splice(0, 0, action.payload.value));
      } else if (action.payload.field === 'useWebhook') {
        return state
          .setIn(['scenarioData', 'useWebhook'], action.payload.value);
      } else if (action.payload.field === 'webhookUrl') {
        return state
          .setIn(['scenarioData', 'webhookUrl'], action.payload.value);
      } else if (action.payload.field === 'intentName') {
        tempState = state.setIn(['scenarioData', 'scenarioName'], action.payload.value);
        return tempState
          .updateIn(['intentData'], (x) => x.set(action.payload.field, action.payload.value));
      } else {
        tempState = state.updateIn(['scenarioData'], (x) => x.set(action.payload.field, ((action.payload.field === 'agent' || action.payload.field === 'domain') ? action.payload.value.split('~')[1] : action.payload.value)));
        return tempState
          .updateIn(['intentData'], (x) => x.set(action.payload.field, ((action.payload.field === 'agent' || action.payload.field === 'domain') ? action.payload.value.split('~')[1] : action.payload.value)));
      }
    case RESET_INTENT_DATA:
      return initialState;
    case TAG_ENTITY:
      const selectedText = state.get('windowSelection');
      if (selectedText !== '') {

        const start = action.payload.userSays.indexOf(selectedText);
        const end = start + selectedText.length;
        const value = action.payload.userSays.substring(start, end);

        let newState = null;
        slots = state.getIn(['scenarioData', 'slots']);
        const existingSlot = slots.filter((slot) => slot.entity === action.payload.entity);
        if (existingSlot.size === 0) {
          slots = state.getIn(['scenarioData', 'slots']);
          newState = state.updateIn(['scenarioData', 'slots'], (slots) => slots.push({
            slotName: action.payload.entityName,
            entity: action.payload.entity,
            isRequired: false,
            isList: false,
            textPrompts: [],
            useWebhook: false,
          }));
        } else {
          newState = state;
        }
        examples = newState.getIn(['intentData', 'examples']);
        examples = examples.map((example) => example.get('userSays') === action.payload.userSays ? example.update('entities', (synonyms) => synonyms.push({ value, entity: action.payload.entity, start, end })) : example);
        newState = newState.set('windowSelection', '');
        return newState
          .setIn(['intentData', 'examples'], examples);
      }
    case UNTAG_ENTITY:
      return state
        .updateIn(['intentData', 'examples'], (x) => x.push(fromJS({ value: action.example, synonyms: [action.example] })));
    case TOGGLE_FLAG:
      slots = state.getIn(['scenarioData', 'slots']);
      slots = slots.map((slot) => {
        if (slot.slotName === action.payload.slotName) {
          slot[action.payload.field] = action.payload.value;
        }
        return slot;
      });
      return state
        .setIn(['scenarioData', 'slots'], slots);
    case CHANGE_SLOT_NAME:
      slots = state.getIn(['scenarioData', 'slots']);
      slots = slots.map((slot) => {
        if (slot.slotName === action.payload.slotName) {
          slot.slotName = action.payload.value;
        }
        return slot;
      });
      return state
        .setIn(['scenarioData', 'slots'], slots);
    case ADD_TEXT_PROMPT:
      slots = state.getIn(['scenarioData', 'slots']);
      slots = slots.map((slot) => {
        if (slot.slotName === action.payload.slotName) {
          slot.textPrompts.push(action.payload.value);
        }
        return slot;
      });
      return state
        .setIn(['scenarioData', 'slots'], slots);
    case DELETE_TEXT_PROMPT:
      slots = state.getIn(['scenarioData', 'slots']);
      slots = slots.map((slot) => {
        if (slot.slotName === action.payload.slotName) {
          slot.textPrompts.splice(slot.textPrompts.indexOf(action.payload.textPrompt), 1);
        }
        return slot;
      });
      return state
        .setIn(['scenarioData', 'slots'], slots);
    case REMOVE_USER_SAYING:
      return state
        .setIn(['intentData', 'examples'], state.getIn(['intentData', 'examples']).splice(action.index, 1));
    case REMOVE_AGENT_RESPONSE:
      return state
        .setIn(['scenarioData', 'intentResponses'], state.getIn(['scenarioData', 'intentResponses']).splice(action.index, 1));
    case REMOVE_SLOT:
      return state
        .setIn(['scenarioData', 'slots'], state.getIn(['scenarioData', 'slots']).splice(action.index, 1));
    case SET_WINDOW_SELECTION:
      return state
        .set('windowSelection', action.selection);
    case LOAD_INTENT:
      return state
        .set('loading', true)
        .set('error', false);
    case LOAD_INTENT_SUCCESS:
      // TODO: need to check the scenario data how to load it
      return state
        .set('loading', false)
        .set('error', false)
        .set('intentData', fromJS(action.intent));
    case LOAD_INTENT_ERROR:
      return state
        .set('error', action.error)
        .set('loading', false);
    default:
      return state;
  }
}

export default intentReducer;
