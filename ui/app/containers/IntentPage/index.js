import _ from 'lodash';
import React from 'react';
import Helmet from 'react-helmet';
import {
  Col,
  Input,
  Row,
} from 'react-materialize';
import { connect } from 'react-redux';
import Alert from 'react-s-alert';
import { createStructuredSelector } from 'reselect';
import ActionButton from '../../components/ActionButton';
import Content from '../../components/Content';
import ContentHeader from '../../components/ContentHeader';
import Form from '../../components/Form';
import FormTextInput from '../../components/FormTextInput';
import Header from '../../components/Header';
import InputLabel from '../../components/InputLabel';
import Preloader from '../../components/Preloader';
import Table from '../../components/Table';
import TableContainer from '../../components/TableContainer';
import TableHeader from '../../components/TableHeader';
import Toggle from '../../components/Toggle';

import {
  createIntent,
  loadAgentDomains,
  loadAgentEntities,
  resetStatusFlags,
  updateIntent,
} from '../App/actions';
import {
  makeSelectAgentDomains,
  makeSelectAgentEntities,
  makeSelectCurrentAgent,
  makeSelectError,
  makeSelectLoading,
  makeSelectScenario,
  makeSelectSuccess,
} from '../App/selectors';
import {
  addTextPrompt,
  changeIntentData,
  changeSlotName,
  deleteTextPrompt,
  loadIntent,
  removeAgentResponse,
  removeSlot,
  removeUserSaying,
  resetIntentData,
  setWindowSelection,
  tagEntity,
  toggleFlag
} from './actions';
import AvailableSlots from './Components/AvailableSlots';
import Responses from './Components/Responses';
import Slots from './Components/Slots';
import UserSayings from './Components/UserSayings';

import messages from './messages';
import {
  makeSelectIntentData,
  makeSelectScenarioData,
  makeSelectWindowSelection,
} from './selectors';

const returnFormattedOptions = (options) => options.map((option, index) => (
  <option key={index} value={option.value}>
    {option.text}
  </option>
));

const dirOfColors = {};

export class IntentPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.onChangeInput = this.onChangeInput.bind(this);
    this.setEditMode = this.setEditMode.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  state = {
    editMode: false,
  };

  componentDidMount() {
    this.setEditMode(this.props.route.name === 'intentEdit');
  }

  componentWillUpdate(nextProps) {
    const { currentAgent } = nextProps;
    if (currentAgent !== this.props.currentAgent) {
      this.props.onChangeIntentData('agent', `${currentAgent.id}~${currentAgent.agentName}`); // TODO: Remove this format and pass the entire object
    }
  }

  onChangeInput(evt, field) {
    let value;
    if (evt) {
      value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
    } else {
      value = null;
    }
    if (field === 'examples' || field === 'responses') {
      if (evt.charCode === 13 && !_.isEmpty(value)) { // If user hits enter add response
        if (field === 'responses') {
          this.lastAgentResponse.scrollIntoView(true);
        }
        this.props.onChangeIntentData(field, value);
        evt.target.value = null;
      }
      if (field === 'responses') {
        const dropDownButton = document.getElementById('intentResponseEntityDropdown');
        if (evt.charCode === 123) { // If user hits '{' display a menu with current slots
          dropDownButton.dispatchEvent(new Event('click'));
        }
        else {
          if (dropDownButton.getAttribute('class').split(' ').indexOf('active') > -1) {
            dropDownButton.dispatchEvent(new Event('click'));
          }
        }
      }
    } else {
      this.props.onChangeIntentData(field, value);
    }
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    if (this.props.route !== prevProps.route) {
      this.setEditMode(this.props.route.name === 'intentEdit');
    }
    if (this.props.success) {
      Alert.success(messages.successMessage.defaultMessage, {
        position: 'bottom'
      });
      this.props.onSuccess();
    }

    if (this.props.error) {
      Alert.error(this.props.error.message, {
        position: 'bottom'
      });
    }
  }

  setEditMode(isEditMode) {
    if (isEditMode) {
      this.setState({ editMode: true });
      this.props.onEditMode(this.props.params.id);
    } else {
      this.props.resetForm();
      this.setState({ editMode: false });
      const { currentAgent } = this.props;
      if (currentAgent) {
        this.props.onChangeIntentData('agent', `${currentAgent.id}~${currentAgent.agentName}`); // TODO: Remove this format and pass the entire object
      }
    }
  }

  submitForm(evt) {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    if (this.state.editMode) {
      this.props.onUpdate();
    } else {
      this.props.onCreate();
    }
  }

  render() {
    const { loading, error, success, intent, agentDomains, agentEntities, currentAgent } = this.props;
    const intentProps = {
      loading,
      error,
      success,
      intent,
    };

    let domainsSelect = [];
    if (agentDomains !== false) {
      domainsSelect = agentDomains.map((domain) => ({
        value: `${domain.id}~${domain.domainName}`,
        text: domain.domainName,
      }));
      domainsSelect.unshift({ value: 'default', text: 'Please choose a domain to place your intent', disabled: 'disabled' });
    }

    let breadcrumbs = [];
    if (currentAgent) {
      breadcrumbs = [
        { label: 'Agent' },
        { link: `/agent/${currentAgent.id}`, label: `${currentAgent.agentName}` },
        { link: `/intents`, label: 'Intents' },
        { label: '+ Create' }
      ];
    }
    else {
      breadcrumbs = [{ label: '+ Creating intents' },];
    }

    return (

      <div>
        <Col style={{ zIndex: 2, position: 'fixed', top: '50%', left: '45%' }} s={12}>
          {intentProps.loading ? <Preloader color='#00ca9f' size='big' /> : null}
        </Col>
        <Helmet
          title="Create Intent"
          meta={[
            { name: 'description', content: 'Create an intent' },
          ]}
        />
        <Header breadcrumbs={breadcrumbs} />
        <Content>
          <ContentHeader title={messages.createIntentTitle} subTitle={messages.createIntentDescription} />
          <Form>
            <Row>
              <Toggle
                label="Webhook"
                right
                onChange={(evt) => this.onChangeInput(evt, 'useWebhook')}
              />
            </Row>
            <Row>

              <Input
                s={12}
                type="select"
                label={messages.domain.defaultMessage}
                defaultValue={intent.domain ? intent.domain : 'default'}
                onChange={(evt) => this.onChangeInput(evt, 'domain')}
              >
                {returnFormattedOptions(domainsSelect)}
              </Input>
              <FormTextInput
                label={messages.intentName}
                placeholder={messages.intentNamePlaceholder.defaultMessage}
                value={intent.intentName}
                onChange={(evt) => this.onChangeInput(evt, 'intentName')}
                required
              />
              <FormTextInput
                label={messages.userSaysTitle}
                placeholder={messages.userSaysInput.defaultMessage}
                onKeyPress={(evt) => this.onChangeInput(evt, 'examples')}
                s={8}
              />
              <FormTextInput
                placeholder={messages.userSaysSearch.defaultMessage}
                s={4}
              />
            </Row>
          </Form>

          {intent.examples.length > 0 ?
            <TableContainer id="userSayingsTable" quotes>
              <Table>
                <UserSayings
                  examples={intent.examples}
                  onRemoveExample={this.props.onRemoveExample}
                  setWindowSelection={this.props.setWindowSelection}
                  onTagEntity={this.props.onTagEntity}
                  agentEntities={agentEntities}
                  dirOfColors={dirOfColors}
                />
              </Table>
            </TableContainer>
            : null
          }

          <Form style={{ marginTop: '0px' }}>
            <Row>
              <InputLabel text={messages.slots} />
            </Row>
          </Form>

          <TableContainer id="slotsTable">
            <Table>
              <TableHeader
                columns={[
                  {
                    width: '15%',
                    label: messages.slotNameTitle.defaultMessage,
                    tooltip: messages.slotNameTooltip.defaultMessage,
                  },
                  {
                    width: '15%',
                    label: messages.slotEntityTitle.defaultMessage,
                    tooltip: messages.slotEntityTitle.defaultMessage,
                  },
                  {
                    width: '10%',
                    label: messages.slotIsListTitle.defaultMessage,
                    tooltip: messages.slotIsListTitle.defaultMessage,
                  },
                  {
                    width: '15%',
                    label: messages.slotIsRequiredTitle.defaultMessage,
                    tooltip: messages.slotIsRequiredTitle.defaultMessage,
                  },
                  {
                    width: '45%',
                    label: messages.slotPromptTitle.defaultMessage,
                    tooltip: messages.slotPromptTitle.defaultMessage,
                  },
                ]}
              />
              <Slots
                slots={this.props.scenarioData.slots}
                onCheckboxChange={this.props.onCheckboxChange}
                onAddTextPrompt={this.props.onAddTextPrompt}
                onDeleteTextPrompt={this.props.onDeleteTextPrompt}
                onRemoveSlot={this.props.onRemoveSlot}
                onSlotNameChange={this.props.onSlotNameChange}
                onAddSlot={this.props.onAddSlot}
                agentEntities={agentEntities}
                dirOfColors={dirOfColors}
              />
            </Table>
          </TableContainer>

          <Form>
            <Row>
              <AvailableSlots
                slots={this.props.scenarioData.slots}
                agentEntities={agentEntities}
                onClickFunction={this.props.onAutoCompleteEntityFunction}
                dirOfColors={dirOfColors}
              />
              <FormTextInput
                id='responses'
                label={messages.agentResponsesTitle}
                placeholder={messages.responsesInput.defaultMessage}
                onKeyPress={(evt) => this.onChangeInput(evt, 'responses')}
              />
            </Row>
          </Form>

          {this.props.scenarioData.intentResponses.length > 0 ?
            <TableContainer id="intentResponsesTable" quotes>
              <Table>
                <Responses
                  intentResponses={this.props.scenarioData.intentResponses}
                  onRemoveResponse={this.props.onRemoveResponse}
                />
              </Table>
            </TableContainer>
            : null
          }
          <div
            style={{ float: 'left', clear: 'both' }}
            ref={(el) => {
              this.lastAgentResponse = el;
            }}
          >
          </div>
          {
            this.props.scenarioData.useWebhook ?
              <Form style={{ marginTop: '0px' }}>
                <Row>
                  <FormTextInput
                    label={messages.webhook}
                    placeholder={messages.webhookPlaceholder.defaultMessage}
                    value={this.props.scenarioData.webhookUrl}
                    onChange={(evt) => this.onChangeInput(evt, 'webhookUrl')}
                    required
                  />
                </Row>
              </Form>
              : null
          }

          <ActionButton label={this.state.editMode ? messages.editButton : messages.createButton} onClick={this.submitForm} />

        </Content>
      </div>
    );
  }
}

IntentPage.propTypes = {
  loading: React.PropTypes.bool,
  error: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
  intent: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
  scenario: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
  onChangeIntentData: React.PropTypes.func,
  onCreate: React.PropTypes.func,
  onUpdate: React.PropTypes.func,
  onTagEntity: React.PropTypes.func,
  onAutoCompleteEntityFunction: React.PropTypes.func,
  onCheckboxChange: React.PropTypes.func,
  onSlotNameChange: React.PropTypes.func,
  onAddTextPrompt: React.PropTypes.func,
  onDeleteTextPrompt: React.PropTypes.func,
  onRemoveSlot: React.PropTypes.func,
  onAddSlot: React.PropTypes.func,
  currentAgent: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
  agentDomains: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.bool,
  ]),
  agentEntities: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.bool,
  ]),
  onSuccess: React.PropTypes.func,
  resetForm: React.PropTypes.func,
  setWindowSelection: React.PropTypes.func,
  onEditMode: React.PropTypes.func,
};

export function mapDispatchToProps(dispatch) {
  return {
    onChangeIntentData: (field, value) => {
      dispatch(dispatch(resetStatusFlags()));
      if (field === 'agent') {
        dispatch(loadAgentDomains(value));
        dispatch(loadAgentEntities(value));
      }
      dispatch(changeIntentData({ value, field }));
    },
    onRemoveExample: (exampleIndex, evt) => {
      dispatch(removeUserSaying(exampleIndex));
    },
    onRemoveResponse: (responseIndex, evt) => {
      dispatch(removeAgentResponse(responseIndex));
    },
    onRemoveSlot: (slotIndex, evt) => {
      dispatch(removeSlot(slotIndex));
    },
    onAddSlot: (evt) => {

    },
    onTagEntity: (userSays, entity, entityName, evt) => {
      dispatch(dispatch(resetStatusFlags()));
      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
      dispatch(tagEntity({ userSays, entity, entityName }));
    },
    onCheckboxChange: (slotName, field, evt) => {
      dispatch(dispatch(resetStatusFlags()));
      dispatch(toggleFlag({ slotName, field, value: evt.target.checked }));
    },
    onSlotNameChange: (slotName, evt) => {
      dispatch(dispatch(resetStatusFlags()));
      dispatch(changeSlotName({ slotName, value: evt.target.value }));
    },
    onAddTextPrompt: (slotName, evt) => {
      dispatch(dispatch(resetStatusFlags()));
      if (evt.charCode === 13) {
        dispatch(addTextPrompt({ slotName, value: evt.target.value }));
        evt.target.value = null;
      }
    },
    onDeleteTextPrompt: (slotName, textPrompt, evt) => {
      dispatch(dispatch(resetStatusFlags()));
      dispatch(deleteTextPrompt({ slotName, textPrompt }));
    },
    onAutoCompleteEntityFunction: (entityName, evt) => {
      dispatch(dispatch(resetStatusFlags()));
      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
      let currentResponse = document.getElementById('responses').value;
      let positionOfEntity = currentResponse.lastIndexOf('{');
      document.getElementById('responses').value = currentResponse.substring(0, positionOfEntity) + `{${entityName}}`;
    },
    onCreate: () => {
      dispatch(createIntent());
    },
    onUpdate: () => {
      dispatch(updateIntent());
    },
    onSuccess: () => {
      dispatch(resetStatusFlags());
    },
    resetForm: () => {
      dispatch(resetIntentData());
    },
    setWindowSelection: (selection) => {
      dispatch(setWindowSelection(selection));
    },
    onEditMode: (intentId) => {
      dispatch(loadIntent(intentId));
    },
  };
}

const mapStateToProps = createStructuredSelector({
  intent: makeSelectIntentData(),
  scenario: makeSelectScenario(),
  scenarioData: makeSelectScenarioData(),
  windowSelection: makeSelectWindowSelection(),
  loading: makeSelectLoading(),
  error: makeSelectError(),
  success: makeSelectSuccess(),
  agentDomains: makeSelectAgentDomains(),
  agentEntities: makeSelectAgentEntities(),
  currentAgent: makeSelectCurrentAgent(),
});

export default connect(mapStateToProps, mapDispatchToProps)(IntentPage);
