import React from "react";

import { Alert, Snackbar, Typography } from "@mui/material";

class SnackbarAlert extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            open: this.props.open,
            sxParams: {
                '& .MuiAlert-icon': {
                    color: 'white',
                    alignSelf: 'center',
                    fontSize: '24px'
                },
                '& .MuiTypography-root': {
                    color: 'white',
                    fontWeight: '500'
                },
                '& .MuiButtonBase-root': {
                    color: 'white'
                },
                '& .MuiAlert-action': {
                    alignSelf: 'normal'
                },
                borderRadius: '40px'
            }
        }
    }

    componentWillMount() {
        const oldParams = this.state.sxParams
        const moreParams = this.props.alertType==='success' 
            ? {backgroundColor: this.props.colors.greenAccent[500] } 
            : this.props.alertType==='error' 
                ? {backgroundColor: this.props.colors.redAccent[400]} 
                : {backgroundColor: 'orange'}

        this.setState({sxParams: Object.assign({}, oldParams, moreParams)})
    }

    handleClose = (event, reason) => {
        if (reason==='clickaway') {
            return
        }
        this.props.onClose()
    }

    render() {
        return(
            <>
                <Snackbar 
                    message={this.props.message} 
                    autoHideDuration={5000}
                    open={this.state.open}
                    onClose={this.handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                    }}
                >
                    <Alert 
                        severity={this.props.alertType}
                        onClose={this.handleClose} 
                        sx={this.state.sxParams}
                    ><Typography>{this.props.message}</Typography></Alert>
                </Snackbar>
            </>
        )
    }
}

export default SnackbarAlert