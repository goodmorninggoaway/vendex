import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from "axios-mock-adapter";
import Step from '../../layouts/wizard/Step';
import PreImport from './PreImport';

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

beforeAll(() => mock.reset());

describe('PreImport', () => {

  it('should insert new integrations', async () => {
    // Start from a clean slate. Nothing has been imported before.
    // We're importing 4 addresses for 3 different accounts.
    mock.onPost('/alba/ALBA/location-import/analyze').reply(200, {
      "congregationIntegrationAnalysis": [
          {
              "account": "Carolina Pines Tagalog",
              "enabled": false,
              "language": "*",
              "matchCount": "1"
          },
          {
              "account": "Carolina Pines Tagalog",
              "enabled": false,
              "language": "Tagalog",
              "matchCount": "1"
          },
          {
              "account": "Cary Russian",
              "enabled": false,
              "language": "*",
              "matchCount": "1"
          },
          {
              "account": "Cary Russian",
              "enabled": false,
              "language": "Russian",
              "matchCount": "1"
          },
          {
              "account": "Old Apex Spanish",
              "enabled": false,
              "language": "*",
              "matchCount": "2"
          },
          {
              "account": "Old Apex Spanish",
              "enabled": false,
              "language": "English",
              "matchCount": "1"
          },
          {
              "account": "Old Apex Spanish",
              "enabled": false,
              "language": "Spanish",
              "matchCount": "1"
          }
      ],
      "id": 1,
      "payload": [
          {
              "City": "Cary",
              "Kind": "Foreign-language",
              "Notes": "",
              "Suite": "",
              "Status": "",
              "Account": "Cary Russian",
              "Address": "102 Equestrian Ct",
              "Country": "USA",
              "Language": "Russian",
              "Province": "NC",
              "Address_ID": "21663742",
              "Postal_code": "27513"
          },
          {
              "City": "Cary",
              "Kind": "Foreign-language",
              "Notes": "",
              "Suite": "",
              "Status": "",
              "Account": "Old Apex Spanish",
              "Address": "204 Woodstar Dr.",
              "Country": "USA",
              "Language": "English",
              "Province": "NC",
              "Address_ID": "19897888",
              "Postal_code": "27511"
          },
          {
              "City": "Cary",
              "Kind": "Foreign-language",
              "Notes": "",
              "Suite": "",
              "Status": "",
              "Account": "Old Apex Spanish",
              "Address": "103 Norham Dr.",
              "Country": "USA",
              "Language": "Spanish",
              "Province": "NC",
              "Address_ID": "20429813",
              "Postal_code": "27513"
          },
          {
              "City": "Apex",
              "Kind": "Foreign-language",
              "Notes": "",
              "Suite": "",
              "Status": "",
              "Account": "Carolina Pines Tagalog",
              "Address": "1605 Squaw Walden Ln.",
              "Country": "USA",
              "Language": "Tagalog",
              "Province": "NC",
              "Address_ID": "20161899",
              "Postal_code": "27523"
          }
      ],
      "rowCount": 4,
      "createTimestamp": "2024-01-01T00:00:00.000Z",
      "congregationId": 1,
      "version": 1,
      "userId": 1,
      "pendingLocationDeletions": null,
      "summary": null,
      "source": "ALBA"
    });
  
    // No previously imported accounts
    mock.onGet('/alba/integrations?source=ALBA').reply(200, []);
  
    var steps = [
      {
        id: 'prepare',
        name: 'Choose Congregations & Languages',
        render: props => <PreImport congregationId={1} {...props} />,
      },
      {
        id: 'dummy',
        name: 'Dummy',
        render: props => {}
      }
    ]
  
    render(
      <Step
      {...steps[0]}
      steps={steps}
      nextStep={steps[1]}
      index={0}
      match={{ url: '' }}
      history={{ push: jest.fn() }}
    />
    )
  
    await new Promise((r) => setTimeout(r, 500));

    // Let's select all languages from one account, one of two from another, and none from one
    // console.log(screen.getByRole('checkbox', { name: /^Cary Russian/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /^Cary Russian/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /^Spanish/ }));
  
    mock.onPost('/alba/integrations', {"source":"ALBA","account":"Cary Russian","language":"*","anyLanguage":true})
      .reply(200);
    mock.onPost('/alba/integrations', {"source":"ALBA","account":"Old Apex Spanish","language":"Spanish","anyLanguage":false})
      .reply(200);

    // Reset request history so we can track only requests triggered by the Next button
    mock.resetHistory();

    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).toBeEnabled();
  
    fireEvent.click(nextButton);

    await new Promise((r) => setTimeout(r, 500));

    expect(mock.history.post.length).toBe(2);
    expect(mock.history.delete.length).toBe(0);
  });


  it('should not add or remove integrations when pre-selections remain unchanged', async () => {
    // Simulate a scenario where we've previously imported addresses for three accounts
    // but are now importing for only one of them.
    mock.onPost('/alba/ALBA/location-import/analyze').reply(200, {
      "congregationIntegrationAnalysis": [
        {
            "account": "Carolina Pines Tagalog",
            "enabled": true,
            "language": "*",
            "matchCount": "0"
        },
        {
            "account": "Cary Russian",
            "enabled": true,
            "language": "*",
            "matchCount": "1"
        },
        {
            "account": "Cary Russian",
            "enabled": false,
            "language": "Russian",
            "matchCount": "1"
        },
        {
            "account": "Old Apex Spanish",
            "enabled": true,
            "language": "Spanish",
            "matchCount": "0"
        },
      ],
      "id": 1,
      "payload": [
          {
              "City": "Cary",
              "Kind": "Foreign-language",
              "Notes": "",
              "Suite": "",
              "Status": "",
              "Account": "Cary Russian",
              "Address": "102 Equestrian Ct",
              "Country": "USA",
              "Language": "Russian",
              "Province": "NC",
              "Address_ID": "21663742",
              "Postal_code": "27513"
          }
      ],
      "rowCount": 1,
      "createTimestamp": "2024-01-01T00:00:00.000Z",
      "congregationId": 1,
      "version": 1,
      "userId": 1,
      "pendingLocationDeletions": null,
      "summary": null,
      "source": "ALBA"
    });
  
    // Return 3 previously imported accounts
    mock.onGet('/alba/integrations?source=ALBA').reply(200, [
      {
          "albaIntegrationId": 1,
          "congregationId": 1,
          "account": "Carolina Pines Tagalog",
          "language": "*",
          "source": "ALBA",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": null
      },
      {
          "albaIntegrationId": 2,
          "congregationId": 1,
          "account": "Cary Russian",
          "language": "*",
          "source": "ALBA",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": null
      },
      {
          "albaIntegrationId": 3,
          "congregationId": 1,
          "account": "Old Apex Spanish",
          "language": "Spanish",
          "source": "ALBA",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": null
      }
    ]);
  
    var steps = [
      {
        id: 'prepare',
        name: 'Choose Congregations & Languages',
        render: props => <PreImport congregationId={1} {...props} />,
      },
      {
        id: 'dummy',
        name: 'Dummy',
        render: props => {}
      }
    ]
  
    render(
      <Step
      {...steps[0]}
      steps={steps}
      nextStep={steps[1]}
      index={0}
      match={{ url: '' }}
      history={{ push: jest.fn() }}
    />
    )
  
    await new Promise((r) => setTimeout(r, 500));

    // Reset request history so we can track only requests triggered by the Next button
    mock.resetHistory();
  
    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).toBeEnabled();
  
    // We should not need to mock any integration calls since we didn't change any of the pre-selections
    fireEvent.click(nextButton);

    expect(mock.history.post.length).toBe(0);
    expect(mock.history.delete.length).toBe(0);
  });


  it('should remove unselected integrations that were pre-selected', async () => {
    // Simulate a scenario where we've previously imported addresses for three accounts
    // but are now importing for only one of them.
    mock.onPost('/alba/ALBA/location-import/analyze').reply(200, {
      "congregationIntegrationAnalysis": [
        {
            "account": "Carolina Pines Tagalog",
            "enabled": true,
            "language": "*",
            "matchCount": "0"
        },
        {
            "account": "Cary Russian",
            "enabled": true,
            "language": "*",
            "matchCount": "1"
        },
        {
            "account": "Cary Russian",
            "enabled": false,
            "language": "Russian",
            "matchCount": "1"
        },
        {
            "account": "Old Apex Spanish",
            "enabled": true,
            "language": "Spanish",
            "matchCount": "0"
        },
      ],
      "id": 1,
      "payload": [
          {
              "City": "Cary",
              "Kind": "Foreign-language",
              "Notes": "",
              "Suite": "",
              "Status": "",
              "Account": "Cary Russian",
              "Address": "102 Equestrian Ct",
              "Country": "USA",
              "Language": "Russian",
              "Province": "NC",
              "Address_ID": "21663742",
              "Postal_code": "27513"
          }
      ],
      "rowCount": 1,
      "createTimestamp": "2024-01-01T00:00:00.000Z",
      "congregationId": 1,
      "version": 1,
      "userId": 1,
      "pendingLocationDeletions": null,
      "summary": null,
      "source": "ALBA"
    });
  
    // Return 3 previously imported accounts
    mock.onGet('/alba/integrations?source=ALBA').reply(200, [
      {
          "albaIntegrationId": 1,
          "congregationId": 1,
          "account": "Carolina Pines Tagalog",
          "language": "*",
          "source": "ALBA",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": null
      },
      {
          "albaIntegrationId": 2,
          "congregationId": 1,
          "account": "Cary Russian",
          "language": "*",
          "source": "ALBA",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": null
      },
      {
          "albaIntegrationId": 3,
          "congregationId": 1,
          "account": "Old Apex Spanish",
          "language": "Spanish",
          "source": "ALBA",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": null
      }
    ]);
  
    var steps = [
      {
        id: 'prepare',
        name: 'Choose Congregations & Languages',
        render: props => <PreImport congregationId={1} {...props} />,
      },
      {
        id: 'dummy',
        name: 'Dummy',
        render: props => {}
      }
    ]
  
    render(
      <Step
      {...steps[0]}
      steps={steps}
      nextStep={steps[1]}
      index={0}
      match={{ url: '' }}
      history={{ push: jest.fn() }}
    />
    )
  
    await new Promise((r) => setTimeout(r, 500));

    // Let's unselect the accounts we don't want to import
    fireEvent.click(screen.getByRole('checkbox', { name: /^Carolina Pines Tagalog/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /^Spanish/ }));
  
    mock.onDelete('/alba/integrations/1').reply(200);
    mock.onDelete('/alba/integrations/3').reply(200);

    // Reset request history so we can track only requests triggered by the Next button
    mock.resetHistory();
  
    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).toBeEnabled();
  
    // We should not need to mock any integration calls since we didn't change any of the pre-selections
    fireEvent.click(nextButton);

    await new Promise((r) => setTimeout(r, 500));

    expect(mock.history.post.length).toBe(0);
    expect(mock.history.delete.length).toBe(2);
  });
});