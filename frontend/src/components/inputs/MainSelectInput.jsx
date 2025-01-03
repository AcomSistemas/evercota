import React, { forwardRef } from "react";

import { Autocomplete, Box, FormControl, TextField, Typography } from "@mui/material";


class MainSelectInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentWillMount() {
        if (this.props.needNoneOption && this.props.optionsList && this.props.optionsList[0].value) {
            this.props.optionsList.unshift({ 'value': '', 'label': 'Nenhuma' })
        }
    }

    handleSelect = (e, newValue) => {
        this.props.handleChange({
            target: {
                id: this.props.id,
                value: newValue ? newValue.value : null
            }
        })
    }

    render() {
        return (
            <Box sx={{ width: this.props.width ? this.props.width : '100%' }}>
                <Typography sx={{ fontSize: '12px' }}>
                    {this.props.required
                        ? <>{this.props.label}<span style={{ color: this.props.colors.redAccent[500] }}> *</span></> ?? ''
                        : this.props.label ?? ''
                    }
                </Typography>
                <FormControl className="main-select-input"
                    size={this.props.size ?? 'small'}
                    sx={{
                        width: this.props.width ? this.props.width : '100%',
                        ...this.props.sx,
                    }}
                >
                    <Autocomplete
                        onKeyUp={this.props.onKeyUp ?? null}
                        id={this.props.id ?? null}
                        onFocus={(params) => this.props.onFocus ? this.props.onFocus(params) : null}
                        disabled={this.props.disabled ?? false}
                        options={this.props.optionsList ?? []}
                        getOptionLabel={(option) => option.label || ''}
                        onChange={this.handleSelect}
                        value={this.props.optionsList.find(option => option.value === this.props.value) || null}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                inputRef={this.props.innerRef}
                                placeholder={this.props.placeholder ?? ''}
                                InputLabelProps={{ shrink: false }}
                                inputProps={{
                                    ...params.inputProps,
                                }}
                            />
                        )}
                    />
                </FormControl>
            </Box>
        )
    }
}

// Componente funcional para encaminhar ref
const ForwardedMainSelectInput = forwardRef((props, ref) => {
    return <MainSelectInput {...props} innerRef={ref} />;
})

export default ForwardedMainSelectInput