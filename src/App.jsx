import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Routes from "./routes/Routes";
import AuthMonitor from "./components/AuthMonitor";

function App() {
  return (
    <Router>
      <Routes/>
      <AuthMonitor />
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        ></Toaster>
    </Router>
  )
}

export default App
