import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'chat/' + crypto.randomUUID(),  
        pathMatch: 'full'
    },
    {
        path: 'chat/:id',
        component: Home
    },
    {
        path: '**',
        redirectTo: 'chat/' + crypto.randomUUID(),
        pathMatch: 'prefix'
    }
];
