import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClientUtils } from '../utils/http-client.utils';


@Injectable({
  providedIn: 'root'
})
export class CajachicaService {

  dataCaja: any
  dataCajachica: any
  dataCajaVales: any
  dataCajaGastos: any
  dataCajaAny: any

  cca_anyper: number
  cca_id: number
  ccv_id: number

  constructor(private httpClientUtils: HttpClientUtils, private http: HttpClient) { }

  ingresarUsuario(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/usuario/ingresar', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  listarUsuario(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/usuario/listar', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  listarCajaAnual(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/listar-any', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  consultarPide(data: any) {
    return this.httpClientUtils
      .postQueryPide('persona/buscar-pide', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  consultarPideJuridica(data: any) {
    return this.httpClientUtils
      .postQueryPide('juridica/buscar', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  consultarCajaChicasel(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/listar', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  listarMenu(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/listar-menu', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  registrarCajaVales(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/vales-crear', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  registrarCajaGastos(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/gastos-crear', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  registrarCajaAny(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/registrar-any', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  registrarApertura(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/registrar-apertura', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  cerrarCajaPeriodo(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/cerrar-periodo', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  cerrarCajaApertura(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/cerrar-apertura', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  cerrarVale(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/cerrar-vale', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  anularGasto(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/gastos-anular', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  listarCajaVales(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/vales', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  listarCajaGastos(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/gastos', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  listarTipoDocumentoIdentidad(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/listar/tipo-documento-identidad', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  listarTipoDocumento(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/listar/tipo-documento', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  listarRubro(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/listar/rubro', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  listarArea(data: any) {
    return this.httpClientUtils
      .postQuery('cajachica/gestion/listar/area', data)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  exportarCajaXlS(data: any): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Ajusta la URL para incluir el parámetro p_ccp_id
    const url = `http://localhost/test/public/v1/cajachica/gestion/caja-exportar?p_ccp_id=${data}`;

    return this.http.get(url, {
      headers: headers,
      responseType: 'blob',
    });
  }



}
