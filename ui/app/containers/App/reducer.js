import { fromJS } from 'immutable';
import {
  ACTION_CANCELLED,
  CONVERSE,
  CONVERSE_ERROR,
  CONVERSE_SUCCESS,
  CREATE_AGENT,
  CREATE_AGENT_ERROR,
  CREATE_AGENT_SUCCESS,
  CREATE_DOMAIN,
  CREATE_DOMAIN_ERROR,
  CREATE_DOMAIN_SUCCESS,
  CREATE_ENTITY,
  CREATE_ENTITY_ERROR,
  CREATE_ENTITY_SUCCESS,
  CREATE_INTENT,
  CREATE_INTENT_ERROR,
  CREATE_INTENT_SUCCESS,
  CREATE_SCENARIO_ERROR,
  CREATE_SCENARIO_SUCCESS,
  CREATE_WEBHOOK,
  CREATE_WEBHOOK_ERROR,
  CREATE_WEBHOOK_SUCCESS,
  DELETE_AGENT,
  DELETE_AGENT_ERROR,
  DELETE_AGENT_SUCCESS,
  DELETE_DOMAIN,
  DELETE_DOMAIN_ERROR,
  DELETE_DOMAIN_SUCCESS,
  DELETE_ENTITY,
  DELETE_ENTITY_ERROR,
  DELETE_ENTITY_SUCCESS,
  DELETE_INTENT,
  DELETE_INTENT_ERROR,
  DELETE_INTENT_SUCCESS,
  LOAD_AGENT_DOMAINS,
  LOAD_AGENT_DOMAINS_ERROR,
  LOAD_AGENT_DOMAINS_SUCCESS,
  LOAD_AGENT_ENTITIES,
  LOAD_AGENT_ENTITIES_ERROR,
  LOAD_AGENT_ENTITIES_SUCCESS,
  LOAD_AGENTS,
  LOAD_AGENTS_SUCCESS,
  LOAD_CURRENT_AGENT_SUCCESS,
  LOAD_DOMAINS_INTENTS,
  LOAD_DOMAINS_INTENTS_ERROR,
  LOAD_DOMAINS_INTENTS_SUCCESS,
  RESET_AGENT_DOMAINS,
  RESET_CURRENT_AGENT,
  RESET_DOMAINS_INTENTS,
  RESET_STATUS_FLAGS,
  SELECT_CURRENT_AGENT,
  SET_IN_WIZARD,
  UPDATE_AGENT,
  UPDATE_AGENT_ERROR,
  UPDATE_AGENT_SUCCESS,
  UPDATE_DOMAIN,
  UPDATE_DOMAIN_ERROR,
  UPDATE_DOMAIN_SUCCESS,
  UPDATE_ENTITY,
  UPDATE_ENTITY_ERROR,
  UPDATE_ENTITY_SUCCESS,
  UPDATE_INTENT,
  UPDATE_INTENT_ERROR,
  UPDATE_INTENT_SUCCESS
} from './constants';

// The initial state of the App
const initialState = fromJS({
  loading: false,
  error: false,
  success: false,
  loadingConversation: false,
  currentAgent: false,
  agents: false,
  agentDomains: false,
  agentEntities: false,
  domainIntents: false,
  conversation: [],
  agent: undefined,
});

function appReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_AGENTS:
      return state
        .set('loading', true)
        .set('error', false)
        .set('agents', false);
    case SELECT_CURRENT_AGENT :
      return state
        .set('loading', false)
        .set('error', false)
        .set('currentAgent', action.agent);
    case LOAD_CURRENT_AGENT_SUCCESS:
      return state
        .set('loading', false)
        .set('error', false)
        .set('currentAgent', action.agent);
    case RESET_CURRENT_AGENT:
      return state
        .set('loading', false)
        .set('error', false)
        .set('currentAgent', false);
    case LOAD_AGENTS_SUCCESS:
      return state
        .set('agents', action.data)
        .set('loading', false);
    case LOAD_AGENT_DOMAINS:
      return state
        .set('loading', true)
        .set('error', false)
        .set('agentDomains', false);
    case LOAD_AGENT_DOMAINS_SUCCESS:
      return state
        .set('agentDomains', action.data)
        .set('loading', false);
    case LOAD_AGENT_DOMAINS_ERROR:
      return state
        .set('error', action.error)
        .set('loading', false);
    case RESET_AGENT_DOMAINS:
      return state
        .set('loading', false)
        .set('error', false)
        .set('agentDomains', false);
    case LOAD_AGENT_ENTITIES:
      return state
        .set('loading', true)
        .set('error', false)
        .set('agentEntities', false);
    case LOAD_AGENT_ENTITIES_SUCCESS:
      return state
        .set('agentEntities', action.data)
        .set('loading', false);
    case LOAD_AGENT_ENTITIES_ERROR:
      return state
        .set('error', action.error)
        .set('loading', false);
    case CREATE_AGENT:
      return state
        .set('loading', true)
        .set('error', false)
        .set('agent', false);
    case CREATE_AGENT_SUCCESS:
      return state
        .set('loading', false)
        .set('error', false)
        .set('success', true)
        .set('currentAgent', action.agent);
    case CREATE_AGENT_ERROR:
      return state
        .set('error', action.error)
        .set('success', false)
        .set('loading', false);
    case CREATE_DOMAIN:
      return state
        .set('loading', true)
        .set('error', false)
        .set('success', false);
    case CREATE_DOMAIN_SUCCESS:
      return state
        .set('loading', false)
        .set('error', false)
        .set('success', true);
    case CREATE_DOMAIN_ERROR:
      return state
        .set('error', action.error)
        .set('success', false)
        .set('loading', false);
    case CREATE_WEBHOOK:
      return state
        .set('loading', true)
        .set('error', false);
    case CREATE_WEBHOOK_SUCCESS:
      return state
        .set('loading', false)
        .set('success', true)
        .set('error', false);
    case CREATE_WEBHOOK_ERROR:
      return state
        .set('error', action.error)
        .set('success', false)
        .set('loading', false);
    case CREATE_INTENT:
      return state
        .set('loading', true)
        .set('error', false);
    case CREATE_INTENT_SUCCESS:
      return state
        .set('loading', false)
        .set('success', true)
        .set('error', false);
    case CREATE_INTENT_ERROR:
      return state
        .set('error', action.error)
        .set('success', false)
        .set('loading', false);
    case CREATE_SCENARIO_SUCCESS:
      return state
        .set('loading', false)
        .set('success', true)
        .set('error', false);
    case CREATE_SCENARIO_ERROR:
      return state
        .set('error', action.error)
        .set('success', false)
        .set('loading', false);
    case CREATE_ENTITY:
      return state
        .set('loading', true)
        .set('error', false);
    case CREATE_ENTITY_SUCCESS:
      return state
        .set('loading', false)
        .set('success', true)
        .set('error', false);
    case CREATE_ENTITY_ERROR:
      return state
        .set('error', action.error)
        .set('success', false)
        .set('loading', false);
    case CONVERSE:
      return state
        .set('loadingConversation', true)
        .update('conversation', (conversation) => conversation.push({ message: action.payload.message, author: 'user' }));
    case CONVERSE_SUCCESS:
      return state
        .set('loadingConversation', false)
        .update('conversation', (conversation) => conversation.push({
          message: action.data.textResponse,
          author: 'agent',
        }));
    case CONVERSE_ERROR:
      return state
        .set('loadingConversation', false)
        .update('conversation', (conversation) => conversation.push({
          message: 'I\'m sorry! I\'m having issues connecting with my brain. Can you retry later',
          author: 'agent',
        }));
    case LOAD_DOMAINS_INTENTS:
      return state
        .set('loading', true)
        .set('error', false)
        .set('domainIntents', false);
    case RESET_DOMAINS_INTENTS:
      return state
        .set('loading', false)
        .set('error', false)
        .set('domainIntents', false);
    case LOAD_DOMAINS_INTENTS_SUCCESS:
      return state
        .set('domainIntents', action.data)
        .set('loading', false);
    case LOAD_DOMAINS_INTENTS_ERROR:
      return state
        .set('error', action.error)
        .set('loading', false);
    case ACTION_CANCELLED:
      return state
        .set('message', action.message)
        .set('loading', false);
    case DELETE_DOMAIN:
      return state
        .set('loading', true)
        .set('error', false);
    case DELETE_DOMAIN_SUCCESS:
      return state
        .set('loading', false)
        .set('error', false);
    case DELETE_DOMAIN_ERROR:
      return state
        .set('loading', false)
        .set('error', action.error);
    case DELETE_INTENT:
      return state
        .set('loading', true)
        .set('error', false);
    case DELETE_INTENT_SUCCESS:
      return state
        .set('loading', false)
        .set('error', false);
    case DELETE_INTENT_ERROR:
      return state
        .set('loading', false)
        .set('error', action.error);
    case DELETE_AGENT:
      return state
        .set('loading', true)
        .set('error', false);
    case DELETE_AGENT_SUCCESS:
      return state
        .set('loading', false)
        .set('error', false);
    case DELETE_AGENT_ERROR:
      return state
        .set('loading', false)
        .set('error', action.error);
    case DELETE_ENTITY:
      return state
        .set('loading', true)
        .set('error', false);
    case DELETE_ENTITY_SUCCESS:
      return state
        .set('loading', false)
        .set('error', false);
    case DELETE_ENTITY_ERROR:
      return state
        .set('loading', false)
        .set('error', action.error);
    case RESET_STATUS_FLAGS:
      return state
        .set('loading', false)
        .set('error', false)
        .set('success', false);
    case SET_IN_WIZARD:
      return state
        .set('inWizard', action.value);
    case UPDATE_AGENT:
      return state
        .set('loading', true)
        .set('error', false)
        .set('agent', false);
    case UPDATE_AGENT_SUCCESS:
      return state
        .set('loading', false)
        .set('error', false)
        .set('success', true)
        .set('currentAgent', action.agent);
    case UPDATE_AGENT_ERROR:
      return state
        .set('error', action.error)
        .set('success', false)
        .set('loading', false);
    case UPDATE_DOMAIN:
      return state
        .set('loading', true)
        .set('error', false);
    case UPDATE_DOMAIN_SUCCESS:
      return state
        .set('loading', false)
        .set('error', false)
        .set('success', true);
    case UPDATE_DOMAIN_ERROR:
      return state
        .set('error', action.error)
        .set('success', false)
        .set('loading', false);
    case UPDATE_INTENT:
      return state
        .set('loading', true)
        .set('error', false);
    case UPDATE_INTENT_SUCCESS:
      return state
        .set('loading', false)
        .set('error', false)
        .set('success', true);
    case UPDATE_INTENT_ERROR:
      return state
        .set('error', action.error)
        .set('success', false)
        .set('loading', false);
    case UPDATE_ENTITY:
      return state
        .set('loading', true)
        .set('error', false);
    case UPDATE_ENTITY_SUCCESS:
      return state
        .set('loading', false)
        .set('error', false)
        .set('success', true);
    case UPDATE_ENTITY_ERROR:
      return state
        .set('error', action.error)
        .set('success', false)
        .set('loading', false);
    default:
      return state;
  }
}

export default appReducer;
