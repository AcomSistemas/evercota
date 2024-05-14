import React from "react";

import dayjs from "dayjs";
import EditableTable from "./components/inputs/tables/EditableTable";
import MainButton from "./components/inputs/MainButton";
import MainDateTimeInput from "./components/inputs/MainDateTimeInput";
import MainTextField from "./components/inputs/MainTextField";

import logo from "./data/logo.png";
import logo2 from "./data/logo2.png";
import banner from "./data/banner.png";

import { Box, Grid, Typography } from "@mui/material";
import { tokens } from "./typograhpy";
import { useMode } from "./typograhpy";

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
			isLoadingTable: false,
			loggedIn: false,
			user: {},
			userEdit: false,

			quotationList: [
				{ "sku": 12345, "descricao": "Parafuso 6mm", "um": "un", "qtd_cotacao": 100, "qtd_embalagem": 50, "valor_embalagem": 30, "valor_unit": 0.66, "marca_desejada": "FixoBem", "marca_disp": "AçoFort" },
				{ "sku": 23456, "descricao": "Tubo PVC 100mm", "um": "mt", "qtd_cotacao": 120, "qtd_embalagem": 10, "valor_embalagem": 80, "valor_unit": 8, "marca_desejada": "Tubex", "marca_disp": "PlastiPipe" },
				{ "sku": 34567, "descricao": "Tinta Acrílica 18L", "um": "lt", "qtd_cotacao": 150, "qtd_embalagem": 18, "valor_embalagem": 250, "valor_unit": 13, "marca_desejada": "ColorMax", "marca_disp": "PintaBem" },
				{ "sku": 45678, "descricao": "Fita Isolante", "um": "pc", "qtd_cotacao": 200, "qtd_embalagem": 50, "valor_embalagem": 100, "valor_unit": 2, "marca_desejada": "IsolaMais", "marca_disp": "SeguraCorrente" },
				{ "sku": 56789, "descricao": "Lâmpada LED 9W", "um": "un", "qtd_cotacao": 300, "qtd_embalagem": 30, "valor_embalagem": 150, "valor_unit": 5, "marca_desejada": "LuzBrilhante", "marca_disp": "EconoLuz" }
			],
			quotationColumns: [
				['sku', 'SKU Everest'],
				['descricao', 'Descrição'],
				['um', 'UM'],
				['qtd_cotacao', 'Qtd. Cotação'],
				['qtd_embalagem', 'Qtd. Embalagem'],
				['valor_embalagem', 'Valor Embalagem'],
				['valor_unit', 'Valor Unitário'],
				['marca_desejada', 'Marca Desejada'],
				['marca_disp', 'Marca Disponível'],
			],
			quotationTotalSize: 5,
		}
		dayjs.locale('pt-br')
	}

	handleChangeText = (event) => {
		this.setState({ [event.target.id]: event.target.value })
	}

	onTableEdit = (row, method, extraParam) => {
		if (method === 'delete') {
			this.setState({
				quotationList: row
			})
			// }, () => this.deleteRow(extraParam))
		}
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
						<Grid item md={2} xs={4} sx={{ 'alignSelf': 'self-end' }}>
							<MainButton
								{...this.props}
								sx={{
									borderColor: this.props.colors.redAccent[500],
									textColor: this.props.colors.redAccent[500]
								}}
								onButtonClick={() => { }}
								title="Recusar Cotação"
								width='100%'
							/>
						</Grid>
					</Grid>

					<EditableTable
						{...this.props}
						allowEdit
						allowEditOnRow
						noAddRow
						id='sku'
						height='45vh'
						data={this.state.quotationList}
						columns={this.state.quotationColumns}
						rowId='sku'
						totalSize={this.state.quotationTotalSize}
						onPageChange={() => { }}
						onEditRow={this.onTableEdit}
						onRowDoubleClick={() => { }}
						isLoading={this.state.isLoadingTable}
						// onCellClick={() => {}} // Retorna 'params' da célula clicada
						extraColumnsConfig={
							{
								'sku': {
									'disabled': true,
								},
								'descricao': {
									'disabled': true
								},
								'um': {
									'disabled': true
								},
								'qtd_cotacao': {
									'disabled': true,
								},
								'marca_desejada': {
									'disabled': true
								},
								'qtd_embalagem': {
									'type': 'number',
									'borders': true
								},
								'valor_embalagem': {
									'type': 'currency', // tipo R$
									'borders': true
								},
								'valor_unit': {
									'disabled': true,
									'type': 'currency', // tipo R$
									'borders': true
								},
								'marca_disp': {
									'borders': true
								},
							}
						}
					/>
				</Box>
			</>
		)
	}
}

export default withHooks(App)
