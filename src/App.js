import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './Components/Layout';
import routes from './RouteNames'; 

import { Route, Routes } from 'react-router-dom';

import './Styles/Variables.css';
import { WalletProvider } from './Blockchain/Context';

function App() {
  return (
    <WalletProvider>
      <Layout>
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={<route.component />}
            />
          ))} 
        </Routes>
      </Layout>
    </WalletProvider>
  );
}

export default App;
