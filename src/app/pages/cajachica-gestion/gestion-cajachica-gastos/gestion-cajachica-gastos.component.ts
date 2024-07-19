import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  ElementRef,
  Output,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { MasterService } from 'src/app/services/master.service';
import { SigtaService } from 'src/app/services/sigta.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Platform } from '@angular/cdk/platform';
import * as XLSX from 'xlsx';
import { Observable } from 'rxjs';
import { TRANSITION_DURATIONS } from 'ngx-bootstrap/modal/modal-options.class';
import { CajachicaService } from 'src/app/services/cajachica.service';



@Component({
  selector: 'app-gestion-cajachica-gastos',
  templateUrl: './gestion-cajachica-gastos.component.html',
  styleUrls: ['./gestion-cajachica-gastos.component.css']
})
export class GestionCajachicaGastosComponent implements OnInit {
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
  dataMulta: any;
  datosExpediente: any;
  datosContribuyente: any;
  datosNombreContribuyente: any = [];
  datosDescripcion: any;
  dataUsuario: any;
  datosFechas: any;

  datosCajaVale: any;
  datosCajaChicaGastos: any

  //Pasar Data
  btnVerData: boolean

  text_vales: string;
  txt_chekbox: string;
  mensa: string;
  error: number;

  ccm_id: number;
  ccm_activo: number;
  chk_activo: number;
  chk_btn: boolean = true;


  constructor(
    private appComponent: AppComponent,
    private serviceMaster: MasterService,
    private router: Router,
    private route: ActivatedRoute,
    // private spinner: NgxSpinnerService,
    private spinner: NgxSpinnerService,
    private sigtaService: SigtaService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private platform: Platform,
    private cajachicaService: CajachicaService
  ) {
    this.appComponent.login = false;
    const dataUsuario = localStorage.getItem('dataUsuario');
    this.dataUsuario = JSON.parse(dataUsuario)
    const dataVales = localStorage.getItem('dataVales')
    if (dataVales !== null) {
      this.datosCajaVale = JSON.parse(dataVales)
    }
    console.log("dataVales: ", this.datosCajaVale.ccv_cierre);

  }

  ngOnInit(): void {
    this.dtOptionsModal = {
      // paging: true,
      // pagingType: 'numbers',
      info: false,
      scrollY: '350px',
      columnDefs: [
        // { width: '500px', targets: 4 },
      ],
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json"
      },
    }
    this.listarCajaChicaGastos(true);
    const fechaActual = new Date().toISOString().split('T')[0];

  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  //DIGITAR UNICAMENTE NUMEROS
  validarNumero(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode < 48 || keyCode > 57) {
      event.preventDefault();
    }
  }

  rellenarCeros() {
    // this.p_numexp = this.p_numexp.padStart(6, '0')
  }

  onInputChange(event: any) {
    event.target.value = event.target.value.toUpperCase();
  }

  checkboxChange(value: any) {
    console.log("estado: ", value);
    this.listarCajaChicaGastos(value);
  }



  //=========================== MODALES =============================
  cerrarModal(modalKey: string) {
    if (this.modalRefs[modalKey]) {
      this.modalRefs[modalKey].hide(); // Cierra el modal si está definido
    }
  }


  modalCajaGastosValue(template: TemplateRef<any>, data: any, ver: boolean) {
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

    this.modalRefs['modalCrearGastosVale'] = this.modalService.show(template, { id: 7, class: 'modal-lg', backdrop: 'static', keyboard: false });
    // this.sigtaService.idcorrl = this.idcorrl;
  }

  // Método para establecer el texto dependiendo del valor de ccv_id
  textValue(data: any) {
    console.log("dataTxt:", data);
    if (data !== null) {
      console.log("llegas");
      this.cajachicaService.dataCajaGastos = data
      this.text_vales = 'Editar';
    } else {
      this.cajachicaService.dataCajaGastos = null
      this.text_vales = 'Registrar';
    }
  }




  // ================== MENSAJES SWEETALERT =====================

  private getIconByErrorCode(errorCode: number): 'error' | 'warning' | 'info' | 'success' {
    if (errorCode < 0 || errorCode === 999) {
      return 'error';
    }
    if (errorCode === 0) {
      return 'success';
    }
    return 'info';
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
    console.log("data-act: ", data);
    this.ccm_id = data.ccm_id;
    const activo = data.ccm_activo
    if (activo !== 1) {
      title_val = 'Esta seguro de activar este gasto?'
      confirmButtonText_val = 'Si, activar gasto'
    } else {
    }

    Swal.fire({
      title: title_val,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmButtonText_val
    }).then((result) => {
      if (result.isConfirmed) {
        this.anularGasto(activo);
      }
    });
  }

  goBackTo() {
    switch (this.mensa) {
      case "Gasto Caja Chica Anulado, Correctamente":
      case "Gasto Caja Chica Activado, Correctamente":
      case 'Error al Activar Gasto - Caja Chica':
        this.listarCajaChicaGastos(this.chk_btn)
    }
  }


  listarCajaChicaGastos(value: boolean) {
    console.log("value: ", value);
    if (value) {
      this.txt_chekbox = "ACTIVO"
    }
    else {
      this.txt_chekbox = "INACTIVO"
    }
    let post = {
      p_ccm_id: 0,
      p_ccv_id: this.datosCajaVale.ccv_id,
      p_ccm_activo: value
    };

    console.log(post);
    this.spinner.show();
    this.cajachicaService.listarCajaGastos(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        console.log(data);

        this.datosCajaChicaGastos = data;
        this.cajachicaService.dataCajaGastos = this.datosCajaChicaGastos

        // this.cajachicaService.ccv_id = data[0].ccv_id
        // console.log(this.cajachicaService.ccv_id);

        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
        });
      },
      error: (error: any) => {
        // this.errorSweetAlert();
        this.spinner.hide();
        console.log(error);
      },
    });
  }

  anularGasto(data: any) {
    console.log("data-numid: ", this.dataUsuario.numid);
    if (data !== 1) {
      this.ccm_activo = 1
      console.log("inactivo", this.ccm_activo);

    } else {
      this.ccm_activo = 0
      console.log("activo", this.ccm_activo);
    }

    let post = {
      p_ccm_id: this.ccm_id,
      p_ccm_activo: this.ccm_activo,
      p_ccm_usumov: this.dataUsuario.numid
    }
    console.log("post:", post);


    this.cajachicaService.anularGasto(post).subscribe({
      next: (data: any) => {
        console.log("data-result-gasto: ", data);
        this.mensa = data[0].mensa
        const errorCode = data[0].error
        const icon = this.getIconByErrorCode(errorCode)
        this.errorSweetAlert(icon, this.goBackTo.bind(this))
      }
    })
  }

  actualizarGastos() {
    this.listarCajaChicaGastos(this.chk_btn);
  }


  // ===================== FUNCIONES =====================

  // Obtener la fecha actual en formato "YYYY-MM-DD"
  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
  }


}
