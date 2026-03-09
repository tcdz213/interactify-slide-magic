import AppProviders from "./app/providers/AppProviders";
import AppRoutes from "./app/routes";

const App = () => (
  <AppProviders>
    <AppRoutes />
  </AppProviders>
);

export default App;
