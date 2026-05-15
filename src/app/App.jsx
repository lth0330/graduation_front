import { RouterProvider } from 'react-router-dom';
import { ApartmentManagerProvider } from '../contexts/ApartmentManagerContext.jsx';
import { WebAdminProvider } from '../contexts/WebAdminContext.jsx';
import { router } from './routes.jsx';

export default function App() {
  return (
    <WebAdminProvider>
      <ApartmentManagerProvider>
        <RouterProvider router={router} />
      </ApartmentManagerProvider>
    </WebAdminProvider>
  );
}
