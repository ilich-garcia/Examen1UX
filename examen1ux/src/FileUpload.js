import React, { Component } from 'react';

class FileUpload extends Component {
    constructor() {
        super();

        this.state = {
            uploadValue: 0
        };
    }

    render() {
        return (
            <div>
                <input type="file" onChange={this.props.onUpload}/>
                <br />
                <img width="320" src={this.state.picture} alt=""/>
            </div>
        )
    }
}

export default FileUpload;