

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
  dataUsuario: any

  ccp_id: number | undefined;

  p_ccv_fecini: string | undefined;
  p_ccv_fecfin: string | undefined;

  ccv_id: number = 0;
  ccv_monval: string = ''
  ccv_observ: string = ''

  mensa: string = ''

  btnVerData: boolean;
  text_vales: string = ''

  //Datos de tabla superior
  monto_vale: number = 0;
  monto_gasto: number = 0;
  monto_xre: number = 0;

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
    private cajachicaService: CajachicaService,
  ) {
    this.appComponent.login = false;
    const dataUser = localStorage.getItem('dataUsuario');
    this.dataUsuario = JSON.parse(dataUser)
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
      scrollY: '350px',
      // columnDefs: [
      //   { width: '500px', targets: 2 },
      // ],
      order: [0, 'desc'],
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
  modalCajaCrearVale(template: TemplateRef<any>, data: any, ver: boolean) {
    let value = 0;

    // Si hay data y ccv_id está definido, usar ese valor
    if (data !== undefined) {
      value = data;
    }

    this.textValue(value);
    this.btnVerData = ver
    if (this.btnVerData === false) {
      this.text_vales = 'Ver'
    }
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
        console.log("llegas modal", data.ccv_id);

        this.cerrarVale(data.ccv_id);
      }
    });
  }

  // ===================== FUNCIONES =====================

  getData(data: any) {
    console.log("data:caja:", data);
    this.ccv_id = data.ccv_id
  }

  goBackTo() {
    switch (this.mensa) {
      case 'Cierre Vale Actualizada Correctamente':
        this.consultarCajaChicaVales()
    }
  }

  consultarCajaChicaVales() {
    let post = {
      p_ccv_id: 0,
      p_ccp_id: this.datosCaja.ccp_id,
    };

    console.log(post);
    this.spinner.show();
    this.cajachicaService.listarCajaVales(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        this.datosCajaChicaVales = data;
        this.calcularDatosVale(data);

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

  exportarVales() {
    let ccp_id = this.datosCaja.ccp_id

    const url = `https://webapp.mdsmp.gob.pe/cajachicabackend/public/v1/cajachica/gestion/caja-exportarvales?p_ccp_id=${ccp_id}`;
    window.open(url, '_blank');
  }

  calcularDatosVale(datos: any) {
    console.log("datos - ", datos);

    let totalMonval = 0;
    let totalMongas = 0;
    let totalMonXre = 0;

    for (let i = 0; i < datos.length; i++) {
      totalMonval += parseFloat(datos[i].ccv_monval);
      totalMongas += parseFloat(datos[i].ccv_mongas);
      totalMonXre += parseFloat(datos[i].ccv_monxre);
    }
    console.log(`Total de ccv_monval: ${totalMonval}`);
    console.log(`Total de ccv_mongas: ${totalMongas}`);
    console.log(`Total de ccv_monxre: ${totalMongas}`);

    this.monto_vale = totalMonval;
    this.monto_gasto = totalMongas;
    this.monto_xre = totalMonXre;
  }

  cerrarVale(ccv_id: number) {
    console.log("entras");

    let post = {
      p_ccv_id: ccv_id,
      p_ccv_usumov: this.dataUsuario.numid
    }
    this.cajachicaService.cerrarVale(post).subscribe({
      next: (data: any) => {
        console.log("result-vale:", data);
        this.mensa = data[0].mensa
        const errorCode = data[0].error
        const icon = this.getIconByErrorCode(errorCode)
        this.errorSweetAlert(icon, this.goBackTo.bind(this))
      }
    })
  }

  actualizarVales() {
    this.consultarCajaChicaVales();
  }

  goAperturaGastos(data: any) {
    try {
      const dataVales = JSON.stringify(data)
      localStorage.setItem('dataVales', dataVales)
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
