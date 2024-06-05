import React from "react";

import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { Box, Button, Dialog, Typography } from "@mui/material";


class DialogAlert extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Dialog className='dialog-box' open={this.props.isOpen} onClose={this.handleClose} onTransitionExited={this.props.onExit ?? null}
                sx={{
                    '& .MuiPaper-root': {
                        height:' 30%',
                        width: '25%',
                        alignItems: 'center',
                        borderRadius: '10px'
                    }
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        width: '90%',

                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {this.props.type === 'confirm' ?
                        <CheckCircleIcon style={{ color: this.props.colors.greenAccent[500], fontSize: 60 }} />
                        : this.props.type === 'cancel' ?
                            <CancelIcon style={{ color: this.props.colors.redAccent[500], fontSize: 60 }} />
                            : <></>
                    }

                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '18px 0' }}>
                        <Typography sx={{ fontSize: '15px', marginBottom: '10px' }}>{this.props.title}</Typography>
                        <Typography sx={{ fontSize: '16px', fontWeight: '500', textAlign: 'center' }}> {this.props.body}</Typography>
                    </Box>
                    <Box width='70%' display='flex' justifyContent='space-around' alignItems='center' gap='20px'>
                        {this.props.onClose ?
                            <Button
                                sx={{
                                    backgroundColor: this.props.colors.redAccent[500],
                                    color: this.props.colors.custom['white'],
                                    width: '60%',
                                    borderRadius: '5px',
                                    textTransform: 'none',
                                    ":hover": { backgroundColor: this.props.colors.redAccent[600] },
                                }}
                                onClick={this.props.onClose}
                            >Cancelar</Button>
                            : <></>}
                        {this.props.onConfirm ?
                            <Button
                                sx={{
                                    backgroundColor: this.props.colors.blueAccent[100],
                                    color: this.props.colors.custom['white'],
                                    width: '60%',
                                    borderRadius: '5px',
                                    textTransform: 'none',
                                    ":hover": { backgroundColor: this.props.colors.blueAccent[200] },
                                }}
                                onClick={this.props.onConfirm}
                            >Ok</Button>
                            : <></>}
                    </Box>
                </Box>
            </Dialog>
        )
    }
}

export default DialogAlert