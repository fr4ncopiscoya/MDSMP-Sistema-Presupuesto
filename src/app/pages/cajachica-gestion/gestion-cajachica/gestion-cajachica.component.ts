import {
  Component, OnInit, ViewChild,
  TemplateRef,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CajachicaService } from 'src/app/services/cajachica.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-gestion-cajachica',
  templateUrl: './gestion-cajachica.component.html',
  styleUrls: ['./gestion-cajachica.component.css']
})
export class GestionCajachicaComponent implements OnInit {
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
  // dtTriggerModal: Subject<void> = new Subject<void>();
  // dtOptionsModal: any;
  dtOptionsModal: DataTables.Settings = {};

  btnVerData: boolean = true;



  txt_tittle: string = ''

  //DATA
  datosCajaChica: any
  datosPeriodo: any
  dataUsuario: any

  cca_anyper: number;
  cca_id: number;

  mensa: string;

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
    private cajachicaService: CajachicaService
  ) {
    this.appComponent.login = false;
    const datauser = localStorage.getItem('dataUsuario');
    this.dataUsuario = JSON.parse(datauser)
  }

  ngOnInit(): void {
    this.dtOptionsModal = {
      // paging: true,
      // pagingType: 'numbers',
      info: false,
      scrollY: '400px',
      columnDefs: [
        // { width: '500px', targets: 2 },
      ],
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json"
      },
    }

    // Obtener el año actual
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear().toString();

    // Asignar el año a la propiedad `cca_anyper`
    this.cca_anyper = Number(anioActual);
    this.cajachicaService.cca_anyper = this.cca_anyper

    // Mostrar el resultado en la consola
    console.log("Año actual: ", this.cca_anyper);


    this.consultarCajaChica();
  }


  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    // this.dtTriggerModal.unsubscribe();
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
    // this.dtTriggerModal.next();


    /* (document.querySelector('.dataTables_scrollBody') as HTMLElement).style.top = '150px'; */
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
        this.cerrarApertura(data.ccp_id);
      }
    });
  }

  modalListarPeriodo(template: TemplateRef<any>, data: any) {
    this.modalRefs['listar-periodo'] = this.modalService.show(template, { id: 2, class: 'modal-lg', backdrop: 'static', keyboard: false });
  }

  modalRegistarCajachica(template: TemplateRef<any>, data: any, ver: boolean) {
    let value = 0;
    // Si hay data y ccv_id está definido, usar ese valor
    if (data !== undefined) {
      value = data;
    }
    this.textValue(value);
    this.btnVerData = ver;
    if (this.btnVerData === false) {
      this.txt_tittle = 'Ver'
    }

    this.modalRefs['registar-cajachica'] = this.modalService.show(template, { id: 3, class: '', backdrop: 'static', keyboard: false });
  }

  //========================================================================================================================

  textValue(data: any) {
    // console.log("data-cajachica: ", data);

    if (data !== null) {
      this.cajachicaService.dataCajachica = data
      this.txt_tittle = 'Editar';
    }
    else {
      this.cajachicaService.dataCajachica = null
      this.txt_tittle = 'Registrar'
    }
  }

  //DIGITAR UNICAMENTE NUMEROS
  validarNumero(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode < 48 || keyCode > 57) {
      event.preventDefault();
    }
  }

  onInputChange(event: any) {
    event.target.value = event.target.value.toUpperCase();
  }

  // Obtener la fecha actual en formato "YYYY-MM-DD"
  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
  }


  // ====== MODALES =====
  cerrarModal(modalKey: string) {
    if (this.modalRefs[modalKey]) {
      this.modalRefs[modalKey].hide(); // Cierra el modal si está definido
    }
  }

  confirmClick(value: number) {
    console.log("value", value);
    this.cca_anyper = value
    this.cajachicaService.cca_anyper = this.cca_anyper
    this.consultarCajaChica()
  }

  actualizarData() {
    console.log("estas llegando");

    this.consultarCajaChica()
  }

  goBackTo() {
    switch (this.mensa) {
      case 'Cierre Apertura Caja Chica Actualizada Correctamente':
        // case 'Apertura Caja Actualizado Correctamente':
        // this.modalService.hide(3);
        this.consultarCajaChica()
        break;
      default:
        //
        break;
    }
  }

  //=====================
  consultarCajaChica() {
    let post = {
      p_cca_id: 0,
      p_cca_anyper: Number(this.cajachicaService.cca_anyper)
    }

    this.cajachicaService.listarCajaAnual(post).subscribe({
      next: (data: any) => {
        // this.spinner.show()
        this.datosPeriodo = data
        this.cca_id = data[0].cca_id
        this.cajachicaService.cca_id = this.cca_id

        console.log("datos-periodo: ", this.datosPeriodo);

        let postSel = {
          p_ccp_id: 0,
          p_cca_id: this.cca_id,
        };
        console.log(postSel);
        this.spinner.show();
        this.cajachicaService.consultarCajaChicasel(postSel).subscribe({
          next: (data: any) => {
            this.spinner.hide();
            console.log(data);

            this.datosCajaChica = data;

            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.destroy();
              this.dtTrigger.next();
            });
          },
          error: (error: any) => {
            this.spinner.hide();
            console.log(error);
          },
        });

      }
    })
  }

  cerrarApertura(ccp_id: any) {
    console.log("ccp_id: ", ccp_id);

    let post = {
      p_ccp_id: ccp_id,
      p_ccp_usumov: this.dataUsuario.numid
    }
    console.log("post-cerrarCaja: ", post);

    this.cajachicaService.cerrarCajaApertura(post).subscribe({
      next: (data: any) => {
        console.log("data-cerrarCaja:", data);
        this.mensa = data[0].mensa
        const errorCode = data[0].error

        const icon = this.getIconByErrorCode(errorCode)

        this.errorSweetAlert(icon, this.goBackTo.bind(this))
      }
    })
  }

  goAperturaVales(data: any) {
    try {
      const dataVal = JSON.stringify(data);
      localStorage.setItem('data', dataVal);
      this.router.navigateByUrl('/cajachica-gestion-vales');
    } catch (error) {
      console.error('Error stringifying data:', error);
    }
  }
}
