import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/home/Home';
import Email from './components/email/Email';
import Map from './components/map/Map'
import Mapping from './components/map/Mapping'
import Date from './components/date/Date';
import Verification from './components/verification/Verification';
import Admin from './components/dashboard/Admin';
import PrivateRoute from './components/dashboard/PrivateRoute';
import Appointment from './components/dashboard/tables.js/Appointment';
import MapViewContainer from './components/dashboard/tables.js/MapViewContainer';


function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Home/>}></Route>
    <Route path="/email" element={<Email/>}></Route>
    <Route path="/map" element={<Map/>}></Route>
    <Route path="/mapping" element={<Mapping/>}></Route>
    <Route path='/date' element={<Date/>}></Route>
    <Route path='/verification' element={<Verification/>}></Route>
    <Route path='/admin' element={<Admin/>}></Route>
    <Route path='/appointment' element={<PrivateRoute showOptions={false}><Appointment/></PrivateRoute>}></Route>
    </Routes>
    </BrowserRouter>
    
    
    </>
  );
}

export default App;
