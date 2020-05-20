import React from 'react';
import styled from '@emotion/styled';

import {addErrorMessage} from 'app/actionCreators/indicator';
import {openModal} from 'app/actionCreators/modal';
import AsyncComponent from 'app/components/asyncComponent';
import Button from 'app/components/button';
import {t, tct} from 'app/locale';
import space from 'app/styles/space';
import InputField from 'app/views/settings/components/forms/inputField';
import TextBlock from 'app/views/settings/components/text/textBlock';

// TODO expand
type Props = AsyncComponent['props'];
type State = AsyncComponent['state'];

/**
 * TODO 0.5 describe
 * TODO 4.0 get the organization, current user from the API
 * TODO 5.0 Make this a component to capture optional text field as state.
 */
const RequestIntegrationModalContent = ({Header, Body, Footer, closeModal}) => (
  <div>
    <Header>
      <h4>{t('TODO 3.3 Request Installation')}</h4>
    </Header>
    <Body>
      <TextBlock>
        {/* TODO read this from a file? */}
        {t(
          "TODO 3.4 I'm baby woke pork belly sustainable post-ironic vinyl la croix chia stumptown bespoke echo park literally affogato taxidermy health goth keytar. Pickled tilde franzen PBR&B, typewriter portland meditation mixtape copper mug affogato. Franzen bicycle rights you probably haven't heard of them adaptogen butcher cardigan. Vexillologist enamel pin fingerstache, narwhal kickstarter celiac palo santo poke skateboard chartreuse tumblr cronut venmo squid. Kickstarter keffiyeh distillery, meggings heirloom pop-up occupy echo park fam quinoa bicycle rights literally semiotics. Small batch stumptown raw denim snackwave iPhone enamel pin la croix kale chips craft beer keytar hashtag farm-to-table ugh humblebrag."
        )}
      </TextBlock>
      <TextBlock>
        {tct('An email will be sent to [email] with your request.', {
          email: 'TODO EMAIL',
        })}
      </TextBlock>
      <InputField
        inline={false}
        flexibleControlStateSize
        stacked
        label="countLabel"
        name="message"
        type="string"
        onChange={val => {
          console.log('val', val);
        }}
        placeholder={t('TODO 3.5 Optional message')}
      />
    </Body>
    <Footer>
      {/* TODO 5.1 this button should also have state when it's sending. */}
      <Button onClick={() => sendRequest('FROM', 'TO', closeModal)}>
        {t('Send Request')}
      </Button>
    </Footer>
  </div>
);

const StyledRequestIntegrationButton = styled(Button)`
  margin-left: ${space(1)};
`;

class RequestIntegrationButton extends AsyncComponent<Props, State> {
  constructor(props: Props, context) {
    super(props, context);

    this.state = {
      isOpen: false,
      isSent: false,
      message: '',
      ...this.getDefaultState(),
    };
  }

  getEndpoints() {
    return [['organizations', '/organizations/?owner=1'] as [string, string]];
  }

  /**
   * Send a request to the backend.
   * @param {String} from
   * @param {String} to
   */
  sendRequest = (organization: any, integration: any, callback: Function) => {
    const path = `organizations/${organization.slug}/integrations/${integration.id}/request`;
    this.api
      .requestPromise(path, {
        method: 'POST',
        data: {message: this.state.message},
      })
      .then(
        () => this.setState({isSent: true}),
        () => addErrorMessage('Error sending the request')
      );
    callback();
  };

  openRequestModal() {
    this.setState({isOpen: true});
    openModal(RequestIntegrationModalContent, {
      onClose: () => this.setState({isOpen: false}),
    });
  }

  renderBody() {
    const {isOpen, isSent} = this.state;

    let buttonText;
    if (isOpen) {
      buttonText = 'Requesting Installation';
    } else if (isSent) {
      buttonText = 'Installation Requested';
    } else {
      buttonText = 'Request Installation';
    }

    return (
      <StyledRequestIntegrationButton
        data-test-id="request-integration-button"
        disabled={isOpen || isSent}
        onClick={() => this.openRequestModal()}
        priority="primary"
        size="small"
      >
        {t(buttonText)}
      </StyledRequestIntegrationButton>
    );
  }
}

export default RequestIntegrationButton;
