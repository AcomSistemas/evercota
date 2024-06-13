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
                <Box sx={{ width: this.props.width ? this.props.width : '100%' }}>
                    <Typography sx={{ fontSize: '13px', color: this.state.wrongFormat ? 'red' : '' }}>
                        {this.props.required
                            ? <>{this.props.label}<span style={{ color: this.props.colors.redAccent[600] }}> *</span></> ?? ''
                            : this.props.label ?? ''
                        }
                    </Typography>
                    <TextField className="main-time-input"
                        id={this.props.id ?? undefined}
                        sx={{
                            width: this.props.width ? this.props.width : '100%',
                            ...this.props.sx,
                        }}
                        variant={this.props.borderless ? 'standard' : 'outlined'}
                        disabled={this.props.disabled ?? false}
                        multiline={this.props.minRows ? true : false}
                        rows={this.props.minRows ?? 1}
                        value={this.props.value ?? undefined}
                        label={''}
                        size={this.props.size ?? 'small'}
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
                <Box sx={{ width: this.props.width ? this.props.width : '100%' }}>
                    <Typography sx={{ fontSize: '13px' }}>
                        {this.props.required
                            ? <>{this.props.label}<span style={{ color: this.props.colors.redAccent[600] }}> *</span></> ?? ''
                            : this.props.label ?? ''
                        }
                    </Typography>

                    <LocalizationProvider dateAdapter={AdapterDayjs} >

                        <DatePicker className="main-date-input"
                            sx={{
                                width: this.props.width ? this.props.width : '100%',
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