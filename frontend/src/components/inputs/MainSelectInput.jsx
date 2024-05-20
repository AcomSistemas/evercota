import React from "react";

import { Autocomplete, FormControl, TextField } from "@mui/material";


class MainSelectInput extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }

    componentWillMount() {
        if(this.props.needNoneOption && this.props.optionsList && this.props.optionsList[0].value) {
            this.props.optionsList.unshift({'value': '', 'label': 'Nenhuma'})
        }
        if(this.props.searchByLabel) {
            this.searchCity()
        }
    }

    searchCity(){
        let foundObject = null;
        console.log(this.props.value)
        for (let i = 0; i < this.props.optionsList.length; i++) {
            if (this.props.optionsList[i].label === this.props.value.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")) {
                foundObject = this.props.optionsList[i];
                break
            }
        }
        return foundObject
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
        return(
            <FormControl 
                size={this.props.size ?? 'small'}
                sx={{
                    '& .MuiInputBase-root': {
                        fontSize: '16px', // Tamanho da fonte da label
                    },
                    '& label.Mui-focused': {
                        color: this.props.colors.blueAccent[400], // cor do label quando o input está selecionado
                    },
                    '& .MuiInput-underline:after': {
                        borderBottomColor: this.props.colors.blueAccent[400],
                    },
                    '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                            borderColor: this.props.colors.blueAccent[400], // borda do input quando está selecionado
                        },
                        color: this.props.colors.grey[100],
                    },
                    '& MuiOutlinedInput-root.Mui-disabled': { 
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none', // Remove a borda
                          }
                    },
                    '& .MuiInputBase-input': {
                        backgroundColor: 'transparent',
                        color: 'white'
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: this.props.colors.grey[100],
                        backgroundColor: this.props.colors.primary[400], // Background do campo quando desabilitado
                        borderRadius: '4px',
                        opacity: 0.7,
                        marginLeft: '-10px',
                        paddingLeft: '10px'
                    },
                    '& .MuiOutlinedInput-input.Mui-disabled': {
                        paddingLeft: '20px',
                    },
                    width: this.props.width ? this.props.width : this.props.fullWidth ? '97%' : '94%',
                    '& fieldset': {
                        borderColor: this.props.colors.grey[1100], // borda do input
                    },
                    '& label': {
                        color: this.props.colors.grey[1100],
                        "&.Mui-disabled": {
                            fontSize: '16px', // Tamanho da fonte da label quando desabilitado
                            color: this.props.colors.grey[400]
                        }
                    },
                    '& .MuiSvgIcon-root': {
                        color: this.props.colors.grey[1100],
                    },
                    '& .MuiAutocomplete-input': {
                        color: this.props.colors.grey[100]
                    },
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
                    id={this.props.id ?? null}
                    disabled={this.props.disabled ?? false}
                    options={this.props.optionsList ?? []}
                    getOptionLabel={(option) => option.label || ''}
                    onChange={this.handleSelect}
                    value={this.props.searchByLabel ? this.searchCity() : this.props.optionsList.find(option => option.value === this.props.value) || null}
                    renderInput={(params) => (
                        <TextField 
                            {...params}
                            label={
                                this.props.required 
                                ? <>{this.props.label}<span style={{ color: this.props.colors.blueAccent['400'] }}> *</span></> ?? ''
                                : this.props.label ?? ''
                            } 
                            InputLabelProps={{ shrink: true }}
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
        )
    }
}

export default MainSelectInput