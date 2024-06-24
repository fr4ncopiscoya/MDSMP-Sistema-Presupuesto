

import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { MasterService } from 'src/app/services/master.service';
import { SigtaService } from 'src/app/services/sigta.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Platform } from '@angular/cdk/platform';
import { Observable } from 'rxjs';
import { TRANSITION_DURATIONS } from 'ngx-bootstrap/modal/modal-options.class';
import { CajachicaService } from 'src/app/services/cajachica.service';



@Component({
  selector: 'app-gestion-cajachica-vales',
  templateUrl: './gestion-cajachica-vales.component.html',
  styleUrls: ['./gestion-cajachica-vales.component.css']
})
export class GestionCajachicaValesComponent implements OnInit {

  // MODAL
  @ViewChild('template') miModal!: ElementRef;
  modalRefs: { [key: string]: BsModalRef } = {}; // Objeto para almacenar los modalRefs
  modalRef?: BsModalRef;
  //FORMULARIO
  form!: FormGroup;

  @ViewChild(DataTableDirective, { static: false })
  dtElement: any;
  dtElementModal: any;

  dtTrigger: Subject<void> = new Subject<void>();
  dtTriggerModal: Subject<void> = new Subject<void>();
  // dtOptionsModal: any;
  dtOptionsModal: DataTables.Settings = {};


  /// ================== VARIABLES ============================

  //DATA PARA ALMACENAR
  data: any;
  datosCaja: any;
  datosCajaChicaVales: any;

  ccp_id: number | undefined;

  p_ccv_fecini: string | undefined;
  p_ccv_fecfin: string | undefined;

  ccv_id: number = 0;
  ccv_monval: string = ''
  ccv_observ: string = ''

  error: string = ''


  text_vales: string = ''

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
    private cajachicaService: CajachicaService,
  ) {
    this.appComponent.login = false;
    // this.dataUsuario = localStorage.getItem('dataUsuario');
    const dataCaja = localStorage.getItem('data');
    if (dataCaja !== null) {
      try {
        this.datosCaja = JSON.parse(dataCaja);
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    }


    // this.datosCaja = this.appComponent.datosCaja
    // console.log("datos-caja: ", this.datosCaja);

  }

  ngOnInit(): void {
    this.dtOptionsModal = {
      // paging: true,
      // pagingType: 'numbers',
      info: false,
      scrollY: '500px',
      // columnDefs: [
      //   { width: '500px', targets: 2 },
      // ],
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json"
      },
    }

    this.consultarCajaChicaVales();
    const fechaActual = new Date().toISOString().split('T')[0];

  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTriggerModal.unsubscribe();
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
    this.dtTriggerModal.next();


    /* (document.querySelector('.dataTables_scrollBody') as HTMLElement).style.top = '150px'; */
  }

  //OBTENGO LOS VALORES DE VARIABLES(MODAL)
  confirmClick(value: string) {
    // this.p_codcon = value;
    // this.obtenerNombrePorCod(value);
    // this.modalService.hide(1);
  }


  //DIGITAR UNICAMENTE NUMEROS
  validarNumero(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode < 48 || keyCode > 57) {
      event.preventDefault();
    }
  }

  // Método para mostrar el modal y configurar el valor de ccv_id
  modalCajaCrearVale(template: TemplateRef<any>, data: any) {
    let value = 0;

    // Si hay data y ccv_id está definido, usar ese valor
    if (data !== undefined) {
      value = data;
    }

    this.textValue(value);
    this.modalRefs['modalCajaValesCrear'] = this.modalService.show(template, { id: 1, class: '', backdrop: 'static', keyboard: false }
    );
  }

  // Método para establecer el texto dependiendo del valor de ccv_id
  textValue(data: any) {
    console.log("dataTxt:", data);

    if (data !== null) {
      console.log("llegas");
      this.cajachicaService.dataCajaVales = data
      this.text_vales = 'Editar';
    }
    else {
      this.cajachicaService.dataCajaVales = null
      this.text_vales = 'Registrar'
    }
  }



  //=========================== MODALES =============================
  cerrarModal(modalKey: string) {
    if (this.modalRefs[modalKey]) {
      this.modalRefs[modalKey].hide(); // Cierra el modal si está definido
    }
  }

  // modalCajaEditar(template: TemplateRef<any>, data: any) {
  //   this.modalRefs['modalCajaValesCrear'] = this.modalService.show(template, { id: 7, class: '', backdrop: 'static', keyboard: false });
  // }




  // ================== MENSAJES SWEETALERT =====================
  private getIconByErrorCode(errorCode: string): 'error' | 'warning' | 'info' | 'success' {
    switch (errorCode) {
      case '-100':
        return 'error';
      case '-101':
        return 'error';
      case '-102':
        return 'error';
      case '-103':
        return 'error';
      case '-104':
        return 'error';
      case '-105':
        return 'error';
      case '0':
        return 'success';
      default:
        return 'error';
    }
  }

  private errorSweetAlert(icon: 'error' | 'warning' | 'info' | 'success' = 'error') {
    Swal.fire({
      icon: icon,
      text: this.error || 'Hubo un error al procesar la solicitud',
    });
  }





  // ===================== FUNCIONES =====================

  getData(data: any) {
    console.log("data:caja:", data);
    this.ccv_id = data.ccv_id
  }

  consultarCajaChicaVales() {
    let post = {
      p_ccv_id: 0,
      p_ccp_id: this.datosCaja.ccp_id,
      // p_cca_fecini: this.p_ccv_fecini,
      // p_cca_fecfin: this.p_ccv_fecfin,
    };

    console.log(post);
    this.spinner.show();
    this.cajachicaService.listarCajaVales(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        console.log(data);

        this.datosCajaChicaVales = data;

        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
        });
      },
      error: (error: any) => {
        this.errorSweetAlert();
        this.spinner.hide();
        console.log(error);
      },
    });

  }

  actualizarVales() {
    this.consultarCajaChicaVales();
  }

  goAperturaGastos(data: any) {
    try {
      const dataGastos = JSON.stringify(data)
      localStorage.setItem('dataGastos', dataGastos)
      this.router.navigateByUrl('/cajachica-gestion-gastos')
    } catch (error) {
      console.log("error stringify");

    }
  }

  goBack() {
    this.router.navigateByUrl('/cajachica-mantenimiento')
  }

  // Obtener la fecha actual en formato "YYYY-MM-DD"
  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  limpiarCampos() {
    this.spinner.show()
    setTimeout(() => {
      this.spinner.hide();
    }, 200);

  }

}
