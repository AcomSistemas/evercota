import React from "react";

import { Box, Button, Typography } from "@mui/material";

class MainButton extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { sx } = this.props

        const borderColor = sx?.borderColor || ''
        const borderRadius = sx?.borderRadius || '5px'
        const textColor = sx?.textColor || 'white'

        return (
            <Box
                display='flex'
                justifyContent='center'
                onClick={this.props.onButtonClick}
                height='40px'
                sx={{
                    borderRadius: borderRadius,
                }}
            >
                <Button sx={{ width: '100%', borderRadius: borderRadius, border: `1px ${borderColor} solid` }}><Typography sx={{ color: textColor, fontWeight: '500', letterSpacing: '1px', textTransform: 'none' }}>{this.props.title}</Typography></Button>
            </Box>
        )
    }
}

export default MainButton;