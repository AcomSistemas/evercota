import React, {forwardRef} from 'react';

import _ from 'lodash';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, Button, Stack, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { getNestedProperty } from '../../utils/helpers';
import { GridRowModes, DataGrid, GridToolbarContainer, GridActionsCellItem, GridRowEditStopReasons, GridEditInputCell } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';


class CurrencyEditInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            inputValue: (props.value || '').toString().replace('.', ',')
        }
    }

    handleChange = (event) => {
        const { maxDigits } = this.props
        const newValue = event.target.value
        // Colocar máximo de dígitos com base no maxDigits
        const regex = new RegExp(`^\\d{0,${maxDigits}}(,\\d{0,4})?$`)

        if (newValue.match(regex)) {
            this.setState({ inputValue: newValue })
            this.props.api.setEditCellValue({
                id: this.props.id,
                field: this.props.field,
                value: newValue.replace(',', '.')
            }, event)
        }
    }

    render() {
        return (
            <GridEditInputCell
                {...this.props}
                value={this.state.inputValue}
                onChange={this.handleChange}
                type="text"
            />
        )
    }
}


class EditToolbar extends React.Component {
    constructor(props) {
        super(props)
    }

    handleClick = () => {
        // const id = this.props.randomId()
        const id = '------'

        let newRow = {}

        this.props.columns.map((value, index) => {
            if (value[0] !== this.props.rowId) {
                newRow[value[0]] = ''
            } else {
                newRow[value[0]] = id
            }

        })
        this.props.setRows([newRow, ...this.props.oldRows], id)
    }

    render() {
        if (!this.props.noAddRow) {
            return (
                <GridToolbarContainer>
                    <Button sx={{ height: '30px', margin: '5px 0 10px 5px', border: '1px solid #858585', borderRadius: '20px' }} onClick={this.handleClick}>
                        Adicionar Linha
                    </Button>
                </GridToolbarContainer>
            )
        }
        return (
            <></>
        )
    }
}


class EditableTable extends React.Component {
    constructor(props) {
        super(props)

        this.editableFields = ['qt_embalagem_fornecedor', 'vl_embalagem', 'marca']

        this.state = {
            rows: this.props.data,
            columns: [],
            rowModesModel: {},
            paginationModel: { page: 0, pageSize: 100 },
            page: 0,
            isLoaded: false
        }
    }

    componentWillMount() {
        this.createColumns()
    }

    componentDidUpdate(prevProps) {
        if (this.state.rows !== this.props.data) {
            this.setState({
                rows: this.props.data
            })
        }
        if (prevProps.columns !== this.props.columns) {
            this.setState({
                isLoaded: false
            }, () => this.createColumns())
        }
    }

    calculateColumnWidths(columns, rows) {
        return columns.map(column => {
            let maxWidth = 0
            maxWidth = Math.max(maxWidth, this.getTextWidth(column.headerName))
            rows?.forEach(row => {
                const cellValue = getNestedProperty(row, column.field)?.toString()
                maxWidth = Math.max(maxWidth, this.getTextWidth(cellValue))
            })
            if (this.props.customRowSize && this.props.customRowSize[column.field]) {
                maxWidth += this.props.customRowSize[column.field]
            }
            return { ...column, minWidth: maxWidth }
        })
    }

    createColumns = () => {
        let columns = []
        let keys = this.props.columns

        keys.map((value, index) => {
            var column = {
                field: value[0],
                headerName: value[1].toUpperCase(),
                cellClassName: value[0] + '-column--cell' + (this.props.extraColumnsConfig?.[value[0]]?.disabled ? ' disabled' : '') + (this.props.extraColumnsConfig?.[value[0]]?.borders ? ' borders' : ''),
                flex: 1,
                headerAlign: 'center',
                align: 'center', // align: value[0] === this.props.id ? 'start' : 'center', 
                editable: this.props.allowEditOnRow && !(this.props.extraColumnsConfig?.[value[0]]?.disabled),
            }
            if (this.props.extraColumnsConfig && value[0] in this.props.extraColumnsConfig) {
                let type = this.props.extraColumnsConfig[value[0]]['type']

                if (type === 'number') {
                    column['type'] = 'number'
                    column['maxDigits'] = 5
                    column['renderEditCell'] = (params) => <CurrencyEditInput {...params} maxDigits={column['maxDigits']} />
                    column['renderCell'] = (params) => {
                        if (params.value !== null) {
                            let adjustedValue = params.value > 99999 ? 99999 : params.value
                            return adjustedValue.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                        }
                    }
                }
                else if (type === 'currency') {
                    column['type'] = 'number'
                    column['maxDigits'] = 5
                    column['renderEditCell'] = (params) => <CurrencyEditInput {...params} maxDigits={column['maxDigits']} />
                    column['renderCell'] = (params) => {
                        if (params.value !== null) {
                            let adjustedValue = params.value > 99999 ? 99999 : params.value
                            return `R$ ${adjustedValue.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
                        }
                    }
                }
                else if (type === 'text') {
                    column['renderEditCell'] = (params) => {
                        // Assegura que params.value é uma string, mesmo que o valor seja nulo
                        const value = params.value ? params.value.toString().toUpperCase() : '';
                        return (
                            <TextField
                                sx={{
                                    fontSize: '10px',
                                    backgroundColor: 'transparent',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    '& .MuiInputBase-root': {
                                        fontSize: '14px',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'transparent', // Remove a borda quando não está em foco
                                            borderWidth: '1px', // Pode ajustar a espessura da borda
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'transparent', // Bordas em hover, ajuste a cor conforme necessário
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'transparent', // Cor da borda quando focado, ajuste conforme necessário
                                            borderWidth: '2px', // Aumenta a borda quando focado
                                        },
                                    },
                                }}
                                value={value}
                                onChange={(event) => {
                                    const newValue = event.target.value.toUpperCase()
                                    params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue }, event)
                                }}
                                inputProps={{
                                    maxLength: 30
                                }}
                                fullWidth
                                variant="outlined"
                                autoFocus
                                inputRef={input => input && input.focus()}
                            />
                        );
                    };
                    column['renderCell'] = (params) => (
                        params.value ? params.value.toString().toUpperCase() : ''
                    )
                }

            } else {
            }

            if (value[0].split('.').length > 1) {
                var path = 'params.row.' + value[0]
                column['valueGetter'] = (params) => { return eval(path) }
            }

            columns.push(column)
        })

        this.setState({
            columns: this.calculateColumnWidths(columns, this.props.data),
            isLoaded: true
        })
    }

    generateRandom() {
        var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = ""
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n))
        }
        return retVal
    }

    getTextWidth(text) {
        // Criar um elemento canvas para medir o tamanho do texto
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '16px Arial'; // Ajuste isso para a fonte que você está usando
        return context.measureText(text).width;
    }

    handleCancelClick = (id) => () => {
        this.setState({
            rowModesModel: {
                ...this.state.rowModesModel,
                [id]: { mode: GridRowModes.View, ignoreModifications: true },
            },
        })

        const editedRow = this.state.rows.find((row) => row[this.props.rowId] === id)
        if (editedRow.isNew) {
            this.setState({
                rows: this.state.rows.filter((row) => row[this.props.rowId] !== id),
            })
        }
    }

    handleDeleteClick = (id) => () => {
        const updatedRows = this.state.rows.filter((row) => row[this.props.rowId] !== id)

        this.setState({
            rows: updatedRows,
        }, () => this.setRowsCallback(updatedRows, 'delete', id))
    }

    handleEditClick = (id) => () => {
        this.setState({
            rowModesModel: { ...this.state.rowModesModel, [id]: { mode: GridRowModes.Edit } },
        }, () => {
            this.focusFirstCell(id)
        })
    }

    focusFirstCell = (id) => {
        setTimeout(() => {
            const rowElement = document.querySelector(`[data-id='${id}']`)
            if (rowElement) {
                // Itera pelos campos editáveis e foca no primeiro que encontrar
                for (let field of this.editableFields) {
                    const cell = rowElement.querySelector(`[data-field='${field}']`)
                    if (cell) {
                        cell.click() // Dispara o modo de edição
                        const inputElement = cell.querySelector('input, textarea, select')
                        if (inputElement) {
                            inputElement.focus()
                            break // Sai do loop após focar no primeiro campo editável
                        }
                    }
                }
            }
        }, 100)
    }

    focusNextCell = (id) => {
        const currentRowIndex = this.state.rows.findIndex(row => row.id_item === id)
        const nextRowIndex = currentRowIndex + 1
        if (nextRowIndex < this.state.rows.length) {
            setTimeout(() => {
                console.log('timeout')
                const nextRow = this.state.rows[nextRowIndex]
                const row = document.querySelector(`[data-id='${nextRow.id_item}']`)
                const nextCell = row.querySelector(`[data-field='qt_embalagem_fornecedor']`)
                if (nextCell) {
                    this.setState({ currentRow: nextCell })
                    nextCell.click()
                    nextCell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
                    nextCell.focus()
                }
            }, 100)
        }
        
    }

    handleKeyDown = (params, event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            event.stopPropagation()
            const currentField = params.field
            const currentRowIndex = this.state.rows.findIndex(row => row.id_item === params.id)
            const editableRows = ['qt_embalagem_fornecedor', 'vl_embalagem', 'marca']
            const currentFieldIndex = editableRows.indexOf(currentField)

            if (currentFieldIndex < editableRows.length - 1) {

                // Move to the next field in the same row
                const nextField = editableRows[currentFieldIndex + 1]
                const row = document.querySelector(`[data-id='${params.id}']`)
                const nextCell = row.querySelector(`[data-field='${nextField}']`)

                if (nextCell) {
                    nextCell.click()
                    nextCell.focus()
                }
            } else {
                // Save the current row and move to the first field of the next row
                const nextRowIndex = currentRowIndex + 1;
                this.setState({}, () => this.handleSaveClick2(params.id))
            }
        }
    }

    handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    }

    handleRowModesModelChange = (newRowModesModel) => {
        this.setState({ rowModesModel: newRowModesModel })
    }

    handleSaveClick = (id) => () => {
        this.setState({
            rowModesModel: { ...this.state.rowModesModel, [id]: { mode: GridRowModes.View } },
        })
    }

    handleSaveClick2 = (id) => {
        this.setState({
            rowModesModel: { ...this.state.rowModesModel, [id]: { mode: GridRowModes.View } },
        }, ()=>console.log('saveclick'))
    }

    onPageChange = (newPage) => {
        this.setState({ paginationModel: { ...this.state.paginationModel, page: newPage.page } }, () => this.props.onPageChange(this.state.paginationModel.page))
    }

    processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false }
        this.setState({
            rows: this.state.rows.map((row) => (row[this.props.rowId] === newRow[this.props.rowId] ? updatedRow : row)),
        }, () => this.setRowsCallback(this.state.rows, 'edit', newRow))
        return updatedRow
    }

    setRows = (rows, id) => {
        this.setState({
            rows: rows
        }, this.setRowsCallback(rows[0], 'add'))
    }

    setRowsCallback = (rows, method, extraParam = null) => {
        this.props.onEditRow(rows, method, extraParam, this.state.currentRow)
        this.focusNextCell(extraParam.id_item)
    }

    setRowModesModel = (models) => {
        this.setState({
            rowModesModel: models
        })
    }

    render() {
        const theme = createTheme({
            components: {
                MuiDataGrid: {
                    styleOverrides: {
                        root: {
                            fontSize: '13px',
                            borderColor: this.props.colors.grey[500], // Cor da borda
                            border: 'none',
                            '--unstable_DataGrid-overlayBackground': 'transparent',
                            '--DataGrid-containerBackground': 'transparent', // cor do background do cabeçalho transparente
                        },
                        columnHeader: {
                            backgroundColor: this.props.colors.primary[400], // cor do cabeçalho
                            maxHeight: '35px', // altura do header de cada coluna
                            '&[aria-colindex="1"]': { // borderRadius no cabeçalho da primeira coluna da tabela
                                borderRadius: '20px 0 0 20px'
                            },
                            [`&[aria-colindex="${this.state.columns.length + (this.props.allowEdit ? 1 : 0)}"]`]: { // borderRadius no cabeçalho da última coluna da tabela
                                borderRadius: '0 20px 20px 0'
                            },
                        },
                        columnHeaders: {
                            maxHeight: '35px', // altura do Header total
                            '&::after': { // remove a linha abaixo do header
                                content: 'none' // 
                            },
                        },
                        cell: {
                            height: '49px',
                            margin: '2px 0',
                            '&.borders': {
                                border: `1px solid ${this.props.colors.grey[700]}`,
                                borderRadius: '10px',
                                marginRight: '2px'
                            }
                        },
                        footerContainer: {
                            height: '30px',
                            minHeight: '30px',
                            backgroundColor: this.props.colors.primary[400], // cor do footer
                            borderRadius: '20px'
                        },
                        // row: {
                        //     '&.Mui-selected': {                       // Cor da linha selecionada
                        //         backgroundColor: 'red',
                        //         '&:hover, &.Mui-focusVisible': {      // cor da linha selecionada ao passar o mouse
                        //             backgroundColor: 'green',
                        //         },
                        //     },
                        // },
                    },
                },
            },
        })

        var appendedColumns = this.state.columns
        if (this.props.allowEdit) {
            appendedColumns = [
                ...this.state.columns,
                {
                    field: 'actions',
                    type: 'actions',
                    headerName: 'AÇÕES',
                    width: 100,
                    cellClassName: 'actions',
                    getActions: ({ id, row }) => {
                        const isInEditMode = this.state.rowModesModel[id]?.mode === GridRowModes.Edit

                        if (isInEditMode) {
                            return [
                                <GridActionsCellItem
                                    icon={<SaveIcon />}
                                    label="Save"
                                    onClick={this.handleSaveClick(id)}
                                    sx={{ "& .MuiSvgIcon-root": { 'color': this.props.colors.grey[100] } }}
                                />,
                                <GridActionsCellItem
                                    icon={<CancelIcon />}
                                    label="Cancel"
                                    className="textPrimary"
                                    onClick={this.handleCancelClick(id)}
                                    sx={{ "& .MuiSvgIcon-root": { 'color': this.props.colors.grey[100] } }}
                                />,
                            ]
                        }

                        var buttonList = []

                        if (!this.props.noEditButton) {
                            if (this.props.allowEditOnRow) {
                                buttonList.push(
                                    <GridActionsCellItem
                                        icon={<EditIcon />}
                                        label="Edit"
                                        className="textPrimary"
                                        onClick={this.handleEditClick(id)}
                                        sx={{ "& .MuiSvgIcon-root": { 'color': this.props.colors.grey[100] } }}
                                    />
                                )
                            } else {
                                buttonList.push(
                                    <GridActionsCellItem
                                        icon={<EditIcon />}
                                        label="Edit"
                                        className="textPrimary"
                                        onClick={() => {
                                            row['id'] = row[this.props.rowId]
                                            this.props.onRowDoubleClick(row)
                                        }}
                                        sx={{ "& .MuiSvgIcon-root": { 'color': this.props.colors.grey[100] } }}
                                    />
                                )
                            }
                        }
                        if (!this.props.noDeleteButton) {
                            buttonList.push(
                                <GridActionsCellItem
                                    icon={<DeleteIcon />}
                                    label="Delete"
                                    onClick={this.handleDeleteClick(id)}
                                    sx={{ "& .MuiSvgIcon-root": { color: this.props.colors.grey[100] } }}
                                />
                            )
                        }

                        return buttonList
                    },
                },
            ]
        }

        return (
            <ThemeProvider theme={theme}>
                <Box
                    m={this.props.customMargin ?? '30px 0 0 0'}
                    height={this.props.height ?? '75vh'}
                    backgroundColor='transparent' // BackgroundColor da EditableTable
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs} theme={theme}>
                        
                        <DataGrid
                            paginationMode="server"
                            editMode="row"
                            loading={this.props.isLoading}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 100, page: 0 } }
                            }}
                            slots={{
                                toolbar: this.props.allowEditOnRow ? EditToolbar : null,
                                NoRowsOverlay: () => (
                                    <Stack height="100%" alignItems="center" justifyContent="center">
                                        Nenhum Resultado Encontrado
                                    </Stack>
                                ),
                                NoResultsOverlay: () => (
                                    <Stack height="100%" alignItems="center" justifyContent="center">
                                        Nenhum Resultado Encontrado
                                    </Stack>
                                )
                            }}
                            slotProps={{
                                toolbar: {
                                    setRows: this.setRows,
                                    randomId: this.generateRandom,
                                    oldRows: this.state.rows,
                                    colors: this.props.colors.custom['secondaryButton'],
                                    columns: this.props.columns,
                                    noAddRow: this.props.noAddRow,
                                    rowId: this.props.rowId
                                },
                            }}
                            columns={appendedColumns}
                            rows={this.state.rows}
                            rowCount={this.props.totalSize}
                            getRowId={(row) => row[this.props.rowId]}
                            processRowUpdate={this.processRowUpdate}
                            rowModesModel={this.state.rowModesModel}
                            onPaginationModelChange={(newPage) => this.onPageChange(newPage)}
                            onRowModesModelChange={this.handleRowModesModelChange}
                            onRowEditStop={this.handleRowEditStop}
                            onRowDoubleClick={(params, event) => { this.props.onRowDoubleClick(params.row, event) }}
                            onCellKeyDown={this.handleKeyDown}
                        />
                    </LocalizationProvider>
                </Box>
            </ThemeProvider>
        )
    }
}

const ForwardedEditableTable = forwardRef((props, ref) => {
    return <EditableTable {...props} innerRef={ref} />
})

export default ForwardedEditableTable
