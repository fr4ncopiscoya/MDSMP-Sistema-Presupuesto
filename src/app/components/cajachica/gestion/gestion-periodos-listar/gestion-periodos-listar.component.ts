import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService, Spinner } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { CajachicaService } from 'src/app/services/cajachica.service';

@Component({
  selector: 'app-gestion-periodos-listar',
  templateUrl: './gestion-periodos-listar.component.html',
  styleUrls: ['./gestion-periodos-listar.component.css']
})
export class GestionPeriodosListarComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  modalRefs: { [key: string]: BsModalRef } = {}; // Objeto para almacenar los modalRefs
  dtElement: any;
  dtElementModal: any;

  dtTrigger: Subject<void> = new Subject<void>();
  dtTriggerModal: Subject<void> = new Subject<void>();
  // dtOptionsModal: any;
  dtOptionsModal: DataTables.Settings = {};


  datosPeriodo: any;

  constructor(
    private cajachicaService: CajachicaService,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
  ) { }

  ngOnInit(): void {
    this.dtOptionsModal = {
      paging: true,
      pagingType: 'numbers',
      info: false,
      scrollY: '400px',
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
    this.dtTriggerModal.unsubscribe();
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
    this.dtTriggerModal.next();


    /* (document.querySelector('.dataTables_scrollBody') as HTMLElement).style.top = '150px'; */
  }

  modalListarPeriodo(template: TemplateRef<any>, data: any) {
    this.modalRefs['crear-periodo'] = this.modalService.show(template, { id: 3, class: 'bg-color', backdrop: 'static', keyboard: false });
    const secondModalBackdrop = document.getElementsByClassName('bg-color')[0]?.parentElement;
    if (secondModalBackdrop) {
      secondModalBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    }
  }


  // ====== MODALES =====
  cerrarModal(modalKey: string) {
    if (this.modalRefs[modalKey]) {
      this.modalRefs[modalKey].hide(); // Cierra el modal si está definido
    }
  }

  listarCajaApertura() {
    let post = {
      p_cca_id: 0,
      p_cca_anyper: Number(this.cajachicaService.cca_anyper)

    }

    this.cajachicaService.listarCajaAnual(post).subscribe({
      next: (data: any) => {
        // this.spinner.show()
        this.datosPeriodo = data
        console.log(data);

      }
    })
  }

}
