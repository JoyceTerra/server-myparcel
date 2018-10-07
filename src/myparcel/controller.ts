import Axios from 'axios'
import { sendToPrinter } from '../printer/controller'

import { 
  printPDFBuffer 
} from '../lib/printer'

import {
  BASE_URL,
  BASE_URL_AUTH,
  CREDENTIALS
} from '../lib/common'

export const AxiosAuth = async () => Axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: await Axios.post(BASE_URL_AUTH, CREDENTIALS).then(resp => `${resp.data.token_type} ${resp.data.access_token}`),
    Accept: 'application/vnd.api+json',
    ContentType: 'application/vnd.api+json'
  }
})

export const getShipments = (axios, date) => {
  return axios
    .get(`${BASE_URL}/shipments?filter[search]=${date}&include=shipment_status`)
    .then(response =>  response.data.data)
    .catch(err => console.error(err))
}

export const registerShipment = (axios, shipment) => {
  shipment.attributes.register_at = 0
  const ship = {
    data: shipment
  }
  return axios
    .patch(`${BASE_URL}/shipments/${shipment.id}`,ship)
    .then(response =>  response.data)
    .catch(err => console.error(err))
}

export const getFile = (axios, shipment) => {
  return axios
    .get(`${BASE_URL}/shipments/${shipment}/files`)
    .then(response =>  response.data)
    .catch(err => console.error(err))
}

export const getContent = (axios, fileId) => {
  return axios.get(`${BASE_URL}/files/${fileId}`, {
    headers: {
      Accept: 'application/pdf',
      ContentType: 'application/pdf' 
    }
  })
    .then(response => { printPDFBuffer(Buffer.from(response.data, 'base64'))})
    .catch(err => console.log(err))
}

export const  printLabels = (date) =>{
  return AxiosAuth()
  .then(axios => getShipments(axios, date))
  
  //Logic to get files from myParcel.com

  .then(labels => sendToPrinter(labels))
  .then(resp => resp)
  .catch(err => console.log(err))
}

export const countLabels = (date) => {
  return AxiosAuth()
  .then(axios => getShipments(axios, date))
  .then(resp => resp.length)
  .catch(err => console.log(err))
}


//let ShipmentsAfterPatch = <any> await Promise.all(shipments.data.map(shipment => registerShipment(axios, shipment)))      
//let ShipmentsAfterPatch1 = <any> await Promise.all(ShipmentsAfterPatch.map(x=> getFile(axios, x.data.id)))
//let ShipmentAfterPatch2 = <any> await Promise.all(ShipmentsAfterPatch1.map(y => getContent(axios, y.data[0].id)))