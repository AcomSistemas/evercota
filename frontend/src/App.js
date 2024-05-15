import React from "react";

import dayjs from "dayjs";
import EditableTable from "./components/tables/EditableTable";
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
				{ "sku": 12345, "descricao": "Parafuso 6mm", "um": "un", "qtd_cotacao": 100, "qtd_embalagem": 1, "valor_embalagem": 100, "valor_unit": 0.66, "marca_desejada": "FixoBem", "marca_disp": "" },
				{ "sku": 23456, "descricao": "Tubo PVC 100mm", "um": "mt", "qtd_cotacao": 120, "qtd_embalagem": 1, "valor_embalagem": 80, "valor_unit": 8, "marca_desejada": "Tubex", "marca_disp": "" },
				{ "sku": 34567, "descricao": "Tinta Acrílica 18L", "um": "lt", "qtd_cotacao": 150, "qtd_embalagem": 1, "valor_embalagem": 250, "valor_unit": 13, "marca_desejada": "ColorMax", "marca_disp": "" },
				{ "sku": 45678, "descricao": "Fita Isolante", "um": "pc", "qtd_cotacao": 200, "qtd_embalagem": 1, "valor_embalagem": 100, "valor_unit": 2, "marca_desejada": "IsolaMais", "marca_disp": "" },
				{ "sku": 56789, "descricao": "Lâmpada LED 9W", "um": "un", "qtd_cotacao": 300, "qtd_embalagem": 1, "valor_embalagem": 150, "valor_unit": 5, "marca_desejada": "LuzBrilhante", "marca_disp": "" }
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

	componentDidUpdate(prevProps, prevState) {
		if(prevState.quotationList !== this.state.quotationList) {
			this.setState({ qtdItens: this.state.quotationList.length }, 
				() => { this.sumOfTablePackingValue()}
			)
		}

	}

	calculateUnitValue = () => {
		const updatedQuotationList = this.state.quotationList.map(item => {
			const result = item.valor_embalagem / item.qtd_embalagem
			return { ...item, valor_unit: result }
		})
		this.setState({ quotationList: updatedQuotationList })
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

	sumOfTablePackingValue = () => {
		const { quotationList } = this.state

		let sum = 0

		if (quotationList && quotationList.length > 0) {

            for (let item of quotationList) {
                sum += parseFloat(item.valor_embalagem)
            }
        } else {
            sum = '0'
        }
        this.setState({ totalQuoteValue: sum }, () => console.log(sum))
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
								<Typography sx={{ fontSize: '12px' }}>Razão Social do Fornecedor | CNPJ 000.000.000/0000-00</Typography>
								<Typography sx={{ fontSize: '12px' }}>Nome Fantasia do Fornecedor</Typography>
							</Box>
						</div>
						<Box>
							<Typography sx={{ fontSize: '12px' }}>Usuário do Fornecedor</Typography>
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
								<Typography sx={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Empresa solicitante:</Typography>
								<Typography sx={{ fontSize: '12px' }}>Razão social do solicitante | CNPJ 000.000.000/0000-00</Typography>
								<Typography sx={{ fontSize: '12px' }}>Nome fantasia do solicitante</Typography>
							</Box>
						</div>
						<Box>
							<Typography sx={{ fontSize: '12px' }}>Nome do contato</Typography>
							<Typography sx={{ fontSize: '12px' }}>nomedocontato@solicitante.com.br | +55 00 00000-0000</Typography>
						</Box>
					</Box>

					<Box sx={{ backgroundColor: 'white', padding: '10px 20px', borderRadius: '10px', margin: '20px 0' }}>
						<Box
							sx={{
								display: 'grid',
								gap: '20px',
								alignItems: 'center',
								gridTemplateColumns: {
									sm: '1fr',
									md: '1fr 1fr 1fr 1fr 1fr 0.9fr',
								},
							}}
						>
							<MainDateTimeInput
								{...this.props}
								id='priceDate'
								value={this.state.priceDate}
								label='Data da Cotação'
								handleChange={this.handleChangeText}
								type='date'
								width='100%'
								disabled='true'
							/>

							<MainDateTimeInput
								{...this.props}
								id='limitDate'
								value={this.state.limitDate}
								label='Data Limite para Envio'
								handleChange={this.handleChangeText}
								type='date'
								width='100%'
								disabled='true'
							/>

							<MainDateTimeInput
								{...this.props}
								id='limitTime'
								value={this.state.limitTime}
								label='Horário Limite para Envio'
								handleChange={this.handleChangeText}
								type='time'
								width='100%'
								disabled='true'
							/>

							<MainTextField
								{...this.props}
								id='expirationDays'
								value={this.state.expirationDays || ''}
								label='Número da Cotação'
								handleChange={this.handleChangeText}
								onKeyUp={this.handleKeyUp}
								width='100%'
							/>

							<Box></Box>

							<MainButton
								{...this.props}
								sx={{
									borderColor: this.props.colors.redAccent[500],
									textColor: this.props.colors.redAccent[500],
									borderRadius: '8px'
								}}
								onButtonClick={() => { }}
								title="Recusar Cotação"
								width='100%'
							/>
						</Box>

						<EditableTable
							calculateUnitValue={this.calculateUnitValue}
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

						<Box sx={{ marginTop: '30px' }}>
							<Typography>Resumo da Cotação</Typography>
							<Box
								sx={{
									display: 'grid',
									gap: '20px',
									alignItems: 'end',
									gridTemplateColumns: {
										sm: '1fr',
										md: '0.7fr 0.7fr 0.7fr 0.6fr 0.6fr 1fr 0.9fr',
									},
									marginTop: '10px'
								}}
							>

								<MainTextField
									{...this.props}
									id='deliveryTerm'
									value={this.state.deliveryTerm || ''}
									label='Prazo de Entrega (dias)'
									handleChange={this.handleChangeText}
									onKeyUp={this.handleKeyUp}
									width='100%'
									type='number'
								/>

								<MainTextField
									{...this.props}
									id='paymentTerm'
									value={this.state.paymentTerm || ''}
									label='Prazo de Pagamento (dias)'
									handleChange={this.handleChangeText}
									onKeyUp={this.handleKeyUp}
									width='100%'
									type='number'
								/>

								<MainTextField
									{...this.props}
									id='formOfPayment'
									value={this.state.formOfPayment || ''}
									label='Forma de Pagamento'
									handleChange={this.handleChangeText}
									onKeyUp={this.handleKeyUp}
									width='100%'
								/>

								<MainTextField
									{...this.props}
									id='qtdItens'
									value={this.state.qtdItens || ''}
									label='Qtd. de Itens'
									handleChange={this.handleChangeText}
									onKeyUp={this.handleKeyUp}
									width='100%'
									disabled='true'
								/>

								<MainTextField
									{...this.props}
									id='totalQuoteValue'
									value={this.state.totalQuoteValue || ''}
									label='Valor Total da Cotação (R$)'
									handleChange={this.handleChangeText}
									onKeyUp={this.handleKeyUp}
									width='100%'
									disabled='true'
								/>

								<Box></Box>

								<MainButton
									{...this.props}
									sx={{
										backgroundColor: 'orange',
										borderRadius: '8px'
									}}
									onButtonClick={() => console.log(typeof this.state.totalQuoteValue)}
									title="Enviar Cotação"
									width='100%'
								/>
							</Box>
						</Box>
					</Box>


				</Box>
			</>
		)
	}
}

export default withHooks(App)
