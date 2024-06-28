import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { createMask } from '@ngneat/input-mask';
import { BsModalService } from 'ngx-bootstrap/modal';
import { GestionCajachicaComponent } from 'src/app/pages/cajachica-gestion/gestion-cajachica/gestion-cajachica.component';
import { CajachicaService } from 'src/app/services/cajachica.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-cajachica-crear',
  templateUrl: './gestion-cajachica-crear.component.html',
  styleUrls: ['./gestion-cajachica-crear.component.css']
})
export class GestionCajachicaCrearComponent implements OnInit {
  @Input() verBtnModal: boolean;
  @Output() cajaRegistrada = new EventEmitter<string>()

  datosCajachica: any
  dataUsuario: any

  mensa: string;

  ccp_id: number;
  cca_monape: string;
  ccp_fecape: string;
  ccp_numape: number;
  ccp_observ: string;

  txtBtn: string;

  btnVerData: boolean

  constructor(
    private cajachicaService: CajachicaService,
    private modalService: BsModalService
  ) {
    const dataUser = localStorage.getItem('dataUsuario')
    this.dataUsuario = JSON.parse(dataUser)
    // console.log("data-user: ", this.dataUsuario);
  }

  ngOnInit(): void {
    this.datosCajachica = this.cajachicaService.dataCajachica
    if (this.datosCajachica !== null) {
      this.ccp_id = this.datosCajachica.ccp_id
      this.cca_monape = this.datosCajachica.cca_monape
      this.ccp_fecape = this.datosCajachica.ccp_fecape
      this.ccp_numape = this.datosCajachica.ccp_numape
      this.ccp_observ = this.datosCajachica.cca_observ
      this.txtBtn = 'Modificar'
    } else {
      this.ccp_id = 0
      this.txtBtn = 'Registrar'
    }
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
    Swal.fire({
      icon: icon,
      text: this.mensa || 'Hubo un error al procesar la solicitud',
    }).then((result) => {
      if (result.isConfirmed && callback) {
        callback();
      }
    });
  }

  public sweetAlertValidar(data: any, title_val: string, confirmButtonText_val: string) {
    console.log("data-validar: ", data);

    Swal.fire({
      // title: "Estas seguro de anular esta resolución?",
      title: title_val,
      text: "No podrás deshacer esto!",
      // text: text_val,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmButtonText_val
      // confirmButtonText: "Si, anular"
    }).then((result) => {
      if (result.isConfirmed) {
        //
      }
    });

  }

  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  validarNumero(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode < 48 || keyCode > 57) {
      event.preventDefault();
    }
  }

  currencyInputMask = createMask({
    alias: 'numeric',
    groupSeparator: ',',
    digits: 2,
    digitsOptional: false,
    prefix: 'S/. ',
    placeholder: '0',
  });

  goBackTo() {
    switch (this.mensa) {
      case 'Apertura Caja Registrada Correctamente':
      case 'Apertura Caja Actualizado Correctamente':
        this.modalService.hide(3);
        this.cajaRegistrada.emit();
        break;
      default:
        //
        break;
    }
  }

  registrarApertura() {
    const montoLimpio = this.cca_monape.replace('S/.', '').replace(',', '');
    const montoFloat = parseFloat(montoLimpio);

    let post = {
      p_cca_id: this.cajachicaService.cca_id,
      p_ccp_id: this.ccp_id,
      p_ccp_numape: this.ccp_numape,
      p_ccp_fecape: this.ccp_fecape,
      p_ccp_monape: montoFloat,
      p_ccp_observ: this.ccp_observ,
      p_ccp_usumov: this.dataUsuario.numid,
    }

    this.cajachicaService.registrarApertura(post).subscribe({
      next: (data: any) => {
        this.mensa = data[0].mensa
        const errorCode = data[0].error
        const icon = this.getIconByErrorCode(errorCode)
        this.errorSweetAlert(icon, this.goBackTo.bind(this))
      }
    })
  }
}
