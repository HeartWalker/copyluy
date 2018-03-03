import React from './React';


class App extends React.Component {
    constructor(props) {
        super()

        // setInterval(() => {
        //   this.setState()
        // }, 1000);
    }
    render() {
        return (
            <div>
                <div style={{ background: 'rgba(120,120,120,0.3)', color: 'white' }}>
                    it works!
                </div>
            </div>
        )
    }
}

React.render(
    <App />,
    document.getElementById('root')
);