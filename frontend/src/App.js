import React from "react";

import MainButton from "./components/inputs/MainButton";
import MainDateTimeInput from "./components/inputs/MainDateTimeInput";
import MainTextField from "./components/inputs/MainTextField";

import logo from "./data/logo.png";
import logo2 from "./data/logo2.png";
import banner from "./data/banner.png";
import dayjs from "dayjs";

import { Box, Grid, Typography } from "@mui/material";
import { ColorModeContext, useMode } from "./typograhpy";
import { tokens } from "./typograhpy";

import 'dayjs/locale/pt-br';
import './App.css';

function withHooks(WrappedComponent) {
    return function (props) {
        const [theme, colorMode] = useMode()
        const colors = tokens(theme.palette.mode)

        return (
            <WrappedComponent colors={colors} colorMode={colorMode} theme={theme} {...props} />
        )
    }
}

class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			activeTab: 0,
			isLoaded: true,
			loggedIn: false,
			user: {},
			userEdit: false
		}
		dayjs.locale('pt-br')
	}

	handleChangeText = (event) => {
        this.setState({ [event.target.id]: event.target.value })
    }

	render() {
		return (
			<>
				<Box className='navbar'>
					<div class='navbar-container'>
						<div class='left-container'>
							<Box className='navbar-icon'>
								<Box className='logo'><img src={logo}></img></Box>
							</Box>
							<Box className='navbar-infos'>
								<Typography>Razão Social do Fornecedor</Typography>
								<Typography>Nome Fantasia do Fornecedor</Typography>
							</Box>
						</div>
						<Box className='navbar-user'>
							<Typography>Nome</Typography>
						</Box>
					</div>
				</Box>
				<Box className='app-body'>
					<Box className='banner'>
						<img src={banner}></img>
					</Box>
					<Box className='company-container'>
						<div class='left-container'>
							<Box className='navbar-icon'>
								<Box className='logo'><img src={logo2}></img></Box>
							</Box>
							<Box className='navbar-infos'>
								<Typography>Razão Social do Fornecedor</Typography>
								<Typography>Nome Fantasia do Fornecedor</Typography>
							</Box>
						</div>
						<Box className='navbar-user'>
							<Typography>Nome</Typography>
						</Box>
					</Box>
					<Grid container className='price-header' spacing={2}>
						<Grid item md={2} xs={4}>
							<MainDateTimeInput
								{...this.props}
								id='priceDate'
								value={this.state.priceDate}
								label='Data da Cotação'
								handleChange={this.handleChangeText}
								type='date'
								width='100%'
							/>
						</Grid>
						<Grid item md={2} xs={4}>
							<MainDateTimeInput
								{...this.props}
								id='limitDate'
								value={this.state.limitDate}
								label='Data Limite para Envio'
								handleChange={this.handleChangeText}
								type='date'
								width='100%'
							/>
						</Grid>
						<Grid item md={2} xs={4}>
							<MainDateTimeInput
								{...this.props}
								id='limitTime'
								value={this.state.limitTime}
								label='Horário Limite para Envio'
								handleChange={this.handleChangeText}
								type='time'
								width='100%'
							/>
						</Grid>
						<Grid item md={2} xs={4}>
							<MainTextField
								{...this.props}
								id='expirationDays'
								value={this.state.expirationDays || ''}
								label='Número da Cotação'
								handleChange={this.handleChangeText}
								onKeyUp={this.handleKeyUp}
								width='100%'
							/>
						</Grid>
						<Grid item md={2} xs={4}></Grid>
						<Grid item md={2} xs={4} sx={{'alignSelf': 'self-end'}}>
							<MainButton 
								{...this.props} 
								sx={{ 
									borderColor: this.props.colors.redAccent[500], 
									textColor: this.props.colors.redAccent[500]
								}} 
								onButtonClick={() => {}} 
								title="Recusar Cotação" 
								width='100%'
							/>
						</Grid>
					</Grid>
				</Box>
      		</>
		)
	}
}

export default withHooks(App)
