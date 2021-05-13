import React from 'react';
import ReactDOM from 'react-dom';
import {SearchApp, registry} from '@eeacms/search';
import reportWebVitals from './reportWebVitals';
import installDemo from './demo';

import '@elastic/react-search-ui-views/lib/styles/styles.css';

// import './index.css';
// import './semantic-ui.less';

const demoRegistry = installDemo(registry);

ReactDOM.render(
  <React.StrictMode>
    <SearchApp registry={demoRegistry} appName="wise" />,
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
