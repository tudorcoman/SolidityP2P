import Home from './Components/Home';
import Deposit from './Components/Deposit';
import Loan from './Components/Loan';

export const HomeRoute = {
    path: '/',
    name: 'Home',
    component: Home
};

export const DepositRoute = {
    path: '/deposit',
    name: 'Deposit',
    component: Deposit
};

export const LoanRoute = {
    path: '/loan',
    name: 'Loan',
    component: Deposit
};

const routes = [
    {
        path: '/',
        component: Home,
        exact: true
    },
    {
        path: '/deposit',
        component: Deposit,
        exact: true
    },
    {
        path: '/loan',
        component: Loan,
        exact: true
    }
];

export default routes;