import React from 'react';
import { DappUI, DappProvider } from '@elrondnetwork/dapp-core';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from 'components/Layout';
import PageNotFound from 'pages/PageNotFound';
import UnlockPage from 'pages/UnlockPage';
import { routeNames } from 'routes';
import routes from 'routes';
import '@elrondnetwork/dapp-core/build/index.css';
import { TIMEOUT } from 'utils';
import { ENVIRONMENT } from './config';
import 'react-toastify/dist/ReactToastify.css';

const {
  TransactionsToastList,
  SignTransactionsModals,
  NotificationModal,
} = DappUI;

const App = () => {
  return (
    <Router>
      <DappProvider
        environment={ENVIRONMENT}
        customNetworkConfig={{ name: 'customConfig', apiTimeout: TIMEOUT }}
        completedTransactionsDelay={200}
      >
        <Layout>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <TransactionsToastList />
          <NotificationModal />
          <SignTransactionsModals className='custom-class-for-modals' />
          <Routes>
            <Route
              path={routeNames.unlock}
              element={<UnlockPage loginRoute={routeNames.home} />}
            />
            {routes.map((route: any, index: number) => (
              <Route
                path={route.path}
                key={'route-key-' + index}
                element={<route.component />}
              />
            ))}
            <Route path="/" element={<Navigate replace to={routeNames.home} />} />
            <Route path='*' element={<PageNotFound />} />
          </Routes>
        </Layout>
      </DappProvider>
    </Router>
  );
};

export default App;
