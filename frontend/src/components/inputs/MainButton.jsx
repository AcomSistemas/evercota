import React, { forwardRef } from "react";

import { Box, Button, Typography } from "@mui/material";

class MainButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        const { sx, onFocus } = this.props;

        const borderColor = sx?.borderColor || 'white'
        const borderRadius = sx?.borderRadius || '5px'
        const textColor = sx?.textColor || 'white'

        return (
            <Box
                {...this.props}
                display='flex'
                justifyContent='center'
                onClick={this.props.onButtonClick}
                height='40px'
                sx={{
                    borderRadius: borderRadius,
                    ...sx
                }}
            >
                <Button
                    ref={this.props.innerRef}
                    id={this.props.id}
                    onFocus={(params) => onFocus ? onFocus(params) : null}
                    sx={{ width: '100%', borderRadius: borderRadius, border: `1px ${borderColor} solid` }}
                    disabled={this.props.disabled ?? null}>
                    <Typography
                        sx={{ color: textColor, fontWeight: '500', letterSpacing: '1px', textTransform: 'none' }}
                    >
                        {this.props.title}
                    </Typography>
                </Button>
            </Box>
        )
    }
}

const ForwardedMainButton = forwardRef((props, ref) => {
    return <MainButton {...props} innerRef={ref} />
})

export default ForwardedMainButton