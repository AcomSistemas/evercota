import React from "react";

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Box, TextField, Typography } from "@mui/material";

dayjs.extend(utc)
dayjs.extend(timezone)

class MainDateTimeInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = { wrongFormat: false }
    }

    handleChange(event) {
        if (this.props.type === 'time') {
            const input = event.target.value

            let cleanedInput = input.replace(/[^\d]/g, '').substring(0, 4)

            if (cleanedInput.length >= 3) {
                cleanedInput = cleanedInput.substring(0, 2) + ':' + cleanedInput.substring(2, 4)
            }
            event.target.value = cleanedInput

            if (event.target.value.length !== 5 && event.target.value.length !== 0) {
                this.setState({ wrongFormat: true })
            } else {
                this.setState({ wrongFormat: false })
            }
            this.props.handleChange(event)
        }
    }

    handleChangeDate = (date) => {
        var formattedDate
        if (this.props.onlyDate === true) {                                 // caso o campo esteja como "date" no banco
            formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : ''
        } else {                                                            // caso o campo esteja como "datetime" no banco
            formattedDate = date
        }
        const event = {
            target: {
                id: this.props.id,
                value: formattedDate
            }
        }
        this.props.handleChange(event)
    }


    render() {
        if (this.props.type === 'time') {
            return (
                <Box>
                    <Typography sx={{ fontSize: '13px', color: this.state.wrongFormat ? 'red' : '' }}>
                        {this.props.required
                            ? <>{this.props.label}<span style={{ color: this.props.colors.redAccent[600] }}> *</span></> ?? ''
                            : this.props.label ?? ''
                        }
                    </Typography>
                    <TextField
                        id={this.props.id ?? undefined}
                        sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                                backgroundColor: this.props.colors.primary[400],
                            },
                            '& .MuiInputBase-input': { // Propriedades do Input
                                borderRadius: '25px',
                                backgroundColor: 'transparent'
                            },
                            '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: this.props.colors.grey[100],
                                opacity: 0.7,
                            },
                            '& .MuiSvgIcon-root': {
                                color: this.props.colors.grey[1100],
                            },
                            '& .MuiInputBase-root': {
                                height: '40px',
                                borderRadius: '30px'
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: this.props.colors.grey[800], // cor da borda
                                    borderRadius: '25px',
                                    boxShadow: 'inset 0 6px 5px -5px #888888' // boxShadow superior interno do input
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: this.props.colors.grey[500], // Cor da borda quando está selecionado
                                },
                            },
                            label: {
                                "&.Mui-disabled": {
                                    color: this.props.colors.grey[1100],
                                }
                            },
                            width: this.props.width ? this.props.width : this.props.fullWidth ? '97%' : '94%',
                            borderRadius: '25px',
                            ...this.props.sx,
                        }}
                        variant={this.props.borderless ? 'standard' : 'outlined'}
                        disabled={this.props.disabled ?? false}
                        multiline={this.props.minRows ? true : false}
                        rows={this.props.minRows ?? 1}
                        value={this.props.value ?? undefined}
                        label={''}
                        size={this.props.size ?? 'small'}
                        fullWidth={this.props.fullWidth ? true : false}
                        placeholder={this.props.type === 'time' ? 'hh:mm' : ''}
                        onChange={(e) => this.handleChange(e)}
                        InputProps={{
                            endAdornment: this.props.inputProps ?? undefined,
                        }}
                    />
                    <div style={{ color: this.props.colors.redAccent[500], fontWeight: 'bold' }} >{this.state.errorMessage}</div>
                </Box>
            )
        } else if (this.props.type === 'date') {
            return (
                <Box sx={{ width: '100%' }}>
                    <Typography sx={{ fontSize: '13px' }}>
                        {this.props.required
                            ? <>{this.props.label}<span style={{ color: this.props.colors.redAccent[600] }}> *</span></> ?? ''
                            : this.props.label ?? ''
                        }
                    </Typography>

                    <LocalizationProvider dateAdapter={AdapterDayjs} >

                        <DatePicker
                            sx={{
                                '& .MuiInputBase-root.Mui-disabled': {
                                    backgroundColor: this.props.colors.primary[400],
                                },
                                '& .MuiInputBase-input': { // Propriedades do Input
                                    borderRadius: '25px',
                                    backgroundColor: 'transparent'
                                },
                                '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: this.props.colors.grey[100],
                                    opacity: 0.7,
                                },
                                '& .MuiSvgIcon-root': {
                                    color: this.props.colors.grey[1100],
                                },
                                '& .MuiInputBase-root': {
                                    height: '40px',
                                    borderRadius: '30px'
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: this.props.colors.grey[800], // cor da borda
                                        borderRadius: '25px',
                                        boxShadow: 'inset 0 6px 5px -5px #888888' // boxShadow superior interno do input
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: this.props.colors.grey[500], // Cor da borda quando está selecionado
                                    },
                                },
                                input: {
                                    color: this.props.colors.grey[200],
                                },
                                label: {
                                    "&.Mui-disabled": {
                                        color: this.props.colors.grey[1100],
                                    }
                                },
                                width: this.props.width ? this.props.width : this.props.fullWidth ? '97%' : '94%',
                                borderRadius: '25px',
                                ...this.props.sx,
                            }}
                            disabled={this.props.disabled ?? false}
                            value={this.props.value ? dayjs(this.props.value) : null}
                            onChange={this.handleChangeDate}
                            inputFormat="DD/MM/YYYY"
                            format="DD/MM/YYYY"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    onChange={(e) => this.handleChangeDate(e.target.value ? dayjs(e.target.value, "DD/MM/YYYY") : null)}
                                    error={Boolean(this.state.errorMessage)}
                                    helperText={this.state.errorMessage}
                                />
                            )}
                        />
                    </LocalizationProvider>
                </Box>
            )
        }
    }
}

export default MainDateTimeInput