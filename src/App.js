import React, { PureComponent } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import store from "./reducers";
import Options from "./components/Options";
import Script from "./components/Script";

class App extends PureComponent {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="flex flex-column flex-row-l justify-end f5">
            <Route path="/" component={Options} />
            <Route path="/" component={Script} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
