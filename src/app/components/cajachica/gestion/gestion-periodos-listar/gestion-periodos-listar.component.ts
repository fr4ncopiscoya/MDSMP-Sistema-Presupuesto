import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService, Spinner } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { CajachicaService } from 'src/app/services/cajachica.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-periodos-listar',
  templateUrl: './gestion-periodos-listar.component.html',
  styleUrls: ['./gestion-periodos-listar.component.css']
})
export class GestionPeriodosListarComponent implements OnInit {

  @Output() confirmClicked = new EventEmitter<number>()

  // MODAL
  // @ViewChild('template') miModal!: ElementRef;
  modalRefs: { [key: string]: BsModalRef } = {}; // Objeto para almacenar los modalRefs
  modalRef?: BsModalRef;
  //FORMULARIO

  @ViewChild(DataTableDirective, { static: false })
  dtElement: any;
  dtElementModal: any;

  dtTrigger: Subject<void> = new Subject<void>();
  dtTriggerModal: Subject<void> = new Subject<void>();
  // dtOptionsModal: any;
  dtOptionsModal: DataTables.Settings = {};


  dataUsuario: any
  datosPeriodo: any;
  dataCajaAny: any

  text_tittle: string;

  mensa: string;

  constructor(
    private cajachicaService: CajachicaService,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
  ) {
    const dataUser = localStorage.getItem('dataUsuario');
    this.dataUsuario = JSON.parse(dataUser)
  }

  ngOnInit(): void {
    this.dtOptionsModal = {
      paging: true,
      pagingType: 'numbers',
      info: false,
      scrollY: '300px',
      order: [['0', 'asc']],
      columnDefs: [
        // { width: '500px', targets: 2 },
      ],
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json"
      },
    }
    this.listarCajaApertura()
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
        console.log("step 1");

        this.cerrarPeriodo(data.cca_id);
      }
    });

  }

  emitir(data: number) {
    console.log("llegaste");
    this.confirmClicked.emit(data);
    this.modalService.hide(2)
  }

  cerrarPeriodo(cca_id: any) {
    console.log("step 2");

    let post = {
      p_cca_id: cca_id,
      p_cca_usumov: this.dataUsuario.numid
    }
    this.cajachicaService.cerrarCajaPeriodo(post).subscribe({
      next: (data: any) => {
        console.log("data-cerrarCaja:", data);
        this.mensa = data[0].mensa
        const errorCode = data[0].error

        const icon = this.getIconByErrorCode(errorCode)

        this.errorSweetAlert(icon, this.goBackTo.bind(this))
      }
    })
  }

  goBackTo() {
    setTimeout(() => {
      switch (this.mensa) {
        case 'Cierre Apertura Anual Actualizada Correctamente':
          // case 'Vale Caja Actualizado Correctamente':
          // this.modalService.hide(3)
          this.listarCajaApertura();
          break;
        default:
          //
          break;
      }
    });
  }

  modalRegistrarPeriodo(template: TemplateRef<any>, data: any) {
    let value = 0;

    if (data !== undefined) {
      value = data;
    }
    this.textValue(value);

    this.modalRefs['crear-periodo'] = this.modalService.show(template, { id: 3, class: 'bg-color', backdrop: 'static', keyboard: false });
    const secondModalBackdrop = document.getElementsByClassName('bg-color')[0]?.parentElement;
    if (secondModalBackdrop) {
      secondModalBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    }
  }

  textValue(data: any) {
    if (data !== null) {
      this.cajachicaService.dataCajaAny = data
      this.text_tittle = 'Editar';
    }
    else {
      this.cajachicaService.dataCajaAny = null
      this.text_tittle = 'Registrar'
    }
  }


  // ====== MODALES =====
  cerrarModal(modalKey: string) {
    if (this.modalRefs[modalKey]) {
      this.modalRefs[modalKey].hide(); // Cierra el modal si está definido
    }
  }

  actualizarData() {
    this.listarCajaApertura();
  }

  listarCajaApertura() {
    let post = {
      p_cca_id: 0,
      p_cca_anyper: 0
    };

    console.log(post);
    // this.spinner.show();
    this.cajachicaService.listarCajaAnual(post).subscribe({
      next: (data: any) => {
        // this.spinner.hide();
        console.log("data-periodo: ", data);
        this.datosPeriodo = data;
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
        });
      },
      error: (error: any) => {
        // this.();
        this.spinner.hide();
        console.log(error);
      },
    });

  }

  // listarCajaApertura() {
  //   let post = {
  //     p_cca_id: 0,
  //     p_cca_anyper: 0
  //   }
  //   this.cajachicaService.listarCajaAnual(post).subscribe({
  //     next: (data: any) => {
  //       // this.spinner.show()
  //       this.datosPeriodo = data

  //       this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //         dtInstance.destroy();
  //         this.dtTrigger.next();
  //       });
  //     },
  //     error: (error: any) => {
  //       this.spinner.hide();
  //       console.log(error);
  //     },

  //   })
  // }

}
