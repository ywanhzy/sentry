import React from 'react';
import styled from '@emotion/styled';

import Button from 'app/components/button';
import {t} from 'app/locale';
import space from 'app/styles/space';

const handleRequestIntegration = async () => {
  // TODO MARCOS
  console.log('TODO');
};

// TODO Create the modal
// TODO pass in a onclick?
export const RequestIntegrationButton = () => {
  return (
    <StyledRequestIntegrationButton
      data-test-id="request-integration-button"
      onClick={() => handleRequestIntegration()}
      priority="primary"
      size="small"
    >
      {t('Request Installation')}
    </StyledRequestIntegrationButton>
  );
};

const StyledRequestIntegrationButton = styled(Button)`
  margin-left: ${space(1)};
`;

export default RequestIntegrationButton;
