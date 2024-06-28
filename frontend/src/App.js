import React from "react";

import Quote from "./Quote";

import { Routes, Route } from 'react-router-dom';


class App extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Routes>
                <Route path="/:entity/:quoteId" element={<Quote {...this.props} />} />
            </Routes>
        )
    }
}

export default App;