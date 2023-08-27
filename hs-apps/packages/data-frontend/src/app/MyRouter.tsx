import { createBrowserRouter } from 'react-router-dom'
import React from 'react'
import { MainLayout } from '../core/MainLayout'
import { RouteErrorBoundary } from '@fangcha/react'
import { HomeView } from '../core/HomeView'
import { MyMenu } from './MyMenu'
import { TableListView } from '../views/table/TableListView'
import { TableDetailView } from '../views/table/TableDetailView'
import { DataPageView } from '../views/data/DataPageView'

export const MyRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout menu={MyMenu} />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: <HomeView />,
      },
      {
        path: '/v1/table',
        element: <TableListView />,
      },
      {
        path: '/v1/table/:tableId',
        element: <TableDetailView />,
      },
      {
        path: '/v1/table/:tableId/data',
        element: <DataPageView />,
      },
      {
        path: '*',
        element: <div>404 Not Found</div>,
      },
    ],
  },
])
