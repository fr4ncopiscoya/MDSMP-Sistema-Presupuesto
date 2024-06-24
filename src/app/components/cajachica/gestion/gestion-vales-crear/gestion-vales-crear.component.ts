import { Component, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SigtaService } from 'src/app/services/sigta.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { CajachicaService } from 'src/app/services/cajachica.service';
import { createMask } from '@ngneat/input-mask'
import { GestionCajachicaComponent } from 'src/app/pages/cajachica-gestion/gestion-cajachica/gestion-cajachica.component';

@Component({
  selector: 'app-gestion-vales-crear',
  templateUrl: './gestion-vales-crear.component.html',
  styleUrls: ['./gestion-vales-crear.component.css']
})
export class GestionValesCrearComponent implements OnInit {

  @Output() valeRegistrado = new EventEmitter<string>();

  modalRefs: { [key: string]: BsModalRef } = {}; // Objeto para almacenar los modalRefs

  //FORMULARIO RESOLUCION
  idcorrl: number = 0;
  cnuinfi: string = '';
  dfeinfi: string = '';
  nmonto: any = '';

  //DATA
  datosCaja: any;
  dataUsuario: any;
  datosVale: any;
  dataArea: any;
  datosCajaChicaVales: any

  error: string = '';

  //REGISTRAR VALE - EDITAR
  text_vales: string = '';
  ccv_id: number = 0
  ccv_numero: string = ''
  ccv_feciva: string = ''
  ccv_feccva: string = ''
  ccv_monval: string = ''
  ccv_observ: string = ''

  txt_button: string = ''

  currencyInputMask = createMask({
    alias: 'numeric',
    groupSeparator: ',',
    digits: 2,
    digitsOptional: false,
    prefix: 'S/. ',
    placeholder: '0',
  });

  constructor(
    private sigtaService: SigtaService,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
    private cajachicaService: CajachicaService,
    private router: Router
  ) {
    const dataUsuario = localStorage.getItem('dataUsuario');
    if (dataUsuario !== null) {
      this.dataUsuario = JSON.parse(dataUsuario)
    }
    const dataCaja = localStorage.getItem('data');
    if (dataCaja !== null) {
      try {
        this.datosCaja = JSON.parse(dataCaja);
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    }
    const cajaVales = this.cajachicaService.dataCajaVales
    this.datosVale = cajaVales
    console.log("caja-vales: ", this.datosVale);
    if (this.datosVale !== null) {
      this.ccv_id = this.datosVale.ccv_id
      this.ccv_numero = this.datosVale.ccv_numero
      this.ccv_feccva = this.datosVale.ccv_feccva
      this.ccv_feciva = this.datosVale.ccv_feciva
      this.ccv_monval = this.datosVale.ccv_monval
      this.ccv_observ = this.datosVale.ccv_observ
    } else {
    }
  }

  ngOnInit(): void {
    if (this.ccv_id > 0) {
      this.txt_button = 'Modificar'
    } else {
      this.txt_button = 'Registrar'
    }
    this.listarArea();
  }

  goBackTo() {
    setTimeout(() => {
      switch (this.error) {
        case 'Vale Caja Registrado Correctamente':
        case 'Vale Caja Actualizado Correctamente':
          this.modalService.hide(1)
          this.valeRegistrado.emit();
          break;
        default:
          //
          break;
      }
    });
  }

  private errorSweetAlert(icon: 'error' | 'warning' | 'info' | 'success' = 'error', callback?: () => void) {
    Swal.fire({
      icon: icon,
      text: this.error || 'Hubo un error al procesar la solicitud',
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
    // Puedes agregar más condiciones aquí para otros códigos de error y sus iconos correspondientes
    return 'info'; // Valor por defecto si no se cumple ninguna condición
  }


  cerrarModal(modalKey: string) {
    console.log("cerrarModal called with modalKey:", modalKey);
    if (this.modalRefs[modalKey]) {
      this.modalRefs[modalKey].hide(); // Cierra el modal si está definido
    } else {
      console.log("Modal reference not found for key:", modalKey);
    }
  }

  validarNumero(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode < 48 || keyCode > 57) {
      event.preventDefault();
    }
  }

  validarRegistroAnular() {
    console.log(this.cnuinfi);
    console.log(this.dfeinfi);

    //BUTTONS
    const btnguardar = document.getElementById('btn-guardar');
    const btnanular = document.getElementById('btn-anular');

    //INPUTS
    const inputnumero = document.getElementById('input-cnuinfi');
    const inputfecha = document.getElementById('input-dfeinfi');

    if (this.cnuinfi === null && this.dfeinfi === null) {
      //buttons
      btnguardar?.classList.remove('show-hide');
      btnanular?.classList.add('show-hide');

      //inputs
      inputnumero?.classList.remove('disabled-color');
      inputfecha?.classList.remove('disabled-color');
      inputnumero?.removeAttribute('disabled')
      inputfecha?.removeAttribute('disabled')

    } else {
      //buttons
      btnanular?.classList.remove('show-hide');
      btnguardar?.classList.add('show-hide');

      //inputs
      inputnumero?.classList.add('disabled-color');
      inputfecha?.classList.add('disabled-color');
      inputnumero?.setAttribute('disabled', 'disabled')
      inputfecha?.setAttribute('disabled', 'disabled')

    }
  }

  validarMonto(event: any): void {
    const keyCode = event.keyCode;
    // Permitir números del 0 al 9 (48-57) y el punto (46)
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
      event.preventDefault();
    }
  }

  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // consultarCajaChicaVales() {
  //   let post = {
  //     p_ccv_id: 0,
  //     p_ccp_id: this.datosCaja.ccp_id,
  //   };

  //   console.log(post);
  //   this.spinner.show();
  //   this.cajachicaService.listarCajaVales(post).subscribe({
  //     next: (data: any) => {
  //       this.spinner.hide();
  //       console.log(data);

  //       this.cajachicaService.dataCajaVales = data;
  //       try {
  //         const dataGastos = JSON.stringify(data)
  //         localStorage.setItem('dataGastos', dataGastos)
  //         this.router.navigateByUrl('/cajachica-gestion-gastos')
  //       } catch (error) {
  //         console.log("error stringify");

  //       }

  //     },
  //     error: (error: any) => {
  //       this.errorSweetAlert();
  //       this.spinner.hide();
  //       console.log(error);
  //     },
  //   });

  // }

  registrarVales() {
    const montoLimpio = this.ccv_monval.replace('S/.', '').replace(',', '');
    const montoFloat = parseFloat(montoLimpio);

    // const nmontoAsNumber = parseFloat(this.ccv_monval);

    let post = {
      p_ccv_id: this.ccv_id,
      p_ccp_id: this.datosCaja.ccp_id,
      p_ccv_numero: this.ccv_numero,
      p_ccv_feciva: this.ccv_feciva,
      p_ccv_feccva: this.ccv_feccva,
      p_ccv_monval: montoFloat,
      p_ccv_observ: this.ccv_observ,
      p_ccv_usumov: this.dataUsuario.numid,
    }

    console.log(post);
    this.spinner.show();

    this.cajachicaService.registrarCajaVales(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        console.log(data);

        this.error = data[0].mensa;
        const errorCode = data[0].error;
        console.log(this.error);

        // Selecciona el icono según el código de error
        const icon = this.getIconByErrorCode(errorCode);

        // Muestra el SweetAlert con el icono y el mensaje de error
        this.errorSweetAlert(icon, this.goBackTo.bind(this));
        // this.valeRegistrado.emit();

      },
      error: (error: any) => {
        // this.errorSweetAlertData();
        this.spinner.hide();
        console.log(error);
      },
    });
  }

  listarArea() {
    let post = {
    }

    // this.spinner.show();
    this.cajachicaService.listarArea(post).subscribe({
      next: (data: any) => {
        // this.spinner.hide()
        this.dataArea = data
      }
    })
  }

}
