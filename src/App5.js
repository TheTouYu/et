// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import AppSet from './AppSet';
import Preview from './Preview';

const App = () => {
  return (
    <Router>

        <nav>
              <NavLink to="/">首页</NavLink><span>|</span>
              <NavLink to="/preview">预览页</NavLink>
        </nav>

        <Routes>
          <Route exact path="/" Component={AppSet} />
          <Route path="/preview" element={Preview} />
        </Routes>

    </Router>
  );
};

function Test(){
    return (
        <h1>Text</h1>
    );
}
export default App;
