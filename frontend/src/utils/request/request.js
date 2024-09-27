import axios from 'axios';

export const defaultRequest = async (config, form) => {
    
    // var url = new URL('http://homologacao.acomsistemas.com.br:80/api/' + config.endpoint)
    var url = new URL('https://producao.acomsistemas.com.br/api/' + config.endpoint)
    // var url = new URL('http://webapps01.acom.net.br:8091/' + config.endpoint)

    var data = {}

    const username = 'admin'
    const password = 'evers'

    const basicAuth = 'Basic ' + btoa(username + ':' + password)

    var headers = {
        'Content-Type': 'application/json'
    }

    if (basicAuth){
        headers['Authorization'] = basicAuth
    }
    
    if (config.method === 'get' || config.method === 'delete') {
        url.search = new URLSearchParams(form)
    } 
    else if (config.method === 'post' || config.method === 'put') {
        data = form
    }

    var funcResponse = {}

    try {
        const response = await axios({
            headers: headers,
            method: config.method.toLowerCase(),
            url: url.toString(),
            data: data
        })
        funcResponse = {
            status: true,
            data: response.data
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('userToken')
        } else {
            funcResponse = {
                status: false,
                data: error.response && error.response.data ? error.response.data : '' 
            }
        }
    }    

    return funcResponse   
}