import Home from './Components/Home';
import Deposit from './Components/Deposit';
import Loan from './Components/Loan';
import Withdraw from './Components/Withdraw';

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

export const WithdrawRoute = {
    path: '/withdraw',
    name: 'Withdraw',
    component: Withdraw
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
    },
    {
        path: '/withdraw',
        component: Withdraw,
        exact: true
    }
];

export default routes;