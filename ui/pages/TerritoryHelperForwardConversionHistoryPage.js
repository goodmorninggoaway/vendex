import React from 'react';
import { Header, Main, PreTitle, Title, Page } from '../modules/layouts/Page';
import ConversionHistory from '../modules/territoryHelper/convertForward/ConversionHistory';

export default () => (
  <Page>
    <Header>
      <PreTitle>Territory Helper</PreTitle>
      <Title>Conversion History</Title>
    </Header>
    <Main>
      <ConversionHistory />
    </Main>
  </Page>
);
