import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { createMask } from '@ngneat/input-mask';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CajachicaService } from 'src/app/services/cajachica.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-periodos-crear',
  templateUrl: './gestion-periodos-crear.component.html',
  styleUrls: ['./gestion-periodos-crear.component.css']
})
export class GestionPeriodosCrearComponent implements OnInit {

  @Output() periodoRegistrado = new EventEmitter<string>();

  dataUsuario: any;
  dataResult: any;
  dataPeriodos: any;
  yearVal: number;

  txt_button: string;

  cca_id: number
  cca_anyper: number
  cca_montot: string

  mensa: string;

  constructor(
    private cajachicaService: CajachicaService,
    private router: Router,
    private modalService: BsModalService
  ) {
    const dataUsuario = localStorage.getItem('dataUsuario');
    if (dataUsuario !== null) {
      this.dataUsuario = JSON.parse(dataUsuario)
    }
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

  private getIconByErrorCode(errorCode: number): 'error' | 'warning' | 'info' | 'success' {
    if (errorCode < 0 || errorCode === 999) {
      return 'error';
    }
    if (errorCode === 0) {
      return 'success';
    }
    return 'info';
  }

  ngOnInit(): void {
    this.yearVal = this.cajachicaService.cca_anyper
    this.dataPeriodos = this.cajachicaService.dataCajaAny
    // console.log("datos-periodo: ", this.dataPeriodos);

    if (this.dataPeriodos !== null) {
      this.cca_id = this.dataPeriodos.cca_id
      this.cca_anyper = this.dataPeriodos.cca_anyper
      this.cca_montot = this.dataPeriodos.cca_montot
      this.txt_button = 'Modificar'
    } else {
      this.txt_button = 'Registrar'
      this.cca_id = 0
      console.log(this.cca_id);
    }

  }

  registrarCajaAny() {
    const montoLimpio = this.cca_montot.replace('S/.', '').replace(',', '');
    const montoFloat = parseFloat(montoLimpio);

    let post = {
      p_cca_id: this.cca_id,
      p_cca_anyape: this.cca_anyper,
      p_cca_monape: montoFloat,
      p_cca_usumov: this.dataUsuario.numid
    }

    this.cajachicaService.registrarCajaAny(post).subscribe({
      next: (data: any) => {
        this.mensa = data[0].mensa;
        const errorCode = data[0].error;
        const icon = this.getIconByErrorCode(errorCode);
        this.errorSweetAlert(icon, this.goBackTo.bind(this));
      }
    })
  }

  goBackTo() {
    console.log("mensa: ", this.mensa);

    switch (this.mensa) {
      case 'Apertura Anual Actualizada Correctamente':
      case 'Apertura Anual Registrada Correctamente':
        this.modalService.hide(3);
        console.log("step 1");
        this.periodoRegistrado.emit();
        break;
      default:
        //
        break;
    }
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

}
