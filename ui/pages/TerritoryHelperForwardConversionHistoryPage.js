import React from 'react';
import { Header, Main, Page, TitleBar } from '../modules/layouts/Page';
import ConversionHistory from '../modules/territoryHelper/convertForward/ConversionHistory';

export default () => (
  <Page>
    <Header>
      <TitleBar>Territory Helper Conversion History</TitleBar>
    </Header>
    <Main>
      <ConversionHistory />
    </Main>
  </Page>
);
