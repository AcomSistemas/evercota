import React from "react";

class LoadingGif extends React.Component {

    render() {
        return ( 
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#00000000',
                zIndex: '100',
            }} >
                <img style={{

                    width: '100px',
                    height: '100px',
                    margin: 'auto',
                }} src="https://www.superiorlawncareusa.com/wp-content/uploads/2020/05/loading-gif-png-5.gif" alt="Carregando..." />
            </div>
        )
    }
}

export default LoadingGif