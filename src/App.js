import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Landing from './Landing';
import AnnotationTool from './AnnotationTool';
import "./App.css";

function App() {

  return (
    <Router basename="/reachannot">
      <Switch>
        <Route exact path="/" component={Landing} />
        <Route path="/interface" component={AnnotationTool} />
      </Switch>
    </Router>
  );
}

export default App;
