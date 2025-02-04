import React from "react";

import dayjs from "dayjs";
import DialogAlert from "./components/alerts/DialogAlert";
import EditableTable from "./components/tables/EditableTable";
import MainButton from "./components/inputs/MainButton";
import MainDateTimeInput from "./components/inputs/MainDateTimeInput";
import MainSelectInput from "./components/inputs/MainSelectInput";
import MainTextField from "./components/inputs/MainTextField";
import SnackbarAlert from "./components/alerts/SnackbarAlert";

import CloseIcon from '@mui/icons-material/Close';

import logo from "./data/logo.png";
import logo2 from "./data/logo2.png";
import banner from "./data/banner.png";

import acoes_lapis from "./data/popup/acoes_lapis.png";
import acoes_salvar from "./data/popup/acoes_salvar.png";
import botao1 from "./data/popup/botao1.png";
import botao2 from "./data/popup/botao2.png";
import header from "./data/popup/header.png";
import inputs from "./data/popup/inputs.png";
import LoadingGif from "./components/visual/LoadingGif";
import marca_desejada from "./data/popup/marca_desejada.png";
import marca_disponivel from "./data/popup/marca_disponivel.png";
import qtd_embalagem from "./data/popup/qtd_embalagem.png";
import resumo from "./data/popup/resumo.png";
import tabela from "./data/popup/tabela.png";
import valor_embalagem from "./data/popup/valor_embalagem.png";
import valor_unitario from "./data/popup/valor_unitario.png";

import { Box, Button, Divider, Grid, IconButton, Typography } from "@mui/material";
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

			showPopUp: false,

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
				['qt_cotacao', 'Q. Cotação'],
				['qt_embalagem_fornecedor', 'Q. por Embalagem'],
				['vl_embalagem', 'V. Embalagem'],
				['vl_unitario', 'V. Unitário'],
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
				var options = r.data.filter((value) => value.at_situacao === 1)
				
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

				if (r.data.itens && typeof r.data.itens === 'object' && !Array.isArray(r.data.itens)) {
					r.data.itens = []
				} else if (!r.data.itens) {
					r.data.itens = []
				} else {
					r.data.itens = r.data.itens.sort((a, b) => a['id_item'] - b['id_item'])
				}

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
		}, () => {
			if (this.state.focusedInput !== 'buttonRef') {
				params.target.select() // seleciona todo o conteúdo quando em foco (ctrl + A)
			} else {
				return
			}
		})
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
				<LoadingGif />
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
								<Box className='company-outcontainer'>
									<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '30px', width: '100%', flexDirection: { xs: 'column', lg:'row'} }}>

										<div className="company-container-left">
											<Box className='navbar-icon'>
												<Box className='logo'><img src={logo2} alt="Logo"></img></Box>
											</Box>
											<Box className='navbar-infos'>
												<Typography sx={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Empresa solicitante:</Typography>
												<Typography sx={{ fontSize: '12px' }}>{this.state.data.razao} | CNPJ {this.state.data.cpf_cnpj}</Typography>
												<Typography sx={{ fontSize: '12px' }}>{this.state.data.fantasia}</Typography>
											</Box>
										</div>

										<div className="company-container-right">
											<Box>
												<Typography sx={{ fontSize: '12px' }}>{this.state.data.nm_usuario ?? ''}</Typography>
												<Typography sx={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{this.state.data.email_particular} | {this.state.data.nr_fone ? `+55 ${this.state.data.nr_fone}` : ''}</Typography>
											</Box>
											<Button className='help-button' onClick={() => { this.setState({ showPopUp: true }) }}><Typography>Como preencher a cotação</Typography></Button>
										</div>
									</Box>
								</Box>

								<Box sx={{ backgroundColor: 'white', padding: '10px 25px', borderRadius: '10px', margin: '25px 0' }}>
									<Box
										sx={{
											display: 'grid',
											gap: '25px',
											alignItems: 'center',
											gridTemplateColumns: {
												sm: '1fr',
												md: '0.6fr 0.6fr 0.6fr 0.5fr 1.6fr 0.7fr',
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
										allowEdit={this.state.isValid ? true : false}
										allowEditOnRow={this.state.isValid ? true : false}
										noAddRow
										noDeleteButton
										id='id_item'
										data={this.state.data?.itens}
										columns={this.state.dataColumns}
										rowId='id_item'
										totalSize={this.state.dataItensTotalSize}
										onPageChange={() => { }}
										onEditRow={this.onTableEdit}
										onRowDoubleClick={() => { }}
										isLoading={this.state.isLoadingTable}
										editableFields={['qt_embalagem_fornecedor', 'vl_embalagem', 'marca']}
										extraColumnsConfig={
											{
												'qt_cotacao': {
													'type': 'number',
													'maxDecimals': '4',
												},
												'qt_embalagem_fornecedor': this.state.isValid ? {
													'type': 'number',
													'maxDecimals': '4',
												} : {
													'type': 'number',
													'maxDecimals': '4',
													'disabled': true
												},
												'vl_embalagem': this.state.isValid ? {
													'type': 'number',
													'maxDecimals': '2',
													'prefix': 'R$',
												} : {
													'type': 'number',
													'maxDecimals': '2',
													'prefix': 'R$',
													'disabled': true
												},
												'vl_unitario': {
													'type': 'number',
													'maxDecimals': '4',
													'prefix': 'R$',
												},
												'marca': this.state.isValid ? {
													'type': 'text',
													'borders': true,
												} : {
													'disabled': true
												},
											}
										}
										customRowSize={
											{
												'ds_item': 210,
												'sg_unidademedida': 70,
											}
										}
									/>

									<Box sx={{ marginTop: '25px' }}>
										<Typography>Resumo da Cotação</Typography>
										<Box
											sx={{
												display: 'grid',
												gap: '25px',
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
												onFocus={this.onInputFocus}
											/>

											<MainSelectInput
												{...this.props}
												ref={this.paymentTypeRef}
												id='cd_condicaovendacompra'
												value={this.state.data.cd_condicaovendacompra || ''}
												optionsList={this.state.paymentList.map(value => ({ label: value.cd_condicaovendacompra.toString() + ' - ' + value.ds_condicaovendacompra, value: value.cd_condicaovendacompra }))}
												label='Forma de Pagamento'
												handleChange={this.handleChangeText}
												onKeyUp={this.handleKeyUp}
												width='100%'
												disabled={!this.state.isValid}
												onFocus={this.onInputFocus}
											/>

											<MainTextField
												{...this.props}
												id='dataItensTotalSize'
												value={this.state.dataItensTotalSize || ''}
												label='Q. de Itens'
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

				{this.state.showPopUp &&
					(
						<PopUp onClose={() => { this.setState({ showPopUp: false }) }} />
					)}
			</>
		)
	}
}

class PopUp extends React.Component {

	render() {
		return (
			<>
				<Box className='popup'>
					<Box className='outer-box'>
						<Box className='content'>
							<Box className='header'>
								<Typography className='title'>Entenda como preencher os campos e enviar a sua cotação</Typography>

								<IconButton sx={{ margin: '0 15px 0 20px', backgroundColor: '#fff', height: '45px', width: '45px', borderRadius: '100%' }} onClick={this.props.onClose}>
									<CloseIcon sx={{ color: '#000', fontSize: '30px' }} />
								</IconButton>
							</Box>

							<Typography sx={{ marginTop: '25px' }} className='text'>Este espaço mostra os dados da empresa solicitante da cotação, assim como os dados do comprador responsável.</Typography>
							<img class='image' src={header}></img>

							<Divider />

							<Typography sx={{ marginTop: '25px' }} className='text'>Neste espaço você confere os dados de controle da cotação. Fique atento à data e horário limite para enviar sua proposta. Até o encerramento do prazo, você poderá alterar os dados da cotação a qualquer momento.</Typography>
							<img class='image' src={inputs}></img>

							<Divider />

							<Typography sx={{ marginTop: '25px' }} className='text'>No bloco seguinte do formulário, você poderá verificar os itens e as quantidades solicitadas na cotação. Nesta lista, alguns itens poderão apresentar uma quantidade de cotação (QTD COTAÇÃO) igual a zero. Nestes casos, trata-se de uma tomada de preços para atualização de tabelas. </Typography>

							<img class='image' src={tabela}></img>

							<Typography sx={{ marginTop: '25px' }} className='text'>Informe em cada linha da tabela, os dados dos itens os quais deseja incluir na proposta. Se alguns dos itens não forem fornecidos por você, deixe os campos em branco. Veja o que preencher em cada um deles: </Typography>

							<Grid container columnSpacing={2} rowSpacing={4} sx={{ margin: '25px 0' }}>
								<Grid item md={2}><img class='image' src={qtd_embalagem}></img></Grid>
								<Grid item md={4} className='grid'><Typography className='text'>Informe neste campo a quantidade de itens contidos em cada embalagem. Exemplo: 12 se a embalagem for uma caixa com 12 itens.</Typography></Grid>

								<Grid item md={2}><img class='image' src={valor_embalagem}></img></Grid>
								<Grid item md={4} className='grid'><Typography className='text'>Informe neste campo o valor total da embalagem de seu fornecimento.</Typography></Grid>

								<Grid item md={2}><img class='image' src={valor_unitario}></img></Grid>
								<Grid item md={4} className='grid'><Typography className='text'>Neste campo aparecerá o valor unitário que o sistema calcula e gera, dividindo o valor da embalagem pela quantidade de itens contidos nela.</Typography></Grid>

								<Grid item md={2}><img class='image' src={marca_desejada}></img></Grid>
								<Grid item md={4} className='grid'><Typography className='text'>Este campo será preenchido pelo sistema quando houver uma indicação de marca que seja relevante para o solicitante. </Typography></Grid>

								<Grid item md={2}><img class='image' src={marca_disponivel}></img></Grid>
								<Grid item md={4} className='grid'><Typography className='text'>Este campo não é obrigatório, mas pode ser preenchido com a marca do produto fornecido, principalmente, para que o solicitante avalie no caso de uma possível substituição. </Typography></Grid>

								<Grid item md={2}><img class='image' src={acoes_lapis}></img></Grid>
								<Grid item md={4} className='grid'><Typography className='text'>Ao clicar no ícone do “lápis” você terá permissão para alterar os valores informados no produto. </Typography></Grid>

								<Grid item md={2}><img class='image' src={acoes_salvar}></img></Grid>
								<Grid item md={4} className='grid'>
									<Typography className='text'>
										Depois de inserir as informações desejadas, basta clicar no ícone do “disquete” para que o sistema salve as informações na tela e calcule o valor unitário do produto.
									</Typography>
									<Typography className='text'>
										Ao clicar no ícone do “X” os dados inseridos sobre o produto serão desfeitos.
									</Typography>
								</Grid>
							</Grid>

							<Divider />

							<Typography sx={{ marginTop: '25px' }} className='text'>No bloco seguinte do formulário, você poderá verificar os itens e as quantidades solicitadas na cotação. Nesta lista, alguns itens poderão apresentar uma quantidade de cotação (QTD COTAÇÃO) igual a zero. Nestes casos, trata-se de uma tomada de preços para atualização de tabelas. </Typography>

							<img class='image' src={resumo}></img>

							<Divider />

							<Grid container sx={{ margin: '25px 0' }}>
								<Grid item md={4}>
									<Box>
										<img class='image' src={botao1}></img>
									</Box>
								</Grid>
								<Grid item md={8}>
									<Typography className='text'>
										O botão ”Enviar Cotação”, salva toda a cotação que você montou até o momento e envia para o sistema do solicitante, que
										será atualizado com as informações. Sugerimos que você, durante o processo de cotação e mesmo não tendo a cotação
										finalizada, acione este botão para que os dados já informados sejam salvos.
									</Typography>
									<Typography className='text'>
										<b>Lembre-se:</b> Enquanto o prazo da cotação estiver aberto, você poderá alterar os dados informados e enviar para o
										comprador.
									</Typography>
								</Grid>
							</Grid>

							<Divider />

							<Grid container sx={{ marginTop: '25px' }}>
								<Grid item md={4}>
									<Box>
										<img class='image' src={botao2}></img>
									</Box>
								</Grid>
								<Grid item md={8}>
									<Typography className='text'>
										Ao clicar em “Recusar cotação”, você informa ao comprador que não tem interesse em participar daquela cotação
										específica. Isso faz com que o formulário se feche, impossibilitando a participação da sua empresa. Ele será reaberto em
										uma nova oportunidade de participação.
									</Typography>
								</Grid>
							</Grid>

						</Box>
					</Box>
				</Box>
			</>
		)
	}
}

export default withHooks(App)
