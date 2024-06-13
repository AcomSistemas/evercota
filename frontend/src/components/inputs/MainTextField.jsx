import React, { forwardRef } from "react";

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { Box, IconButton, InputAdornment, TextField, Typography } from "@mui/material";

class MainTextField extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showPassword: false
        }
    }

    handleClickShowPassword = () => {
        this.setState({ showPassword: !this.state.showPassword })
    }

    render() {
        return (
            <Box sx={{ width: this.props.width ? this.props.width : '100%' }}>
                <Typography sx={{ fontSize: '13px' }}>
                    {this.props.required
                        ? <>{this.props.label}<span style={{ color: this.props.colors.redAccent[600] }}> *</span></> ?? ''
                        : this.props.label ?? ''
                    }
                </Typography>

                <TextField className="main-text-field"
                    sx={{
                        input: { 
                            textAlign: ['number','numberTwoDecimals'].includes(this.props.type) ? 'right' : 'left',
                        },
                        width: this.props.width ? this.props.width : '100%',
                        ...this.props.sx,
                    }}
                    onKeyUp={this.props.onKeyUp ?? null}
                    inputRef={this.props.innerRef ?? undefined}
                    onFocus={(params) => this.props.onFocus ? this.props.onFocus(params) : null}
                    id={this.props.id ?? undefined}
                    variant={'outlined'}
                    type={this.props.type === 'number' ? 'number' : this.props.type === 'password' && !this.state.showPassword ? 'password' : 'text'}
                    disabled={this.props.disabled ?? false}
                    multiline={this.props.minRows ? true : false}
                    rows={this.props.minRows ?? 1}
                    value={this.props.value ?? undefined}
                    size={this.props.size ?? 'small'}
                    fullWidth={this.props.fullWidth ? true : false}
                    placeholder={this.props.placeholder ?? ''}
                    onBlur={this.props.onBlur ?? null}
                    inputProps={{
                        maxLength: this.props.maxLength ?? undefined,
                    }}
                    InputLabelProps={{
                        shrink: false
                    }}
                    InputProps={{

                        endAdornment: this.props.type === 'password' ?
                            <>
                                <InputAdornment position="end" sx={{ margin: '0' }}>
                                    <IconButton sx={{ marginLeft: '-40px', color: 'orange' }}
                                        aria-label="toggle password visibility"
                                        onClick={this.handleClickShowPassword}
                                        edge="end"
                                    >
                                        {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            </>
                            : <></>
                    }}
                    onChange={(e) => {
                        if (this.props.type === 'number') {  // Verificação aplicada somente para campos numéricos
                            const value = parseInt(e.target.value, 10)
                            if (value < 0) {
                                e.target.value = 0  // Ajusta para 0 se o valor for negativo
                            }
                        }
                        this.props.handleChange(e)
                    }}
                />
            </Box>
        )
    }
}

// Componente funcional para encaminhar ref
const ForwardedMainTextField = forwardRef((props, ref) => {
    return <MainTextField {...props} innerRef={ref} />
})

export default ForwardedMainTextField