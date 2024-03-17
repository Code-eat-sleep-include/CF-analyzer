import React, { ReactNode } from "react";
import './Error.css';

class ErrorComponent extends React.Component <any, any> {

    render(): ReactNode {
        return (
            <div className="errorModal">
                {this.props.code === 400 ? 'User not found, please make sure the handle is correct!' : 'We ran into some unexpected error, please check you credentials and try again.'}
            </div>
        )
    }
}

export default ErrorComponent