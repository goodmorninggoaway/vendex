import React from 'react';
import { Header, Main, TitleBar, Page } from '../modules/layouts/Page';
import Congregations from '../modules/admin/congregations/Congregations';

const CongregationPage = () => (
  <Page>
    <Header>
      <TitleBar>Congregations</TitleBar>
    </Header>
    <Main>
      <Congregations />
    </Main>
  </Page>
);

export default CongregationPage;
