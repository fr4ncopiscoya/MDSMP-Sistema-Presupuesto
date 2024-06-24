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
  dtTriggerModal: Subject<void> = new Subject<void>();
  // dtOptionsModal: any;
  dtOptionsModal: DataTables.Settings = {};



  //DATA
  datosCajaChica: any
  datosPeriodo: any

  cca_anyper: string;
  cca_id: number;

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
    private cajachicaService: CajachicaService
  ) {
    this.appComponent.login = false;
    // this.dataUsuario = localStorage.getItem('dataUsuario');
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
    const annoActual = fechaActual.getFullYear().toString();

    // Asignar el año a la propiedad `cca_anyper`
    this.cca_anyper = annoActual;
    this.cajachicaService.cca_anyper = this.cca_anyper

    // Mostrar el resultado en la consola
    console.log("Año actual: ", this.cca_anyper);


    this.consultarCajaChica();
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

  modalListarPeriodo(template: TemplateRef<any>, data: any) {
    this.modalRefs['listar-periodo'] = this.modalService.show(template, { id: 2, class: 'modal-lg', backdrop: 'static', keyboard: false });
  }

  //========================================================================================================================

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


  //=====================
  consultarCajaChica() {

    console.log("step 1");

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


        let postSel = {
          p_ccp_id: 0,
          p_cca_id: this.cca_id,
        };

        console.log("step 2");

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

    // let post = {
    //   p_ccp_id: 0,
    //   p_cca_id: 1,
    // };

    // console.log(post);
    // this.spinner.show();
    // this.cajachicaService.consultarCajaChicasel(post).subscribe({
    //   next: (data: any) => {
    //     this.spinner.hide();
    //     console.log(data);

    //     this.datosCajaChica = data;

    //     this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //       dtInstance.destroy();
    //       this.dtTrigger.next();
    //     });
    //   },
    //   error: (error: any) => {
    //     // this.errorSweetAlertData();
    //     this.spinner.hide();
    //     console.log(error);
    //   },
    // });

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
