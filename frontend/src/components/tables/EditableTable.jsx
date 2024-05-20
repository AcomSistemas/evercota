import React from 'react';

import _ from 'lodash';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, Button, Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { getNestedProperty } from '../../utils/helpers';
import { GridRowModes, DataGrid, GridToolbarContainer, GridActionsCellItem, GridRowEditStopReasons } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';


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
                    column['valueParser'] = (value) => {

                        const parsedValue = parseInt(value, 10)
                        if (parsedValue < 1) {
                            return 1
                        } else if (parsedValue > 120) {
                            return 120
                        }
                        return parsedValue
                    }
                } 
                else if (type === 'currency') {
                    column['type'] = 'number'
                    column['renderCell'] = (params) => {
                        if (params.value != null) {
                            let adjustedValue = params.value > 99999 ? 99999 : params.value;
                            return `R$ ${adjustedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        }
                    }
                }
                
            } else {
                column['type'] = 'text'
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
        })
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
        this.props.onEditRow(rows, method, extraParam)
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
                            // backgroundColor: '#ccc',
                            // height: '40px',
                            // width: '80px',
                            '&.borders': {
                                border: `1px solid ${this.props.colors.grey[700]}`,
                                borderRadius: '10px',
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
                        />
                    </LocalizationProvider>
                </Box>
            </ThemeProvider>
        )
    }
}

export default EditableTable
