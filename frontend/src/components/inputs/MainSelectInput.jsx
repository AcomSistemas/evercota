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
            <Box sx={{ width: '100%' }}>
                <Typography sx={{ fontSize: '13px' }}>
                    {this.props.required
                        ? <>{this.props.label}<span style={{ color: this.props.colors.redAccent[500] }}> *</span></> ?? ''
                        : this.props.label ?? ''
                    }
                </Typography>

                <FormControl
                    size={this.props.size ?? 'small'}
                    sx={{
                        '& .MuiInputBase-root': {
                            fontSize: '16px', // Tamanho da fonte da label
                            borderRadius: '25px',
                        },
                        // '& label.Mui-focused': {
                        //     color: this.props.colors.blueAccent[400], // cor do label quando o input está selecionado
                        // },
                        '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                                borderColor: this.props.isFocused ? 'orange' : this.props.colors.grey[500], // borda do input quando está selecionado
                            },
                        },
                        '& .MuiInputBase-input': {
                            borderRadius: '25px',
                        },
                        '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: this.props.colors.grey[100],
                            backgroundColor: this.props.colors.primary[400], // Background do campo quando desabilitado
                            borderRadius: '25px',
                            opacity: 0.7,
                            marginLeft: '-10px',
                            paddingLeft: '10px'
                        },
                        '& fieldset': {
                            borderColor: this.props.isFocused ? 'orange' : this.props.colors.grey[800], // borda do input
                            boxShadow: 'inset 0 6px 5px -5px #888888',
                        },
                        '& .MuiSvgIcon-root': {
                            color: this.props.colors.grey[1100],
                        },
                        '& .MuiAutocomplete-input': {
                            color: this.props.colors.grey[100]
                        },
                        width: this.props.width ? this.props.width : this.props.fullWidth ? '97%' : '94%',
                        ...this.props.sx,
                    }}
                >
                    <Autocomplete
                        sx={{
                            "& .MuiAutocomplete-popupIndicator": {
                                color: this.props.colors.grey[1100],
                            },
                            "& .MuiOutlinedInput-root": {
                                padding: '1px 0px 1px 10px !important',
                            },
                        }}
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

                                    sx: {
                                        backgroundColor: this.props.colors.custom['colorWhite'],
                                        color: this.props.colors.grey[1100],
                                        '& .Mui-selected': {
                                            color: this.props.colors.grey[100],
                                            backgroundColor: 'transparent',
                                        },
                                    }
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