import { NextPageContext } from 'next';
import App from 'next/app';
import Head from 'next/head';
import withRedux from 'next-redux-wrapper';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.css';

import '../styles/globals.css';
import store, { Store } from '../store';
import Navbar from '../components/layout/Navbar';
import { AuthProtectRoute } from '../components/common/AuthProtectRoute';
import Sidebar from '../components/layout/Sidebar';
import PreFetch from '../components/common/PreFetch';
import RoleProtectRoute from '../components/common/RoleProtectRoute';

interface AppContext extends NextPageContext {
  store: Store;
}

class MyApp extends App<AppContext> {
  constructor(props) {
    super(props);
  }

  render() {
    const { store, Component, ...props } = this.props;

    return (
      <>
        <Provider store={store}>
          <ToastContainer
            position='top-right'
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            draggable={false}
            pauseOnHover
            closeOnClick
          />
          <AuthProtectRoute>
            <Head>
              <script src="https://js.pusher.com/7.0.3/pusher.min.js"></script>
            </Head>
            <Navbar />
            <div className='pt-16 h-screen flex flex-col'>
              <RoleProtectRoute>
                <PreFetch defaultProps={props} Component={Component} />
              </RoleProtectRoute>
            </div>
          </AuthProtectRoute>
        </Provider>
      </>
    );
  }
}

export default withRedux(store)(MyApp);
