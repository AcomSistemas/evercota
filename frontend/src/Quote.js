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
import { useParams } from "react-router-dom";

import 'dayjs/locale/pt-br';

import './App.css';


function withHooks(WrappedComponent) {
	return function (props) {
		const { entity, quoteId } = useParams()
		const [theme] = useMode()
        const colors = tokens()

		return (
			<WrappedComponent colors={colors} theme={theme} {...props} entity={entity} quoteId={quoteId} />
		)
	}
}


class App extends React.Component {
	constructor(props) {
		super(props)

		let entity = this.props.entity
		let quoteId = this.props.quoteId

		this.state = {
			isLoading: true,
			isLoadingTable: true,

			isDialogOpen: false,
			isConfirmDialogOpen: false,

			alertMessage: '',
			alertType: '',
			showAlert: false,

			data: null,
			entity: entity,
			quoteId: quoteId,

			paymentList: [],

			dataColumns: [
				['cd_item', 'SKU Everest'],
				['ds_item', 'Descrição'],
				['sg_unidademedida', 'UM'],
				['qt_cotacao', 'Qtd. Cotação'],
				['qt_embalagem_fornecedor', 'Qtd. por Embalagem'],
				['vl_embalagem', 'Valor Embalagem'],
				['vl_unitario', 'Valor Unitário'],
				['marca_desejada', 'Marca Desejada'],
				['marca', 'Marca Disponível'],
			],

			dataItensTotalSize: '',
		}
		this.deliveryTermRef = React.createRef()
		this.paymentTermRef = React.createRef()
		this.paymentTypeRef = React.createRef()
		this.buttonRef = React.createRef()
		this.tableRef = React.createRef()

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
					if (value.at_situacao === 1) {
						return { ...value, value: value.cd_condicaovendacompra, label: value.cd_condicaovendacompra.toString() + ' - ' + value.ds_condicaovendacompra }
					}
				})
				this.setState({
					paymentList: options
				}, () => this.getData())
			} else {
				console.log('Erro ao trazer infos')
			}
		})
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.data?.itens !== this.state.data?.itens) {
			this.setState({ dataItensTotalSize: this.state.data.itens.length },
				() => { this.sumOfTablePackingValue() }
			)
		}

		if (this.state.totalQuoteValue !== prevState.totalQuoteValue) {
			const numericValue = this.state.totalQuoteValue

			if (numericValue !== prevState.totalQuoteValue) {
				this.setState({ totalQuoteValue: numericValue })
			}
		}
	}

	calculateUnitValue = (newData = null, currentRow = null) => {	// Divide o "Valor da Embalagem" pela "Qtd. Embalagem" e coloca o resultado em "Valor Unitário"
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
			},
			isLoading: false
		}), () => {
			if (currentRow) {
				currentRow.click()
				currentRow.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
				currentRow.focus()
			}
		})
	}

	cancelQuote = () => {
		let config = {
			endpoint: 'cota/cotacaoprecofornecedor/' + this.state.quoteId,
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
				}, () => {
					window.location.reload()
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

				const datetimeNow = new Date()
				const isValid = new Date(r.data.dh_cotacao_encerramento) > datetimeNow && r.data.at_situacao_cotacao === 759 && r.data.at_situacao === 1
				// const isValid = r.data.at_situacao_cotacao === 759 && r.data.at_situacao === 1

				let horario_encerramento

				if (r.data.dh_cotacao_encerramento) {
					horario_encerramento = r.data.dh_cotacao_encerramento.split('T')[1]
				} else {
					horario_encerramento = null
				}

				r.data.itens = r.data.itens ? r.data.itens.sort((a, b) => a['id_item'] - b['id_item']) : r.data.itens

				this.setState({
					horario_encerramento: horario_encerramento,

					data: r.data,

					isValid: isValid,

					isLoading: false,
					isLoadingTable: false,
				}, () => this.calculateUnitValue())
			} else {
				this.setState(prevState => ({
					data: {
						...prevState.data,
						at_situacao_cotacao: 1,
						at_situacao: 3
					},
					isLoading: false
				}))
			}
		})
	}

	handleChangeText = (event) => {
		// Limita o maxLength para 4
		var newValue
		if (event.target.id === 'cd_condicaovendacompra') {
			newValue = event.target.value
		} else {
			newValue = event.target.value.slice(0, 4)
		}

		this.setState(prevState => ({
			data: {
				...prevState.data,
				[event.target.id]: newValue
			}
		}))
	}

	handleKeyUp = (event) => {
		if (event.key === "Enter") {
			this.moveToNextInput()
		}
	}

	moveToNextInput = () => {
		document.activeElement.blur()
		switch (this.state.focusedInput) {
			case 'nr_dias_prazo_entrega':
				this.paymentTermRef.current.focus()
				this.setState({ focusedInput: 'nr_dias_prazo_pagamento' })
				break
			case 'nr_dias_prazo_pagamento':
				this.paymentTypeRef.current.focus()
				this.setState({ focusedInput: 'cd_condicaovendacompra' })
				break
			case 'cd_condicaovendacompra':
				this.buttonRef.current.focus()
				this.setState({ focusedInput: 'buttonRef' }, () => console.log(this.state.focusedInput))
				break
		}
	}

	onInputFocus = (params) => {
		this.setState({
			focusedInput: params.target.id,
		})
		// params.target.select() // seleciona todo o conteúdo quando em foco (ctrl + A)
	}

	onTableEdit = (row, method, extraParam, currentRow) => {
		if (method === 'edit') {
			this.setState({ isLoading: true },
				() => this.calculateUnitValue(row, currentRow))
		}
	}

	sendQuote = () => {
		const data = this.state.data

		if (data.itens && Array.isArray(data.itens)) {
			data.itens.forEach(item => {
				if (!item.qt_embalagem_fornecedor) {
					item.qt_embalagem_fornecedor = 0
				}
				if (!item.vl_embalagem) {
					item.vl_embalagem = 0
				}
			})
		}

		data?.itens?.map((value, index) => {
			value.marca = value.marca?.toUpperCase()
			value.qt_atendida = value.qt_embalagem_fornecedor ?? 0
		})

		let config = {
			endpoint: 'cota/cotacaoprecofornecedor/' + this.state.quoteId + '?x-Entidade=' + this.state.entity,
			method: 'put'
		}
		let form = {
			...data,
			dh_preenchimento: null
		}
		defaultRequest(config, form).then((r) => {
			if (r.status) {
				this.setState({
					isConfirmDialogOpen: false,
					alertMessage: 'Cotação gravada com sucesso',
					alertType: 'success',
					showAlert: true,
				}, () => {
					window.location.reload()
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

	sumOfTablePackingValue = () => {    // Soma de todos os valores de (qt_cotacao * vl_unitario)
		const { data } = this.state
		let sum = 0
		let result = 0
		let qt_cotacao = 0
		let vl_unitario = 0

		if (data && data.itens && data.itens.length > 0) {
			for (let item of data.itens) {
				qt_cotacao = item.qt_cotacao ? parseFloat(item.qt_cotacao) : 0
				vl_unitario = item.vl_unitario ? parseFloat(item.vl_unitario) : 0
				result = qt_cotacao * vl_unitario

				sum += result ? result : 0
			}
		} else {
			sum = 0
		}
		this.setState({ totalQuoteValue: sum.toFixed(2) })
	}


	render() {
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
					title={'Deseja Recusar a Cotação ?'}
					body={'Ao confirmar a recusa, esta será encerrada sem participação da sua empresa.'}
					onClose={() => this.setState({ isDialogOpen: false })}
					onConfirm={this.cancelQuote}
				/>
				<DialogAlert
					{...this.props}
					type='confirm'
					isOpen={this.state.isConfirmDialogOpen}
					title={'Confirma o envio desta cotação?'}
					body={''}
					onClose={() => this.setState({ isConfirmDialogOpen: false })}
					onConfirm={this.sendQuote}
				/>

				<Box className='navbar'>
					<div className='navbar-container'>
						<div className='left-container'>
							<Box className='navbar-icon'>
								<Box className='logo'><img src={logo} alt="EverCota"></img></Box>
							</Box>
							<Box className='navbar-infos'>
								<Typography sx={{ fontSize: '12px' }}>{this.state.data?.razao_fornecedor}{this.state.data.cpf_cnpj_Fornecedor ? ` | CNPJ ${this.state.data.cpf_cnpj_Fornecedor}` : ''}</Typography>
								<Typography sx={{ fontSize: '12px' }}>{this.state.data?.fantasia_Fornecedor}</Typography>
							</Box>
						</div>
						<Box>
							<Typography sx={{ fontSize: '12px' }}></Typography>
						</Box>
					</div>
				</Box>

				<Box className='banner'>
					<img src={banner} alt="Banner"></img>
				</Box>

				{this.state.data.at_situacao === 3 || this.state.data.at_situacao_cotacao === 1 ?
					<Box className='app-body-empty'>
						Cotação Não Encontrada...
					</Box>
					:
					<Box className='app-body'>
						{this.state.data ?
							<>
								<Box className='company-container'>
									<div className='left-container'>
										<Box className='navbar-icon'>
											<Box className='logo'><img src={logo2} alt="Logo"></img></Box>
										</Box>
										<Box className='navbar-infos'>
											<Typography sx={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Empresa solicitante:</Typography>
											<Typography sx={{ fontSize: '12px' }}>{this.state.data.razao} | CNPJ {this.state.data.cpf_cnpj}</Typography>
											<Typography sx={{ fontSize: '12px' }}>{this.state.data.fantasia}</Typography>
										</Box>
									</div>
									<Box>
										<Typography sx={{ fontSize: '12px' }}>{this.state.data.nm_usuario ?? ''}</Typography>
										<Typography sx={{ fontSize: '12px' }}>{this.state.data.email_particular} | {this.state.data.nr_fone ? `+55 ${this.state.data.nr_fone}` : ''}</Typography>
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
												md: '0.6fr 0.6fr 0.6fr 0.6fr 1.6fr 0.7fr',
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
											value={this.state.horario_encerramento}
											label='Horário Limite para Envio'
											handleChange={this.handleChangeText}
											type='time'
											width='100%'
											disabled='true'
										/>

										<MainTextField
											{...this.props}
											id='id_cotacaoprecofornecedor'
											value={this.state.data.id_cotacaoprecofornecedor || ''}
											label='Número da Cotação'
											handleChange={this.handleChangeText}
											onKeyUp={this.handleKeyUp}
											width='100%'
											type='number'
											disabled='true'
										/>

										<Box></Box>

										{this.state.isValid ?
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
											/>
											:
											<></>
										}
									</Box>

									<EditableTable
										{...this.props}
										ref={this.tableRef}
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
													'type': 'number',
													'disabled': true,
												},
												'qt_embalagem_fornecedor': this.state.isValid ? {
													'type': 'number',
													'borders': true,
												} : {
													'type': 'number',
													'disabled': true
												},
												'vl_embalagem': this.state.isValid ? {
													'type': 'currencyTwoDecimals',
													'borders': true,
												} : {
													'type': 'currencyTwoDecimals',
													'disabled': true
												},
												'vl_unitario': {
													'type': 'currencyFourDecimals',
													'disabled': true
												},
												'marca_desejada': {
													'disabled': true,
												},
												'marca': this.state.isValid ? {
													'type': 'text',
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
													md: '0.6fr 0.6fr 1fr 0.6fr 0.6fr 0.5fr 0.7fr',
												},
												marginTop: '10px'
											}}
										>

											<MainTextField
												{...this.props}
												ref={this.deliveryTermRef}
												id='nr_dias_prazo_entrega'
												value={this.state.data.nr_dias_prazo_entrega || ''}
												label='Prazo de Entrega (dias)'
												handleChange={this.handleChangeText}
												onKeyUp={this.handleKeyUp}
												width='100%'
												type='number'
												disabled={!this.state.isValid}
												isFocused={this.state.focusedInput === 'nr_dias_prazo_entrega'}
												onFocus={this.onInputFocus}
											/>

											<MainTextField
												{...this.props}
												ref={this.paymentTermRef}
												id='nr_dias_prazo_pagamento'
												value={this.state.data.nr_dias_prazo_pagamento || ''}
												label='Prazo de Pagamento (dias)'
												handleChange={this.handleChangeText}
												onKeyUp={this.handleKeyUp}
												width='100%'
												type='number'
												disabled={!this.state.isValid}
												isFocused={this.state.focusedInput === 'nr_dias_prazo_pagamento'}
												onFocus={this.onInputFocus}
											/>

											<MainSelectInput
												{...this.props}
												ref={this.paymentTypeRef}
												id='cd_condicaovendacompra'
												value={this.state.data.cd_condicaovendacompra || ''}
												optionsList={this.state.paymentList}
												label='Forma de Pagamento'
												handleChange={this.handleChangeText}
												onKeyUp={this.handleKeyUp}
												width='100%'
												disabled={!this.state.isValid}
												isFocused={this.state.focusedInput === 'cd_condicaovendacompra'}
												onFocus={this.onInputFocus}
											/>

											<MainTextField
												{...this.props}
												id='dataItensTotalSize'
												value={this.state.dataItensTotalSize || ''}
												label='Qtd. de Itens'
												handleChange={this.handleChangeText}
												onKeyUp={this.handleKeyUp}
												width='100%'
												type='number'
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
												type='number'
												disabled='true'
											/>

											<Box></Box>
											{this.state.isValid ?
												<MainButton
													{...this.props}
													id="buttonRef"
													ref={this.buttonRef}
													isFocused={this.state.focusedInput === 'buttonRef'}
													onFocus={this.onInputFocus}
													sx={{
														backgroundColor: 'orange',
														borderRadius: '8px'
													}}
													onButtonClick={() => { this.setState({ isConfirmDialogOpen: true }) }}
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
							:
							<></>
						}
					</Box>
				}
			</>
		)
	}
}

export default withHooks(App)
