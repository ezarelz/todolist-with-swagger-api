import AppProvider from './providers/AppProvider';
import LoginPage from './components/pages/login/Login';
import Home from './components/pages/home';

function App() {
  const token = localStorage.getItem('access_token');
  return <AppProvider>{token ? <Home /> : <LoginPage />}</AppProvider>;
}

export default App;
