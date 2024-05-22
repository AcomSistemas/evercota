import React from "react";

import dayjs from "dayjs";
import DialogAlert from "./components/alerts/DialogAlert";
import EditableTable from "./components/tables/EditableTable";
import MainButton from "./components/inputs/MainButton";
import MainDateTimeInput from "./components/inputs/MainDateTimeInput";
import MainSelectInput from "./components/inputs/MainSelectInput";
import MainTextField from "./components/inputs/MainTextField";
import SnackbarAlert from "./components/alerts/SnackbarAlert";

import logo from "./data/logo.png";
import logo2 from "./data/logo2.png";
import banner from "./data/banner.png";

import { Box, Typography } from "@mui/material";
import { defaultRequest } from "./utils/request/request";
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
		const url = window.location.href
		const match = url.split('/').slice(-2)
		
		let entity = null
		let quoteId = null

		if (match) {
			entity = match[0]
			quoteId = match[1]
		}

		this.state = {
			isLoading: true,
			isLoadingTable: true,
			isDialogOpen: false,
			isConfirmDialogOpen: false,

			alertMessage: '',
			alertType: '',
			showAlert: false,

			paymentList: [],

			data: null,
			entity: entity,
    		quoteId: quoteId,

			dataColumns: [
				['cd_item', 'SKU Everest'],
				['ds_item', 'Descrição'],
				['sg_unidademedida', 'UM'],
				['qt_cotacao', 'Qtd. Cotação'],
				['qt_embalagem_fornecedor', 'Qtd. Embalagem'],
				['vl_embalagem', 'Valor Embalagem'],
				['vl_unitario', 'Valor Unitário'],
				['marca_desejada', 'Marca Desejada'],
				['marca', 'Marca Disponível'],
			],

			dataItensTotalSize: '',
		}
		dayjs.locale('pt-br')
	}

	componentDidMount() {

		let config = {
			endpoint: 'sis/condicaovendacompra',
			method: 'get'
		}
		let form = {
			'x-Entidade': this.state.entity,
			'x-Pagina': 1
		}
		defaultRequest(config, form).then((r) => {
			if (r.status) {
				var options = r.data.map((value, index) => {
					if (value.at_situacao == 1) {
						return { ...value, value: value.cd_condicaovendacompra, label: value.cd_condicaovendacompra.toString() + ' - ' + value.ds_condicaovendacompra }
					}
				})
				this.setState({
					paymentList: options
				})
			} else {
				console.log('Erro ao trazer infos')
			}
		})
		this.getData()
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.data?.itens !== this.state.data?.itens) {
			this.setState({ dataItensTotalSize: this.state.data.itens.length },
				() => { this.sumOfTablePackingValue() }
			)
		}

		if (this.state.totalQuoteValue !== prevState.totalQuoteValue) {
			const numericValue = parseFloat(this.state.totalQuoteValue.toString().replace(',', '.'))
			if (!isNaN(numericValue)) {
				const formattedValue = numericValue.toFixed(2).replace('.', ',')
				if (formattedValue !== this.state.totalQuoteValue) {
					this.setState({ totalQuoteValue: formattedValue })
				}
			}
		}
	}

	calculateUnitValue = (newData = null) => {	// Divide o "Valor da Embalagem" pela "Qtd. Embalagem" e coloca o resultado em "Valor Unitário"
		var mapData = newData ?? this.state.data.itens

		const updatedData = mapData.map(item => {

			const valorEmbalagem = parseFloat(item.vl_embalagem)
			const qtEmbalagem = parseFloat(item.qt_embalagem_fornecedor)

			let result = valorEmbalagem && qtEmbalagem
				? parseFloat((valorEmbalagem / qtEmbalagem).toFixed(5))
				: 0
			return { ...item, vl_unitario: result }
		})

		this.setState(prevState => ({
			data: {
				...prevState.data,
				itens: updatedData
			}
		}))
	}

	cancelQuote = () => {
		let config = {
			endpoint: 'cota/cotacaoprecofornecedor/' + this.state.data.id_cotacaoprecofornecedor,
			method: 'delete'
		}
		let form = {
			'x-Entidade': this.state.entity
		}
		defaultRequest(config, form).then((r) => {
			if (r.status) {
				this.setState({
					isDialogOpen: false,
					alertMessage: 'Cotação cancelada com sucesso',
                    alertType: 'success',
                    showAlert: true,
				})
			} else {
				this.setState({
					isDialogOpen: false,
					alertMessage: 'Erro ao cancelar cotação',
                    alertType: 'error',
                    showAlert: true,
				})
			}
		})
	}

	getData = () => {
		let config = {
			endpoint: 'cota/cotacaoprecofornecedor/' + this.state.quoteId,
			method: 'get'
		}
		let form = {
			'x-Entidade': this.state.entity
		}
		defaultRequest(config, form).then((r) => {
			if (r.status && r.data) {
				let horario_encerramento
				if (r.data.dh_cotacao_encerramento) {
					horario_encerramento = r.data.dh_cotacao_encerramento.split('T')[1]
				} else {
					horario_encerramento = null
				}

				this.setState({
					horario_encerramento: horario_encerramento,

					data: r.data,

					isLoading: false,
					isLoadingTable: false
				}, () => this.calculateUnitValue())
			} else {
				this.setState({isLoading: false})
			}
		})
	}

	handleChangeText = (event) => {
		if (event.target.id === 'expirationDays' || event.target.id === 'paymentType') {
			this.setState({ [event.target.id]: event.target.value })
		} else {
			this.setState(prevState => ({
				data: {
					...prevState.data,
					[event.target.id]: event.target.value
				}
			}))
		}
	}

	onTableEdit = (row, method, extraParam) => {
		if (method === 'edit') {
			this.calculateUnitValue(row)
		}
	}

	sendQuote = () => {
		let config = {
			endpoint: 'cota/cotacaoprecofornecedor/' + this.state.quoteId + '?x-Entidade=' + this.state.entity,
			method: 'put'
		}
		let form = {
			'CotacaoPrecoFornecedor': this.state.data
		}
		defaultRequest(config, form).then((r) => {
			if (r.status) {
				this.setState({
					isConfirmDialogOpen: false,
					alertMessage: 'Cotação gravada com sucesso',
                    alertType: 'success',
                    showAlert: true,
				})
			} else {
				this.setState({
					alertMessage: 'Não foi possível gerar a cotação, tente mais tarde sem fechar esta página',
                    alertType: 'error',
                    showAlert: true,
				})
			}
		})
	}

	sumOfTablePackingValue = () => {    // Soma de todos os valores da coluna 'Valor Embalagem'
		const { data } = this.state
		let sum = 0

		if (data && data.itens && data.itens.length > 0) {
			for (let item of data.itens) {
				sum += item.vl_embalagem ? parseFloat(item.vl_embalagem) : 0
			}
		} else {
			sum = 0
		}
		this.setState({ totalQuoteValue: sum })
	}


	render() {
		const datetimeNow = new Date()
		if (this.state.isLoading) {
			return (
				<></>
			)
		}
		return (
			<>
				{this.state.showAlert ? <SnackbarAlert {...this.props} alertType={this.state.alertType} open={true} message={this.state.alertMessage} onClose={() => this.setState({ showAlert: false, alertMessage: '' })} /> : <></>}
				<DialogAlert
                    {...this.props}
                    type='confirm'
                    isOpen={this.state.isDialogOpen}
                    title={'Deseja Recusar a Cotação'}
                    body={'Ao confirmar a recusa da cotação, está será encerrada sem participação da sua empresa. Confirma recusa?'}
					onClose={()=> this.setState({isDialogOpen: false})}
                    onConfirm={ this.cancelQuote }
                />
				<DialogAlert
                    {...this.props}
                    type='confirm'
                    isOpen={this.state.isConfirmDialogOpen}
                    title={'Confirma o envio desta cotação?'}
                    body={''}
					onClose={()=> this.setState({isConfirmDialogOpen: false})}
                    onConfirm={ this.sendQuote }
                />
				<Box className='navbar'>
					<div className='navbar-container'>
						<div className='left-container'>
							<Box className='navbar-icon'>
								<Box className='logo'><img src={logo}></img></Box>
							</Box>
							<Box className='navbar-infos'>
								<Typography sx={{ fontSize: '12px' }}>{this.state.data?.razao_fornecedor} | CNPJ {this.state.data?.cpf_cnpj_Fornecedor}</Typography>
								<Typography sx={{ fontSize: '12px' }}>{this.state.data?.fantasia_Fornecedor}</Typography>
							</Box>
						</div>
						<Box>
							<Typography sx={{ fontSize: '12px' }}></Typography>
						</Box>
					</div>
				</Box>
				<Box className='app-body'>
					<Box className='banner'>
						<img src={banner}></img>
					</Box>
					{this.state.data ?
					<>
						<Box className='company-container'>
							<div class='left-container'>
								<Box className='navbar-icon'>
									<Box className='logo'><img src={logo2}></img></Box>
								</Box>
								<Box className='navbar-infos'>
									<Typography sx={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Empresa solicitante:</Typography>
									<Typography sx={{ fontSize: '12px' }}>{this.state.data.razao} | CNPJ {this.state.data.cpf_cnpj}</Typography>
									<Typography sx={{ fontSize: '12px' }}>{this.state.data.fantasia}</Typography>
								</Box>
							</div>
							<Box>
								<Typography sx={{ fontSize: '12px' }}>{this.state.data.nm_usuario ?? ''}</Typography>
								<Typography sx={{ fontSize: '12px' }}>{this.state.data.email_particular} | +55 {this.state.data.nr_fone}</Typography>
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
									value={this.state.data.dh_cotacao}
									label='Data da Cotação'
									handleChange={this.handleChangeText}
									type='date'
									width='100%'
									disabled='true'
								/>

								<MainDateTimeInput
									{...this.props}
									id='limitDate'
									value={this.state.data.dh_cotacao_encerramento}
									label='Data Limite para Envio'
									handleChange={this.handleChangeText}
									type='date'
									width='100%'
									disabled='true'
								/>

								<MainDateTimeInput
									{...this.props}
									id='limitTime'
									value={this.state.horario_encerramento} // Horário de encerramento após split
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
									disabled={this.state.data.at_situacao != 759 ? true : false}
								/>

								<Box></Box>
								{this.state.data.at_situacao == 759 ?
								<MainButton
									{...this.props}
									sx={{
										borderColor: this.props.colors.redAccent[500],
										textColor: this.props.colors.redAccent[500],
										borderRadius: '8px'
									}}
									onButtonClick={() => { this.setState({ isDialogOpen: true }) }}
									title="Recusar Cotação"
									width='100%'
								/> : <></>}
							</Box>

							<EditableTable
								{...this.props}
								allowEdit
								allowEditOnRow
								noAddRow
								noDeleteButton
								id='id_item'
								height='45vh'
								data={this.state.data?.itens}
								columns={this.state.dataColumns}
								rowId='id_item'
								totalSize={this.state.dataItensTotalSize}
								onPageChange={() => { }}
								onEditRow={this.onTableEdit}
								onRowDoubleClick={() => { }}
								isLoading={this.state.isLoadingTable}
								extraColumnsConfig={
									{
										'cd_item': {
											'disabled': true,
										},
										'ds_item': {
											'disabled': true
										},
										'sg_unidademedida': {
											'disabled': true
										},
										'qt_cotacao': {
											'disabled': true,
										},
										'qt_embalagem_fornecedor': this.state.data.at_situacao === 759 ? {
											'type': 'number',
											'borders': true,
										} : {
											'type': 'number',
											'disabled': true
										},
										'vl_embalagem': this.state.data.at_situacao === 759 ? {
											'type': 'currency',
											'borders': true,
										} : {
											'type': 'currency',
											'disabled': true
										},
										'vl_unitario': this.state.data.at_situacao === 759 ? {
											'type': 'currency',
											'borders': true,
										} : {
											'type': 'currency',
											'disabled': true
										},
										'marca_desejada': {
											'disabled': true,
										},
										'marca': this.state.data.at_situacao === 759 ? {
											'borders': true,
										} : {
											'disabled': true
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
											md: '0.6fr 0.6fr 1.3fr 0.6fr 0.6fr 0.2fr 0.9fr',
										},
										marginTop: '10px'
									}}
								>

									<MainTextField
										{...this.props}
										id='nr_dias_prazo_entrega'
										value={this.state.data.nr_dias_prazo_entrega || ''}
										label='Prazo de Entrega (dias)'
										handleChange={this.handleChangeText}
										onKeyUp={this.handleKeyUp}
										width='100%'
										type='number'
										disabled={this.state.data.at_situacao != 759 ? true : false}
									/>

									<MainTextField
										{...this.props}
										id='nr_dias_prazo_pagamento'
										value={this.state.data.nr_dias_prazo_pagamento || ''}
										label='Prazo de Pagamento (dias)'
										handleChange={this.handleChangeText}
										onKeyUp={this.handleKeyUp}
										width='100%'
										type='number'
										disabled={this.state.data.at_situacao != 759 ? true : false}
									/>

									<MainSelectInput
										{...this.props}
										id='paymentType'
										value={this.state.paymentType || ''}
										optionsList={this.state.paymentList}
										label='Forma de Pagamento'
										handleChange={this.handleChangeText}
										onKeyUp={this.handleKeyUp}
										width='100%'
										disabled={this.state.data.at_situacao != 759 ? true : false}
									/>

									<MainTextField
										{...this.props}
										id='dataItensTotalSize'
										value={this.state.dataItensTotalSize || ''}
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
									{new Date(this.state.data.dh_cotacao_encerramento) > datetimeNow && this.state.data.at_situacao === 759 ?
										<MainButton
											{...this.props}
											sx={{
												backgroundColor: 'orange',
												borderRadius: '8px'
											}}
											onButtonClick={() => { this.setState({isConfirmDialogOpen: true}) }}
											title="Enviar Cotação"
											width='100%'
										/>
									:
										<MainButton
											{...this.props}
											sx={{
												backgroundColor: this.props.colors.redAccent[500],
												borderRadius: '8px',
												cursor: 'auto'
											}}
											onButtonClick={() => { }}
											title="Cotação Encerrada"
											width='100%'
											disabled
										/>
									}
								</Box>
							</Box>
						</Box>
					</>
					: <></>}
				</Box>
			</>
		)
	}
}

export default withHooks(App)
