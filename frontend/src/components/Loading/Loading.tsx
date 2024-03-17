import React, { ReactNode } from "react";
import './Loading.css';

class Loading extends React.Component {
    render(): ReactNode {
        return (
            <div className="loader"></div>
        )
    }
}

export default Loading;