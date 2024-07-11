import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { error } from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';
import { CajachicaService } from 'src/app/services/cajachica.service';
import { createMask } from '@ngneat/input-mask'
import Swal from 'sweetalert2';
import { TypeaheadOptions } from 'ngx-bootstrap/typeahead';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-gestion-gastos-crear',
  templateUrl: './gestion-gastos-crear.component.html',
  styleUrls: ['./gestion-gastos-crear.component.css']
})
export class GestionGastosCrearComponent implements OnInit {

  @Input() btnVerData: boolean
  @Output() gastoRegistrado = new EventEmitter<string>();

  // DATA TIPO DOC
  dataUsuario: any;
  dataGastos: any;
  dataTipoDoc: any;
  dataRubro: any;
  dataArea: any;
  dataTipoDocIde: any;


  //Registrar
  ccm_id: number = 0;
  ccd_id: number = 0;
  ccr_id: number = 0;
  ard_id: number = 0;
  tdi_id: number = 0;
  per_id: number = 0;
  ccv_id: number = 0;
  per_numdoi: string;
  ccm_numdoc: string;
  ccm_numser: number;
  ccm_fecdoc: string;
  ccm_fecmov: string;
  ccm_descri: string;
  ccm_numpar: string;
  ccm_observ: string;
  ccm_monmov: string;

  //RUBRO
  ccr_parpre: string;
  ccr_descri: string;
  cpp_descri: string;

  //DATOS PIDE
  pen_apemat: string = '';
  pen_apepat: string = '';
  pen_nombre: string = '';
  pej_razsoc: string = '';

  txt_button: string;
  mensa: string;
  error: number;



  constructor(
    private spinner: NgxSpinnerService,
    private cajachicaService: CajachicaService,
    private modalService: BsModalService
  ) {
    const dataUser = localStorage.getItem('dataUser')
    this.dataUsuario = JSON.parse(dataUser)

    const ccv_id = localStorage.getItem('dataVales')
    const dataVales = JSON.parse(ccv_id)
    this.ccv_id = dataVales.ccv_id
    this.dataGastos = this.cajachicaService.dataCajaGastos

    if (this.cajachicaService.dataCajaGastos !== null) {
      this.tdi_id = this.dataGastos.tdi_id
      this.ccm_id = this.dataGastos.ccm_id
      this.ccd_id = this.dataGastos.ccd_id
      this.ccr_id = this.dataGastos.ccr_id
      this.per_id = this.dataGastos.per_id
      this.per_numdoi = this.dataGastos.per_numdoi
      this.pen_apepat = this.dataGastos.pen_apepat
      this.pen_apemat = this.dataGastos.pen_apemat
      this.pen_nombre = this.dataGastos.pen_nombre
      this.ccm_numdoc = this.dataGastos.ccm_numdoc
      this.ccm_numser = this.dataGastos.ccm_numser
      this.ccm_fecdoc = this.dataGastos.ccm_fecdoc
      this.ccm_fecmov = this.dataGastos.ccm_fecmov
      this.ccm_descri = this.dataGastos.ccm_descri
      this.ccr_parpre = this.dataGastos.ccm_numpar
      this.ccr_descri = this.dataGastos.cpp_descri
      this.ccm_monmov = this.dataGastos.ccm_monmov
      this.ccm_observ = this.dataGastos.ccm_observ
      if (this.tdi_id === 2) {
        this.pej_razsoc = this.dataGastos.per_nombre
      }
      this.txt_button = 'Modificar'
    } else {
      this.txt_button = 'Registrar'
    }
    this.listarTipoDocumento()
    this.listarRubro()
    this.listarArea()
    this.listarTipoDocumentoIdentidad()
    // this.consultarPide()
  }

  ngOnInit(): void {
  }

  private getIconByErrorCode(errorCode: number): 'error' | 'warning' | 'info' | 'success' {
    if (errorCode < 0 || errorCode === 999) {
      return 'error';
    }
    if (errorCode === 0) {
      return 'success';
    }
    // Puedes agregar más condiciones aquí para otros códigos de error y sus iconos correspondientes
    return 'info'; // Valor por defecto si no se cumple ninguna condición
  }

  private errorSweetAlert(icon: 'error' | 'warning' | 'info' | 'success' = 'error', callback?: () => void) {
    console.log("mensaAlert: ", this.mensa);

    Swal.fire({
      icon: icon,
      text: this.mensa || 'Hubo un error al procesar la solicitud',
    }).then((result) => {
      if (result.isConfirmed && callback) {
        callback();
      }
    });
  }

  currencyInputMask = createMask({
    alias: 'numeric',
    groupSeparator: ',',
    digits: 2,
    digitsOptional: false,
    prefix: 'S/. ',
    placeholder: '0',
  });

  validarNumero(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode < 48 || keyCode > 57) {
      event.preventDefault();
    }
  }

  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  onSelectionChangeTipDocIde(event: any) {
    this.tdi_id = event.tdi_id
    this.per_numdoi = ''
    this.pen_apemat = ''
    this.pen_apepat = ''
    this.pen_nombre = ''
    this.pej_razsoc = ''
    // console.log(typeof this.tdi_id);
  }

  onSelectionChangeTipDoc(event: any) {
    this.ccd_id = event.ccd_id
  }

  onSelectionChangeRubro(event: any) {
    this.ccr_id = event.ccr_id
    this.ccr_parpre = event.ccr_parpre
    this.ccr_descri = event.cpp_descri
  }

  onInputChange(event: any) {
    event.target.value = event.target.value.toUpperCase();
  }

  //============ LISTAR ====================

  listarTipoDocumentoIdentidad() {
    let post = {

    }
    this.spinner.show();
    this.cajachicaService.listarTipoDocumentoIdentidad(post).subscribe({
      next: (data: any) => {
        this.spinner.hide()
        data.unshift({ tdi_id: 0, tdi_descri: 'NINGUNO' });
        this.dataTipoDocIde = data
      }
    })
  }

  listarTipoDocumento() {
    let post = {
    }

    this.spinner.show();
    this.cajachicaService.listarTipoDocumento(post).subscribe({
      next: (data: any) => {
        this.spinner.hide()
        this.dataTipoDoc = data
      }
    })
  }

  listarRubro() {
    let post = {
      // p_ccr_id: this.ccr_id
    }

    this.spinner.show();
    this.cajachicaService.listarRubro(post).subscribe({
      next: (data: any) => {
        this.spinner.hide()
        data.unshift({ ccr_id: 0, ccr_descri: 'NINGUNO' });
        this.dataRubro = data
      }
    })
  }

  listarArea() {
    let post = {
    }

    this.spinner.show();
    this.cajachicaService.listarArea(post).subscribe({
      next: (data: any) => {
        this.spinner.hide()
        this.dataArea = data
      }
    })
  }

  goBackTo() {
    switch (this.mensa) {
      case 'Gasto Registrado Correctamente':
      case 'Gasto Actualizado Correctamente':
        this.modalService.hide(7);
        this.gastoRegistrado.emit();
      // case ''
    }
  }

  limparCamposEntrada() {
    this.pej_razsoc = ''
    this.pen_apemat = ''
    this.pen_apepat = null
    this.pen_nombre = ''
    this.mensa = null
    this.error = null
  }


  consultarPide() {
    let post = {
      // p_per_id: this.per_id,
      p_tdi_id: this.tdi_id,
      p_per_numdoi: this.per_numdoi,
      app: 9,
      usuario: this.dataUsuario[0].usu_id
    }
    switch (this.tdi_id) {
      case 1:
      case 3:
        if (this.tdi_id === 1 && this.per_numdoi.length === 8 || this.tdi_id === 3 && this.per_numdoi.length === 9) {
          this.cajachicaService.consultarPide(post).subscribe({
            next: (data: any) => {
              this.error = data.error
              this.mensa = data.mensa
              if (this.error === 0) {
                this.pen_apemat = data['persona'].pen_apemat
                this.pen_apepat = data['persona'].pen_apepat
                this.pen_nombre = data['persona'].pen_nombre
                this.per_id = data['persona'].per_id
              } else {
                const icon = this.getIconByErrorCode(this.error)
                this.errorSweetAlert(icon)
                console.log("entra error 1", error);
                this.limparCamposEntrada()
              }
            },
            error: (error) => {
              this.limparCamposEntrada()
            }
          });
        } else {
          if (this.tdi_id === 1) {
            this.mensa = 'Error cantidad de digitos DNI'
            this.error = -20
            const icon = this.getIconByErrorCode(this.error)
            this.errorSweetAlert(icon)
            this.limparCamposEntrada()
          }
          if (this.tdi_id === 3) {
            this.mensa = 'Error cantidad de digitos CEX'
            this.error = -22
            const icon = this.getIconByErrorCode(this.error)
            this.errorSweetAlert(icon)
            this.limparCamposEntrada()
          }
        }
        break;
      case 2:
        if (this.tdi_id === 2 && this.per_numdoi.length === 11) {
          this.cajachicaService.consultarPideJuridica(post).subscribe({
            next: (data: any) => {
              console.log(data);
              this.error = data.error;
              this.mensa = data.mensa;

              if (this.error === 0) {
                this.pej_razsoc = data['persona'].pej_razsoc
              } else {
                const icon = this.getIconByErrorCode(this.error)
                this.errorSweetAlert(icon)
                this.limparCamposEntrada()
              }
            },
            error: (error) => {
              console.log(error);
              this.pej_razsoc = ''
              this.limparCamposEntrada()
            }
          });
        } else {
          if (this.tdi_id === 2) {
            this.mensa = 'Error cantidad digitos RUC'
            this.error = -21
            const icon = this.getIconByErrorCode(this.error)
            this.errorSweetAlert(icon)
            this.limparCamposEntrada()
          }
        }
        break;
      default:
        console.log("no consulta al pide ni jur");
        this.limparCamposEntrada()
    }
  }

  registrarGasto() {

    if (this.ccm_monmov !== undefined) {
      const montoLimpio = this.ccm_monmov.replace('S/.', '').replace(',', '');
      const montoFloat = parseFloat(montoLimpio);
      this.ccm_monmov = String(montoFloat)
    } else {
      console.log("monto: ", this.ccm_monmov);
    }

    let post = {
      p_ccm_id: this.ccm_id,
      p_ccv_id: this.ccv_id,
      p_ccd_id: this.ccd_id,
      p_ccr_id: this.ccr_id,
      p_per_id: this.per_id,
      p_ccm_numser: this.ccm_numser,
      p_ccm_numdoc: this.ccm_numdoc,
      p_ccm_fecdoc: this.ccm_fecdoc,
      p_ccm_fecmov: this.ccm_fecmov,
      p_ccm_descri: this.ccm_descri,
      p_ccm_numpar: this.ccr_parpre,
      p_ccm_observ: this.ccm_observ,
      p_ccm_monmov: this.ccm_monmov,
      p_usu_id: this.dataUsuario[0].usu_id
    }
    this.cajachicaService.registrarCajaGastos(post).subscribe({
      next: (data: any) => {
        const errorCode = data[0].error;
        this.mensa = data[0].mensa;
        const icon = this.getIconByErrorCode(errorCode);
        this.errorSweetAlert(icon, this.goBackTo.bind(this))
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

}
