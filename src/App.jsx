import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Routes from "./routes/Routes"

function App() {
  return (
    <Router>
      <Routes/>
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
